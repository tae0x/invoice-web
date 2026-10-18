import { Container } from "@/components/common/container";
import { siteConfig } from "@/config/site";

// 마케팅 영역 하단 푸터
export function SiteFooter() {
  return (
    <footer className="border-t py-6">
      <Container className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {siteConfig.name}. All rights reserved.
        </p>
        <p>Next.js · TypeScript · Tailwind CSS · shadcn/ui</p>
      </Container>
    </footer>
  );
}
