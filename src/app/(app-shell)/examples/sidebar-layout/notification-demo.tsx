"use client";

import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification-store";

import { AddNotificationButton } from "./add-notification-button";

// 상단바의 알림 배지와 같은 zustand 스토어를 구독한다
export function NotificationDemo() {
  const count = useNotificationStore((state) => state.count);
  const reset = useNotificationStore((state) => state.reset);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <AddNotificationButton />
      <Button variant="ghost" onClick={reset} disabled={count === 0}>
        초기화
      </Button>
      <p className="text-sm text-muted-foreground">
        현재 알림 수: <span className="font-medium text-foreground">{count}</span>
      </p>
    </div>
  );
}
