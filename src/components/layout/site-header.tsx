import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";

// 마케팅 영역 상단 헤더
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <Container className="flex h-14 items-center gap-4">
        <Logo />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
