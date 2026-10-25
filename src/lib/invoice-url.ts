import { siteConfig } from "@/config/site";
import { notionPageIdSchema } from "@/lib/invoice-schema";

// 기준 URL을 http(s) 절대 URL로 해석한다. 빈 문자열·상대 경로·다른 프로토콜이면 null
function parseBaseUrl(baseUrl: string): URL | null {
  try {
    const url = new URL(baseUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

// 링크 기준 URL을 정규화한다: `origin` + 경로 prefix(끝 `/` 없음). 쓸 수 없는 값이면 null
// 거부 규칙(관리자 화면의 기준 URL 경고도 이 함수를 쓰므로 규칙이 한곳에만 있다):
// - http(s)만 허용. `//` 없는 `http:foo` 형태는 URL 파서가 통과시키므로 원문에서 확인한다
// - 공백(앞뒤·중간의 탭·개행 포함)·query·hash·계정 정보(`user:pw@`)는 거부한다. 환경 변수에 섞인 공백은 설정 실수이므로
//   `new URL`처럼 조용히 고치지 않고 경고로 드러내는 편이 낫다
// - 경로 prefix(`https://a.com/app/`)는 유지하고 연속된 `/`와 끝의 `/`만 정리한다
// 프로덕션에서 빈 값은 `next build`가 먼저 실패시키므로, 실제로는 localhost·비정상 URL이 주된 대상이다
export function normalizeBaseUrl(baseUrl: string): string | null {
  if (/\s/.test(baseUrl)) return null;
  if (!/^https?:\/\//i.test(baseUrl)) return null;
  // 빈 `?`·`#`는 URL 객체의 search·hash가 빈 문자열이라 구별되지 않으므로 원문에서 막는다
  if (baseUrl.includes("?") || baseUrl.includes("#")) return null;

  const url = parseBaseUrl(baseUrl);
  if (url === null) return null;
  if (url.username !== "" || url.password !== "") return null;

  // 검증한 URL 객체로 조립한다: origin(소문자 호스트·기본 포트 정리)과 정규화된 경로를 쓴다
  const path = url.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  return `${url.origin}${path}`;
}

// 견적서 공개 URL 생성 (D18). 서버·클라이언트 공용 순수 함수이며 복사 링크는 이 함수 하나로 만든다
// ID는 하이픈 없는 소문자 32자리로 정규화하고, ID 형식이나 기준 URL이 올바르지 않으면 null을 반환한다
export function buildInvoiceUrl(
  invoiceId: string,
  baseUrl: string = siteConfig.url,
): string | null {
  const parsed = notionPageIdSchema.safeParse(invoiceId);
  if (!parsed.success) return null;

  const base = normalizeBaseUrl(baseUrl);
  if (base === null) return null;
  return `${base}/invoice/${parsed.data}`;
}
