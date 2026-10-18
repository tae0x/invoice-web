import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";
import {
  CounterDemo,
  DebounceDemo,
  LocalStorageDemo,
} from "@/components/examples/hook-demos";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "훅 라이브러리",
};

// usehooks-ts에서 제공하는 훅 (카테고리별)
const hookGroups = [
  {
    title: "상태",
    hooks: [
      ["useBoolean", "불리언 상태 + setTrue / setFalse / toggle"],
      ["useToggle", "불리언 상태를 뒤집는 함수 제공"],
      ["useCounter", "숫자 상태 + increment / decrement / reset"],
      ["useMap", "Map 상태 + set / remove / reset 액션"],
      ["useStep", "단계(Wizard) 이동 상태"],
    ],
  },
  {
    title: "저장소",
    hooks: [
      ["useLocalStorage", "localStorage와 동기화되는 상태"],
      ["useReadLocalStorage", "localStorage 값을 읽기 전용으로 구독"],
      ["useSessionStorage", "sessionStorage와 동기화되는 상태"],
    ],
  },
  {
    title: "타이머·디바운스",
    hooks: [
      ["useDebounceValue", "값 변경을 지연 반영"],
      ["useDebounceCallback", "함수 호출을 지연 실행"],
      ["useInterval", "setInterval을 안전하게 사용"],
      ["useTimeout", "setTimeout을 안전하게 사용"],
      ["useCountdown", "카운트다운 / 카운트업"],
    ],
  },
  {
    title: "브라우저·화면",
    hooks: [
      ["useMediaQuery", "CSS 미디어 쿼리 일치 여부"],
      ["useWindowSize", "창 크기"],
      ["useScreen", "screen 객체 정보"],
      ["useResizeObserver", "요소 크기 변화 감지"],
      ["useIntersectionObserver", "요소가 화면에 보이는지 감지"],
      ["useScrollLock", "본문 스크롤 잠금 (모달 등)"],
      ["useDocumentTitle", "document.title 변경"],
      ["useScript", "외부 스크립트 로드"],
      ["useCopyToClipboard", "클립보드에 복사"],
    ],
  },
  {
    title: "이벤트·상호작용",
    hooks: [
      ["useEventListener", "이벤트 리스너를 선언적으로 등록"],
      ["useOnClickOutside", "요소 바깥 클릭 감지"],
      ["useClickAnyWhere", "문서 어디든 클릭 감지"],
      ["useHover", "요소 호버 여부"],
    ],
  },
  {
    title: "유틸리티",
    hooks: [
      ["useEventCallback", "항상 최신 값을 참조하는 안정적인 콜백"],
      ["useIsClient", "클라이언트 렌더링 여부"],
      ["useIsMounted", "마운트 여부를 반환하는 함수"],
      ["useUnmount", "언마운트 시 실행"],
      ["useIsomorphicLayoutEffect", "SSR 안전한 useLayoutEffect"],
      ["useDarkMode / useTernaryDarkMode", "다크 모드 상태 (이 프로젝트는 next-themes 사용)"],
    ],
  },
];

export default function HooksDocPage() {
  return (
    <DocContent
      title="훅 라이브러리"
      description="usehooks-ts의 범용 훅과 프로젝트 전용 훅을 정리했습니다."
    >
      <h2 id="usage">사용법</h2>
      <p>
        <code>usehooks-ts</code>가 설치되어 있어 바로 import 해서 사용할 수 있습니다.
        훅은 브라우저 API를 쓰므로 <strong>클라이언트 컴포넌트</strong>(
        <code>&quot;use client&quot;</code>)에서만 호출할 수 있습니다.
      </p>
      <CodeBlock
        title="components/example.tsx"
        code={`"use client";

import { useCounter } from "usehooks-ts";

export function Example() {
  const { count, increment } = useCounter(0);
  return <button onClick={increment}>{count}</button>;
}`}
      />

      <h2 id="demo">라이브 데모</h2>
      <div className="not-prose grid gap-4 lg:grid-cols-1">
        <CounterDemo />
        <DebounceDemo />
        <LocalStorageDemo />
      </div>
      <p>
        더 많은 데모는 <Link href="/examples/hooks">훅 예제</Link>에서 볼 수
        있습니다.
      </p>

      <h2 id="ssr">SSR 주의: initializeWithValue</h2>
      <p>
        <code>useLocalStorage</code>, <code>useMediaQuery</code>,{" "}
        <code>useWindowSize</code>처럼 브라우저 값을 읽는 훅은 서버에서 렌더링한
        결과와 클라이언트 첫 렌더 결과가 달라 hydration 불일치가 생길 수 있습니다.
        이때는 <code>initializeWithValue: false</code>를 지정하면 첫 렌더에서는
        기본값을 쓰고, 마운트 후 실제 값으로 갱신합니다.
      </p>
      <CodeBlock
        title="hydration 불일치 방지"
        code={`const [compact, setCompact] = useLocalStorage("settings:compact", false, {
  initializeWithValue: false,
});

const isDesktop = useMediaQuery("(min-width: 768px)", {
  initializeWithValue: false,
});`}
      />

      <h2 id="project-hooks">프로젝트 전용 훅</h2>
      <h3>useIsMobile</h3>
      <p>
        <code>src/hooks/use-mobile.ts</code>. 화면 폭이 768px 미만이면{" "}
        <code>true</code>를 반환합니다. shadcn <code>Sidebar</code>가 내부에서
        사용하며, <code>useMediaQuery</code>로 구현되어 있습니다.
      </p>
      <CodeBlock
        title="src/hooks/use-mobile.ts"
        code={`import { useMediaQuery } from "usehooks-ts"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  return useMediaQuery(\`(max-width: \${MOBILE_BREAKPOINT - 1}px)\`, {
    initializeWithValue: false,
  })
}`}
      />
      <p>
        직접 만든 훅은 <code>src/hooks/</code> 폴더에 <code>use-*.ts</code> 이름으로
        추가하세요.
      </p>

      <h2 id="catalog">전체 훅 목록</h2>
      {hookGroups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h3>{group.title}</h3>
          <ul className="list-none! pl-0!">
            {group.hooks.map(([name, description]) => (
              <li key={name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Badge variant="outline" className="font-mono">
                  {name}
                </Badge>
                <span className="text-muted-foreground">{description}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Alert>
        <AlertTitle>더 알아보기</AlertTitle>
        <AlertDescription>
          각 훅의 자세한 옵션은 usehooks-ts 공식 문서(usehooks-ts.com)를 참고하세요.
        </AlertDescription>
      </Alert>
    </DocContent>
  );
}
