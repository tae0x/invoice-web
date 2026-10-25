import { siteConfig } from "@/config/site";

// 로그인 후 이동할 경로(`next`) 검증 (D15)
// 관리자 영역(`/admin`, `/admin/...`)의 상대 경로만 허용하고, 그 외는 모두 `/admin`으로 돌린다
// 오픈 리디렉트 방지: `//host`, `https://host`, `/invoice/...`, 백슬래시·제어 문자·`..` 포함 경로를 거른다
export function sanitizeNextPath(value: unknown): string {
  const fallback = siteConfig.adminPath;
  if (typeof value !== "string" || value.length > 2048) return fallback;

  // 제어 문자(CR/LF 포함)와 백슬래시는 브라우저가 다르게 해석할 수 있다
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;
  if (value.startsWith("//")) return fallback;

  // `/admin` 정확히, 또는 `/admin` 뒤에 `/`·`?`·`#`이 오는 경우만 (`/administrator` 등 차단)
  const isAdminPath = /^\/admin(?:[/?#]|$)/.test(value);
  if (!isAdminPath) return fallback;

  const pathname = value.split(/[?#]/, 1)[0];
  if (pathname.split("/").includes("..")) return fallback;

  // 로그인 화면 자신으로 돌아가면 의미가 없으므로 목록으로 보낸다
  const loginPath = siteConfig.adminLoginPath;
  if (pathname === loginPath || pathname === `${loginPath}/`) return fallback;

  return value;
}
