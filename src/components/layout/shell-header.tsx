"use client";

import { Bell } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { UserNav } from "@/components/common/user-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNotificationStore } from "@/stores/notification-store";

// 예시용 사용자 정보 (실제 서비스에서는 세션/인증 데이터로 교체)
const user = {
  name: "홍길동",
  email: "user@example.com",
};

// 앱 셸 상단바: 사이드바 토글, 브레드크럼, 알림, 테마, 사용자 메뉴
export function ShellHeader() {
  const count = useNotificationStore((state) => state.count);
  const reset = useNotificationStore((state) => state.reset);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-center" />
      <Breadcrumbs />
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`알림 ${count}개`}
          onClick={reset}
        >
          <Bell />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px]">
              {count}
            </Badge>
          )}
        </Button>
        <ThemeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}
