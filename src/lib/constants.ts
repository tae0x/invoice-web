// 견적서 도메인 공용 상수 (서버·클라이언트 공용)
import type { InvoiceStatus } from "@/types/invoices";

// 노션 `상태` Select 옵션 (D4: 읽기 전용 표시)
export const INVOICE_STATUSES = ["대기", "승인", "거절"] as const;

// 상태 배지 표시 라벨
export const INVOICE_STATUS_LABELS = {
  대기: "대기",
  승인: "승인",
  거절: "거절",
} as const satisfies Record<InvoiceStatus, string>;

// 노션에서 읽은 상태 값이 알려진 옵션인지 판별 (빈 값·알 수 없는 값은 배지를 숨긴다)
export function isInvoiceStatus(
  value: string | null | undefined,
): value is InvoiceStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value ?? "");
}

// 금액·날짜 표시 기준 (D3, D6). TIME_ZONE은 시간이 있는 값을 표시할 때 쓴다
export const LOCALE = "ko-KR";
export const TIME_ZONE = "Asia/Seoul";
export const CURRENCY = "KRW";
