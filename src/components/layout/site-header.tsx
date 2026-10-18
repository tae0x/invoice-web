import Link from "next/link";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";

// 마케팅 영역 상단 헤더
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <Container className="flex h-14 items-center gap-4">
        <MobileNav />
        <Logo />
        <div className="hidden md:flex">
          <MainNav />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button render={<Link href="/docs/getting-started" />} nativeButton={false}>
            시작하기
          </Button>
        </div>
      </Container>
    </header>
  );
}
