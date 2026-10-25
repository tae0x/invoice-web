import { NextResponse, type NextRequest } from "next/server";

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

export function proxy(request: NextRequest) {
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

export const config = {
  matcher: "/invoice/:path*",
};
