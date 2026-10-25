import type { INVOICE_STATUSES } from "@/lib/constants";

// 견적서 상태 (노션 `상태` Select 옵션)
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// 견적 항목 (노션 Items DB 한 행)
export type InvoiceItem = {
  // 노션 항목 페이지 ID
  id: string;
  // 항목명
  description: string;
  // 수량
  quantity: number | null;
  // 단가 (원 단위 정수)
  unitPrice: number | null;
  // 금액 (노션 수식 `수량 × 단가` 결과, 항목 행 표시용)
  amount: number | null;
};

// 견적서 (노션 Invoices DB 한 행)
export type Invoice = {
  // 노션 견적서 페이지 ID (하이픈 없는 32자리 소문자 16진수)
  id: string;
  // 견적서 번호
  invoiceNumber: string;
  // 클라이언트명
  clientName: string;
  // 발행일 (`YYYY-MM-DD`, 시간 없음)
  issueDate: string | null;
  // 유효기간 (`YYYY-MM-DD`, 시간 없음)
  validUntil: string | null;
  // 상태 (빈 값·알 수 없는 값은 null이며 배지를 숨긴다, D4)
  status: InvoiceStatus | null;
  // 총 금액 (노션 `총 금액` 값을 그대로 사용, D6)
  totalAmount: number | null;
  // 견적 항목 목록
  items: InvoiceItem[];
};
