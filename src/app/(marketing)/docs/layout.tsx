import { Container } from "@/components/common/container";
import { DocPager } from "@/components/docs/doc-pager";
import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsNav } from "@/components/docs/docs-nav";

// 문서 공통 레이아웃: 좌측 내비게이션(데스크톱) + 본문 + 이전/다음 링크
export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <Container className="flex-1 py-8">
      <div className="mb-6 md:hidden">
        <DocsMobileNav />
      </div>
      <div className="grid gap-10 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <div className="sticky top-20">
            <DocsNav />
          </div>
        </aside>
        <div className="min-w-0 max-w-3xl">
          {children}
          <DocPager />
        </div>
      </div>
    </Container>
  );
}
