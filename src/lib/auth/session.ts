import "server-only";

import { cookies } from "next/headers";

import { siteConfig } from "@/config/site";

import { getAdminSessionSecret } from "./env";
import { signSessionToken } from "./session-token";

// 관리자 세션 쿠키 (D15): HttpOnly, Secure(프로덕션), SameSite=Lax, Path=/admin, Max-Age 8시간
export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

// 쿠키 경로는 관리자 영역으로 한정한다 (견적서 공개 페이지 요청에는 실리지 않는다)
const COOKIE_PATH = siteConfig.adminPath;

// 만료 시각을 서명한 토큰을 쿠키로 발급한다 (Server Action 등 쿠키를 쓸 수 있는 곳에서만 호출)
export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const token = await signSessionToken(expiresAt, getAdminSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    // 개발 서버(http://localhost)에서는 Secure 쿠키가 저장되지 않을 수 있어 프로덕션에서만 켠다
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
}

// 쿠키 삭제는 발급 때와 같은 Path여야 지워진다
export async function deleteAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE, path: COOKIE_PATH });
}
