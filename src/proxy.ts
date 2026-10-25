import { NextResponse, type NextRequest } from "next/server";

import { siteConfig } from "@/config/site";
import { tryGetAdminSessionSecret } from "@/lib/auth/env";
import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/session-token";
import { notionPageIdSchema } from "@/lib/invoice-schema";

// 견적서 URL의 ID 형식 검사 (D12)
// 형식이 틀린 요청은 정적 404 라우트(`/invoice/invalid-id`)로 rewrite해 HTTP 404와 견적서 404 화면을 돌려준다.
// 주소창 URL은 바뀌지 않는다(리디렉션하지 않음).
// 견적서 라우트에 그대로 `status: 404`만 주면 개발 서버에서만 404가 되고, 프로덕션에서는 PPR 셸이 200으로 나간다
// 노션 조회는 하지 않는다. 형식은 맞지만 없는 견적서는 페이지에서 notFound()로 처리한다

// 형식 오류 rewrite 대상 (`src/app/invoice/invalid-id/page.tsx`)
const INVALID_ID_PATH = "/invoice/invalid-id";

// 서비스 안내 페이지 (`(marketing)/invoice/guide`)
const GUIDE_SEGMENT = "guide";

function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    // 잘못된 퍼센트 인코딩
    return null;
  }
}

function isAllowedSegment(segment: string): boolean {
  if (segment === GUIDE_SEGMENT) return true;
  return notionPageIdSchema.safeParse(segment).success;
}

function handleInvoice(request: NextRequest) {
  // `/invoice/<segment>[/...]`의 첫 세그먼트만 본다. 하위 경로는 라우트가 없어 Next.js가 404로 처리한다
  const [, , rawSegment] = request.nextUrl.pathname.split("/");
  if (!rawSegment) return NextResponse.next();

  const segment = decodeSegment(rawSegment);
  if (segment !== null && isAllowedSegment(segment)) return NextResponse.next();

  // 프로덕션은 정적 404 라우트 덕분에 404가 되고, 개발 서버(요청마다 렌더링, 루트 loading.tsx가 먼저 스트리밍)는
  // 이 status로 404가 된다
  return NextResponse.rewrite(new URL(INVALID_ID_PATH, request.url), {
    status: 404,
  });
}

// 관리자 경로 인증 (D15 1번)
// 쿠키 토큰의 서명·만료만 검사하는 낙관적 검사다 (조회 없음). 프리페치 요청도 이 proxy를 지나므로 가볍게 유지한다
// 데이터를 읽는 쪽은 DAL(`verifyAdminSession`)이 다시 검사하므로 이 검사가 유일한 방어선이 아니다
// 모든 관리자 응답에 `X-Robots-Tag: noindex`를 붙인다 (리디렉션 포함)
async function handleAdmin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLoginPath =
    pathname === siteConfig.adminLoginPath ||
    pathname === `${siteConfig.adminLoginPath}/`;

  // 비밀 키가 없거나 잘못되면 어떤 토큰도 통과시키지 않는다
  const secret = tryGetAdminSessionSecret();
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const hasSession = secret ? await verifySessionToken(token, secret) : false;

  let response: NextResponse;
  if (isLoginPath) {
    // 로그인된 상태로 로그인 화면을 열면 목적지로 보낸다. GET·HEAD만 해당하고,
    // 로그인 Server Action(POST)은 항상 통과시킨다
    const isPageRequest = request.method === "GET" || request.method === "HEAD";
    if (hasSession && isPageRequest) {
      const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
      response = NextResponse.redirect(new URL(next, request.url));
    } else {
      response = NextResponse.next();
    }
  } else if (hasSession) {
    response = NextResponse.next();
  } else {
    const loginUrl = new URL(siteConfig.adminLoginPath, request.url);
    loginUrl.searchParams.set("next", sanitizeNextPath(`${pathname}${search}`));
    response = NextResponse.redirect(loginUrl);
  }

  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname === siteConfig.adminPath ||
    pathname.startsWith(`${siteConfig.adminPath}/`)
  ) {
    return handleAdmin(request);
  }
  if (pathname === "/invoice" || pathname.startsWith("/invoice/")) {
    return handleInvoice(request);
  }
  // matcher 밖의 경로는 오지 않지만, 어느 분기에도 해당하지 않으면 그대로 통과시킨다
  return NextResponse.next();
}

export const config = {
  matcher: ["/invoice/:path*", "/admin/:path*"],
};
