import type { Metadata } from "next";

// 관리자 영역은 검색 엔진에 노출하지 않는다 (D15)
// "페이지 metadata는 title만" 규칙의 의도적 예외: robots는 하위 모든 페이지에 적용돼야 하므로 레이아웃에 둔다
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// 관리자 영역 공통 레이아웃: 래퍼 마크업만 둔다 (인증 검사는 proxy와 DAL이 한다)
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
