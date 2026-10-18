import type { Metadata } from "next";
import Link from "next/link";
import { PanelLeft, PanelTop, SquareStack } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { NotificationDemo } from "./notification-demo";

export const metadata: Metadata = {
  title: "사이드바 앱 셸",
};

const parts = [
  {
    icon: PanelLeft,
    title: "AppSidebar",
    description:
      "src/components/layout/app-sidebar.tsx. src/config/site.ts의 shellNav로 메뉴를 만들고 현재 경로를 활성 표시합니다.",
  },
  {
    icon: PanelTop,
    title: "ShellHeader",
    description:
      "src/components/layout/shell-header.tsx. 사이드바 토글, 브레드크럼, 알림, 테마 전환, 사용자 메뉴가 들어 있습니다.",
  },
  {
    icon: SquareStack,
    title: "본문 영역",
    description:
      "SidebarInset 안에서 페이지가 렌더링됩니다. 라우트 그룹의 layout.tsx가 이 구조를 한 번만 선언합니다.",
  },
];

export default function SidebarLayoutPage() {
  return (
    <>
      <PageHeader
        title="사이드바 앱 셸"
        description="사이드바 + 상단바 + 본문으로 이루어진 앱형 레이아웃 예제입니다."
        actions={
          <Button
            variant="outline"
            render={<Link href="/examples/layouts" />}
            nativeButton={false}
          >
            레이아웃 예제로 돌아가기
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {parts.map((part) => {
          const Icon = part.icon;
          return (
            <Card key={part.title}>
              <CardHeader>
                <Icon className="mb-2 size-5 text-primary" />
                <CardTitle>{part.title}</CardTitle>
                <CardDescription>{part.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>전역 상태 연동</CardTitle>
          <CardDescription>
            버튼을 누르면 상단바 종 아이콘의 배지가 함께 바뀝니다. 같은
            zustand 스토어(src/stores/notification-store.ts)를 공유하기 때문입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationDemo />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>사용 팁</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
              Ctrl/⌘ + B
            </kbd>{" "}
            로 사이드바를 접고 펼 수 있습니다.
          </p>
          <p>화면 폭이 좁아지면 사이드바가 시트(Sheet)로 전환됩니다.</p>
          <p>
            설정 페이지의 컴팩트 보기 옵션은 localStorage에 저장되어 새로고침 후에도
            유지됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
