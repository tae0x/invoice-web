import type { Metadata } from "next";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";

export const metadata: Metadata = {
  title: "테마",
};

export default function ThemingDocPage() {
  return (
    <DocContent
      title="테마"
      description="라이트·다크·시스템 테마와 디자인 토큰을 다루는 방법입니다."
    >
      <h2 id="dark-mode">다크 모드</h2>
      <p>
        <code>next-themes</code>의 <code>ThemeProvider</code>가 루트 레이아웃에
        적용되어 있어 <code>html</code>에 <code>dark</code> 클래스가 붙고
        떼어집니다. 상단의 테마 버튼(<code>ThemeToggle</code>)으로 라이트 / 다크 /
        시스템을 전환할 수 있습니다.
      </p>
      <CodeBlock
        title="컴포넌트에서 테마 변경"
        code={`"use client";

import { useTheme } from "next-themes";

export function Example() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme("dark")}>현재: {theme}</button>;
}`}
      />
      <p>
        <code>theme</code> 값은 서버 렌더링 시 알 수 없으므로, 값에 따라 UI를
        바꿀 때는 Tailwind의 <code>dark:</code> 변형으로 CSS에서 처리하는 편이
        hydration 문제를 피할 수 있습니다.
      </p>
      <CodeBlock
        title="CSS로 아이콘 전환 (theme-toggle.tsx)"
        code={`<Sun className="dark:hidden" />
<Moon className="hidden dark:block" />`}
      />

      <h2 id="tokens">디자인 토큰</h2>
      <p>
        색상은 <code>src/app/globals.css</code>의 CSS 변수(<code>--background</code>,{" "}
        <code>--primary</code> 등)로 정의되어 있으며, <code>:root</code>와{" "}
        <code>.dark</code>에서 각각 값을 지정합니다. 값을 바꾸면 모든 컴포넌트에
        반영됩니다.
      </p>
      <CodeBlock
        title="Tailwind에서 토큰 사용"
        code={`<div className="bg-background text-foreground border" />
<p className="text-muted-foreground">보조 텍스트</p>
<Button className="bg-primary text-primary-foreground" />`}
      />

      <h2 id="tokens-list">주요 토큰</h2>
      <ul>
        <li>
          <code>background</code> / <code>foreground</code> — 페이지 배경과 기본 글자색
        </li>
        <li>
          <code>primary</code> / <code>secondary</code> — 주요·보조 강조색
        </li>
        <li>
          <code>muted</code> / <code>muted-foreground</code> — 은은한 배경과 보조 글자색
        </li>
        <li>
          <code>destructive</code> — 위험·삭제 동작
        </li>
        <li>
          <code>border</code> / <code>input</code> / <code>ring</code> — 테두리, 입력, 포커스
        </li>
        <li>
          <code>sidebar-*</code> — 사이드바 전용 토큰
        </li>
      </ul>
    </DocContent>
  );
}
