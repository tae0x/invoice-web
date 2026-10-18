import type { Metadata } from "next";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";

export const metadata: Metadata = {
  title: "프로젝트 구조",
};

const layers = [
  ["L0 Foundation", "src/app/globals.css, src/lib/utils.ts, src/config/site.ts, src/stores/, src/hooks/","스타일 토큰, 설정, 전역 상태"],
  ["L1 Primitives", "src/components/ui/", "shadcn 원본 (CLI로만 추가)"],
  ["L2 Common", "src/components/common/", "ui를 조합한 재사용 블록 (로고, 테마 토글 등)"],
  ["L2 Docs/Examples", "src/components/docs/, src/components/examples/", "문서·예제 페이지 전용 블록 (코드 블록, 훅 데모 등)"],
  ["L3 Layout", "src/components/layout/", "헤더, 푸터, 사이드바 등 영역 단위 조립체"],
  ["L4 Providers", "src/components/providers/", "ThemeProvider 등 컨텍스트"],
  ["L5 Templates", "src/app/**/layout.tsx", "라우트 그룹별 레이아웃"],
  ["L6 Pages", "src/app/**/page.tsx", "페이지"],
];

export default function ProjectStructurePage() {
  return (
    <DocContent
      title="프로젝트 구조"
      description="폴더가 곧 계층입니다. 어디에 무엇을 두는지 한눈에 확인하세요."
    >
      <h2 id="layers">컴포넌트 계층</h2>
      <p>
        의존 방향은 아래에서 위로만 갑니다. 즉 상위 계층만 하위 계층을 import
        합니다.
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-3 py-2 font-medium">계층</th>
              <th className="px-3 py-2 font-medium">위치</th>
              <th className="px-3 py-2 font-medium">역할</th>
            </tr>
          </thead>
          <tbody>
            {layers.map(([layer, path, role]) => (
              <tr key={layer} className="border-t">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{layer}</td>
                <td className="px-3 py-2 font-mono text-xs">{path}</td>
                <td className="px-3 py-2 text-muted-foreground">{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="routes">라우트 구성</h2>
      <CodeBlock
        title="src/app/"
        code={`src/app/
├─ layout.tsx                  루트 레이아웃 (폰트, 테마, 토스트)
├─ loading.tsx / error.tsx / global-error.tsx / not-found.tsx
├─ (marketing)/                헤더 + 푸터 레이아웃
│  ├─ page.tsx                 랜딩 (/)
│  ├─ login/                   로그인 폼 (/login)
│  ├─ signup/                  회원가입 폼 (/signup)
│  ├─ docs/                    문서 (/docs/*)
│  └─ examples/                예제 (/examples/*)
└─ (app-shell)/examples/sidebar-layout/
                               사이드바 앱 셸 예제`}
      />
      <p>
        <code>(marketing)</code>처럼 괄호로 감싼 폴더는 라우트 그룹입니다. URL에는
        드러나지 않고, 그룹마다 다른 <code>layout.tsx</code>를 적용할 때 씁니다.
      </p>

      <h2 id="rules">코드 작성 규칙</h2>
      <ul>
        <li>
          서버 컴포넌트가 기본이며, 상호작용이 필요한 말단 컴포넌트에만{" "}
          <code>&quot;use client&quot;</code>를 씁니다.
        </li>
        <li>
          사이트 이름, 네비게이션, 브레드크럼 라벨은 <code>src/config/site.ts</code>{" "}
          한 곳에서 관리합니다.
        </li>
        <li>
          경로 별칭은 <code>@/</code>(<code>src/</code>)입니다.
        </li>
        <li>
          <code>src/components/ui</code>는 shadcn CLI로 추가한 원본이므로 직접 수정을
          최소화합니다.
        </li>
        <li>
          클래스 병합은 <code>cn</code>을 사용합니다.
        </li>
      </ul>
      <CodeBlock
        title="cn 사용 예"
        code={`import { cn } from "cn";

<div className={cn("p-4", isActive && "bg-muted", className)} />`}
      />

      <h2 id="layout-props">레이아웃 타입</h2>
      <p>
        레이아웃은 전역 타입 헬퍼 <code>LayoutProps</code>를 사용합니다. 경로
        문자열을 넘기면 해당 라우트의 슬롯(<code>children</code> 등)이 타입에
        반영됩니다.
      </p>
      <CodeBlock
        title="src/app/(marketing)/docs/layout.tsx"
        code={`export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return <div>{children}</div>;
}`}
      />
    </DocContent>
  );
}
