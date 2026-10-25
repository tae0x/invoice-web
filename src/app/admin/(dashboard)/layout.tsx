import { Container } from "@/components/common/container";
import { AdminHeader } from "@/components/layout/admin-header";

import { logout } from "./actions";

// 관리자 대시보드 레이아웃: 상단바 + 넓은 본문 (로그인 화면은 이 그룹 밖이라 상단바가 없다)
// 세션·쿠키는 읽지 않는다 (차단은 proxy, 서버 재검사는 데이터를 읽는 Suspense 안 컴포넌트의 DAL이 한다)
// 목록 표의 열이 많아 max-w-6xl(1152px)로 넓힌다
export default function AdminDashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  return (
    <>
      <AdminHeader logoutAction={logout} />
      <main className="flex flex-1 flex-col py-8 sm:py-12">
        <Container className="flex flex-1 flex-col lg:max-w-6xl">
          {children}
        </Container>
      </main>
    </>
  );
}
