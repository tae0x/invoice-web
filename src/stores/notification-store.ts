import { create } from "zustand";

type NotificationState = {
  count: number;
  increment: () => void;
  reset: () => void;
};

// 헤더(레이아웃)와 페이지가 함께 쓰는 전역 상태 예시
// 클라이언트 컴포넌트에서만 import 할 것 (서버 컴포넌트 사용 금지)
export const useNotificationStore = create<NotificationState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));
