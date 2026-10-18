import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "상태 관리",
};

export default function StateDocPage() {
  return (
    <DocContent
      title="상태 관리"
      description="Zustand로 컴포넌트 사이에서 공유하는 전역 상태를 관리합니다."
    >
      <h2 id="store">스토어 만들기</h2>
      <p>
        스토어는 <code>src/stores/</code> 폴더에 둡니다. 이 프로젝트의{" "}
        <code>src/stores/notification-store.ts</code>가 예제입니다.
      </p>
      <CodeBlock
        title="src/stores/notification-store.ts"
        code={`import { create } from "zustand";

type NotificationState = {
  count: number;
  increment: () => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));`}
      />

      <h2 id="usage">컴포넌트에서 사용</h2>
      <p>
        필요한 값만 selector로 구독하면 해당 값이 바뀔 때만 리렌더링됩니다.
      </p>
      <CodeBlock
        title="사용 예"
        code={`"use client";

import { useNotificationStore } from "@/stores/notification-store";

export function Bell() {
  const count = useNotificationStore((state) => state.count);
  const reset = useNotificationStore((state) => state.reset);

  return <button onClick={reset}>알림 {count}</button>;
}`}
      />

      <h2 id="rules">주의 사항</h2>
      <ul>
        <li>
          스토어 훅은 <strong>클라이언트 컴포넌트에서만</strong> 사용합니다. 서버
          컴포넌트에서 import 하지 마세요.
        </li>
        <li>
          서버 데이터(DB/API 결과)는 전역 상태에 넣기보다 서버 컴포넌트에서
          가져와 props로 내려주는 편이 단순합니다.
        </li>
        <li>
          여러 컴포넌트가 함께 쓰지 않는 값은 <code>useState</code>로 충분합니다.
        </li>
        <li>
          새로고침 후에도 유지해야 하면 zustand의 <code>persist</code> 미들웨어 대신{" "}
          <Link href="/docs/hooks">useLocalStorage</Link> 훅으로 시작해도 됩니다.
        </li>
      </ul>

      <Alert>
        <AlertTitle>직접 확인하기</AlertTitle>
        <AlertDescription>
          <Link href="/examples/sidebar-layout">사이드바 앱 셸 예제</Link>에서
          버튼을 누르면 상단바의 알림 배지가 같은 스토어를 통해 함께 바뀝니다.
        </AlertDescription>
      </Alert>
    </DocContent>
  );
}
