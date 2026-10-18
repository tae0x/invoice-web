import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "UI 컴포넌트",
};

// 설치된 shadcn/ui 컴포넌트 (파일명 = src/components/ui/<name>.tsx)
const groups = [
  {
    title: "기본",
    items: [
      ["button", "버튼. variant: default / outline / secondary / ghost / destructive / link"],
      ["badge", "상태·라벨 표시"],
      ["avatar", "사용자 이미지 + 대체 텍스트"],
      ["separator", "구분선"],
      ["skeleton", "로딩 자리 표시"],
      ["spinner", "로딩 아이콘"],
      ["progress", "진행률 막대"],
    ],
  },
  {
    title: "레이아웃·내비게이션",
    items: [
      ["card", "카드 컨테이너"],
      ["sidebar", "접이식 사이드바 (앱 셸 예제에서 사용)"],
      ["navigation-menu", "상단 내비게이션"],
      ["breadcrumb", "경로 표시"],
      ["tabs", "탭 전환"],
      ["accordion", "펼침/접힘 목록"],
      ["table", "데이터 테이블"],
      ["empty", "빈 상태 안내"],
    ],
  },
  {
    title: "폼",
    items: [
      ["input", "텍스트 입력"],
      ["textarea", "여러 줄 입력"],
      ["label", "입력 라벨"],
      ["select", "드롭다운 선택"],
      ["checkbox", "체크박스"],
      ["radio-group", "라디오 그룹"],
      ["switch", "토글 스위치"],
      ["field", "라벨·설명·에러를 묶는 폼 필드 (react-hook-form과 함께 사용)"],
    ],
  },
  {
    title: "오버레이·피드백",
    items: [
      ["dialog", "모달 다이얼로그"],
      ["alert-dialog", "확인이 필요한 모달"],
      ["sheet", "화면 가장자리에서 열리는 패널"],
      ["dropdown-menu", "드롭다운 메뉴"],
      ["popover", "팝오버"],
      ["tooltip", "툴팁 (루트 레이아웃에 TooltipProvider 적용됨)"],
      ["alert", "인라인 알림 배너"],
      ["sonner", "토스트 (루트 레이아웃에 Toaster 적용됨)"],
    ],
  },
];

export default function ComponentsDocPage() {
  return (
    <DocContent
      title="UI 컴포넌트"
      description="shadcn/ui(base-nova 스타일) 컴포넌트가 미리 설치되어 있습니다."
    >
      <h2 id="usage">기본 사용법</h2>
      <p>
        컴포넌트는 <code>src/components/ui</code>에 소스 코드로 들어 있어 프로젝트에서
        직접 import 해서 씁니다.
      </p>
      <CodeBlock
        title="예시"
        code={`import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Example() {
  return (
    <div className="flex gap-2">
      <Button>저장</Button>
      <Button variant="outline">취소</Button>
      <Badge variant="secondary">New</Badge>
    </div>
  );
}`}
      />

      <h2 id="base-ui">Base UI 기반 (Radix 아님)</h2>
      <p>
        이 프로젝트의 shadcn 컴포넌트는 Radix가 아닌 <strong>Base UI</strong>
        위에 만들어져 있습니다. 인터넷의 Radix 예제를 그대로 복사하면 동작하지
        않을 수 있어 아래 차이를 알아두세요.
      </p>
      <h3>asChild 대신 render prop</h3>
      <p>
        다른 요소(예: <code>Link</code>)로 렌더링하려면 <code>render</code>를
        사용합니다. 버튼이 아닌 요소로 렌더링할 때는{" "}
        <code>nativeButton={"{false}"}</code>를 함께 지정합니다.
      </p>
      <CodeBlock
        title="Link로 렌더링"
        code={`import Link from "next/link";

<Button render={<Link href="/docs" />} nativeButton={false}>
  문서 보기
</Button>`}
      />
      <h3>Trigger도 render로 합성</h3>
      <CodeBlock
        title="Dialog 트리거"
        code={`<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>
    열기
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>제목</DialogTitle>
      <DialogDescription>설명</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`}
      />
      <h3>Select / Switch / Checkbox의 값 콜백</h3>
      <ul>
        <li>
          <code>Select</code>의 <code>onValueChange</code>는 선택 해제 상태를
          나타내는 <code>null</code>이 올 수 있어 <code>string | null</code>로
          처리해야 합니다.
        </li>
        <li>
          <code>Switch</code>, <code>Checkbox</code>는{" "}
          <code>checked</code> / <code>onCheckedChange</code>를 사용합니다.
        </li>
      </ul>

      <h2 id="installed">설치된 컴포넌트</h2>
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h3>{group.title}</h3>
          <ul className="list-none! pl-0!">
            {group.items.map(([name, description]) => (
              <li key={name} className="flex flex-wrap items-baseline gap-x-3">
                <Badge variant="outline" className="font-mono">
                  {name}
                </Badge>
                <span className="text-muted-foreground">{description}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2 id="add">컴포넌트 추가</h2>
      <p>필요한 컴포넌트는 shadcn CLI로 추가합니다.</p>
      <CodeBlock
        title="터미널"
        code={`npx shadcn@latest add calendar chart command pagination`}
      />
      <p>
        예: <code>calendar</code>, <code>chart</code>, <code>command</code>,{" "}
        <code>pagination</code>, <code>carousel</code>, <code>combobox</code>,{" "}
        <code>drawer</code>, <code>resizable</code>
      </p>

      <Alert>
        <AlertTitle>직접 눌러보기</AlertTitle>
        <AlertDescription>
          모든 컴포넌트의 실제 동작은{" "}
          <Link href="/examples/components">컴포넌트 쇼케이스</Link>에서 확인할 수
          있습니다.
        </AlertDescription>
      </Alert>
    </DocContent>
  );
}
