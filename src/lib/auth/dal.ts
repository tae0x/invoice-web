import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { siteConfig } from "@/config/site";

import { tryGetAdminSessionSecret } from "./env";
import { ADMIN_SESSION_COOKIE } from "./session";
import { verifySessionToken } from "./session-token";

// 관리자 세션을 서버에서 다시 검사한다 (D15 2번). proxy는 낙관적 검사일 뿐이므로 데이터를 읽기 직전에 호출한다
// `cookies()`를 쓰므로 Suspense 경계 안의 컴포넌트·Server Action·Route Handler에서만 호출한다
// 레이아웃 최상단에서 호출하면 `{children}` 전체가 요청을 기다린다
// 실패하면 로그인 화면으로 redirect한다 (반환하지 않음). 같은 요청 안에서는 한 번만 검사한다
export const verifyAdminSession = cache(async (): Promise<void> => {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  // 토큰 만료 검사가 Date.now()를 쓴다. 프리페치 때의 런타임 프리렌더에서 "불안정한 값" 오류가 나지 않도록
  // 실제 요청 시점까지 렌더링을 멈춘다 (이 아래의 노션 조회도 프리페치로 실행되지 않는다)
  await connection();
  const secret = tryGetAdminSessionSecret();

  if (!secret || !(await verifySessionToken(token, secret))) {
    redirect(siteConfig.adminLoginPath);
  }
});
