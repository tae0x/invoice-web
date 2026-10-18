import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { CodeBlock } from "@/components/docs/code-block";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "레이아웃 예제",
};

// 와이어프레임에서 쓰는 공통 블록
function Block({ className }: { className?: string }) {
  return <div className={`rounded bg-muted-foreground/20 ${className ?? ""}`} />;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="h-36 overflow-hidden rounded-md border bg-background p-2"
    >
      {children}
    </div>
  );
}

const layouts = [
  {
    title: "헤더 + 본문 + 푸터",
    description: "마케팅 페이지의 기본 구조입니다. 헤더는 상단에 고정됩니다.",
    file: "src/app/(marketing)/layout.tsx",
    href: "/",
    action: "랜딩 페이지 보기",
    preview: (
      <Frame>
        <div className="flex h-full flex-col gap-1.5">
          <Block className="h-4" />
          <Block className="flex-1 bg-muted-foreground/10" />
          <Block className="h-3" />
        </div>
      </Frame>
    ),
  },
  {
    title: "사이드바 앱 셸",
    description: "접이식 사이드바 + 상단바 + 본문. 모바일에서는 시트로 전환됩니다.",
    file: "src/app/(app-shell)/examples/sidebar-layout/layout.tsx",
    href: "/examples/sidebar-layout",
    action: "직접 열어보기",
    preview: (
      <Frame>
        <div className="flex h-full gap-1.5">
          <Block className="w-1/5" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Block className="h-4" />
            <Block className="flex-1 bg-muted-foreground/10" />
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: "문서형 2단",
    description: "좌측 내비게이션 + 본문. 좁은 화면에서는 메뉴가 시트로 열립니다.",
    file: "src/app/(marketing)/docs/layout.tsx",
    href: "/docs",
    action: "문서 보기",
    preview: (
      <Frame>
        <div className="flex h-full flex-col gap-1.5">
          <Block className="h-4" />
          <div className="flex flex-1 gap-1.5">
            <div className="flex w-1/4 flex-col gap-1">
              <Block className="h-2" />
              <Block className="h-2" />
              <Block className="h-2" />
            </div>
            <Block className="flex-1 bg-muted-foreground/10" />
          </div>
        </div>
      </Frame>
    ),
  },
  {
    title: "중앙 정렬 카드",
    description: "로그인·가입처럼 한 가지 작업에 집중하는 화면입니다.",
    file: "src/app/(marketing)/login/page.tsx",
    href: "/login",
    action: "로그인 화면 보기",
    preview: (
      <Frame>
        <div className="flex h-full items-center justify-center">
          <Block className="h-20 w-2/5 bg-muted-foreground/10" />
        </div>
      </Frame>
    ),
  },
  {
    title: "반응형 카드 그리드",
    description: "화면 폭에 따라 1 → 2 → 3열로 늘어나는 목록입니다.",
    file: "src/app/(marketing)/page.tsx",
    href: "/#features",
    action: "랜딩의 기능 목록",
    preview: (
      <Frame>
        <div className="grid h-full grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Block key={index} className="bg-muted-foreground/10" />
          ))}
        </div>
      </Frame>
    ),
  },
];

export default function LayoutsExamplePage() {
  return (
    <>
      <PageHeader
        title="레이아웃 예제"
        description="자주 쓰는 레이아웃 패턴과 그 구현 위치입니다. 라우트 그룹마다 다른 layout.tsx를 적용합니다."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layouts.map((layout) => (
          <Card key={layout.title}>
            <CardHeader>
              <CardTitle>{layout.title}</CardTitle>
              <CardDescription>{layout.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {layout.preview}
              <p className="font-mono text-xs break-all text-muted-foreground">
                {layout.file}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={layout.href} />}
                nativeButton={false}
              >
                {layout.action}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          라우트 그룹으로 레이아웃 나누기
        </h2>
        <p className="text-sm text-muted-foreground">
          폴더 이름을 괄호로 감싸면 URL에는 드러나지 않고 레이아웃만 공유합니다.
        </p>
        <CodeBlock
          title="src/app/(marketing)/layout.tsx"
          code={`import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}`}
        />
      </section>
    </>
  );
}
