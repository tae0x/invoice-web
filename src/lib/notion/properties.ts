import "server-only";

// 노션 DB 속성명 매핑 (서버 전용, 노션 조회 코드에서만 사용. types/notion.ts는 import type으로만 참조)
// 노션에서 속성명을 바꾸면 이 파일과 docs/ROADMAP.md "노션 DB 속성 명세"만 수정한다 (D3)

// Invoices DB (`NOTION_DATABASE_ID`)
export const NOTION_INVOICE_PROPERTIES = {
  invoiceNumber: "견적서 번호", // title
  clientName: "클라이언트명", // rich_text
  issueDate: "발행일", // date
  validUntil: "유효기간", // date
  status: "상태", // status (select도 허용)
  totalAmount: "총 금액", // number
  items: "항목", // relation → Items
} as const;

// Items DB
export const NOTION_ITEM_PROPERTIES = {
  description: "항목명", // title
  quantity: "수량", // number
  unitPrice: "단가", // number
  amount: "금액", // formula (수량 × 단가)
  invoices: "Invoices", // relation → Invoices (양방향 관계의 역방향, 항목 조회 필터에만 사용)
} as const;
