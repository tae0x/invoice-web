import "server-only";

import { siteConfig } from "@/config/site";
import { verifyAdminSession } from "@/lib/auth/dal";
import { buildInvoiceUrl, normalizeBaseUrl } from "@/lib/invoice-url";
import { listInvoices } from "@/lib/notion/invoice-list";
import type { InvoiceListItem } from "@/types/invoices";

// 관리자 견적서 목록 DAL (D15·D17·D18)
// 화면 코드는 `listInvoices`를 직접 부르지 않고 이 함수만 쓴다 (인증 검사가 항상 먼저 실행되도록)

// 화면용 목록 행: 복사할 공개 URL을 서버에서 미리 만들어 붙인다 (ID 형식이나 기준 URL이 올바르지 않으면 null)
export type AdminInvoiceListItem = InvoiceListItem & { url: string | null };

export type AdminInvoiceListResult = {
  invoices: AdminInvoiceListItem[];
  // 행 상한에 걸려 일부만 담았는지 여부
  truncated: boolean;
  // 프로덕션인데 기준 URL이 localhost이거나 올바른 URL이 아니라 복사한 링크를 다른 사람이 열 수 없는지 (D18)
  // 빈 값은 `next build`가 먼저 실패시키므로 실제 주된 경로는 빌드를 통과한 localhost·비정상 URL이다
  showBaseUrlWarning: boolean;
};

// 기준 URL이 공개 링크로 쓸 수 없는 값인지: 로컬 주소이거나 올바른 URL이 아니다
// 프로덕션에서 `NEXT_PUBLIC_SITE_URL`이 빈 값이면 빌드 단계에서 먼저 실패하므로, 여기에 도달하는 값은
// 빌드가 통과한 localhost나 비정상 URL이 주된 경우다. 빈 값 분기는 빌드 검사가 바뀌어도 안전하도록 남긴 방어 코드다
// `buildInvoiceUrl`이 거부하는 값(공백·query·계정 정보 등)도 같은 규칙(`normalizeBaseUrl`)으로 걸러 경고에 포함한다
function isUnusableBaseUrl(baseUrl: string): boolean {
  const base = normalizeBaseUrl(baseUrl);
  if (base === null) return true;

  const { hostname } = new URL(base);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    // IPv6 loopback: Node의 URL은 대괄호를 포함해 돌려주지만 환경에 따라 없을 수 있어 둘 다 인식한다
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

// 세션을 서버에서 다시 검사한 뒤 노션 목록을 조회한다
// `cookies()`와 노션 호출이 모두 일어나므로 Suspense 경계 안의 컴포넌트에서만 호출한다
// throw: 세션 없음은 로그인으로 redirect, 노션 오류는 NotionRequestError (관리자 error.tsx가 처리)
export async function getAdminInvoiceList(): Promise<AdminInvoiceListResult> {
  await verifyAdminSession();
  const { invoices, truncated } = await listInvoices();

  return {
    invoices: invoices.map((invoice) => ({
      ...invoice,
      url: buildInvoiceUrl(invoice.id),
    })),
    truncated,
    showBaseUrlWarning:
      process.env.NODE_ENV === "production" &&
      isUnusableBaseUrl(siteConfig.url),
  };
}
