import Link from "next/link";
import { LogOut } from "lucide-react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

type AdminHeaderProps = {
  // 로그아웃 Server Action. 계층 규칙상 layout 컴포넌트는 app/을 import할 수 없어 레이아웃이 넘겨 준다
  logoutAction: () => Promise<void>;
};

// 관리자 상단바: 세션을 읽지 않는 정적 서버 컴포넌트다 (로그아웃 form만 액션에 연결한다)
export function AdminHeader({ logoutAction }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <Container className="flex h-14 items-center gap-4 lg:max-w-6xl">
        <Logo
          href={siteConfig.adminPath}
          className="shrink-0 whitespace-nowrap"
        />
        <nav aria-label="관리자 메뉴">
          <Link
            href={siteConfig.adminPath}
            className="text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
          >
            견적서 목록
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              aria-label="로그아웃"
            >
              <LogOut aria-hidden="true" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </form>
        </div>
      </Container>
    </header>
  );
}
