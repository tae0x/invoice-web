"use client";

import { BellPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/stores/notification-store";

// 헤더의 알림 배지와 zustand 스토어로 상태를 공유한다
export function AddNotificationButton() {
  const increment = useNotificationStore((state) => state.increment);

  return (
    <Button variant="outline" onClick={increment}>
      <BellPlus data-icon="inline-start" />
      알림 추가
    </Button>
  );
}
