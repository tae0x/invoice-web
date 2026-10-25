import type { Invoice } from "@/types/invoices";

// UI 개발용 더미 데이터 (노션 연동 전 화면·PDF 레이아웃 확인용, 실서비스 코드에서 사용하지 않는다)
export const dummyInvoices = [
  // 노션 DB 샘플과 같은 내용의 견적서 (ID는 가짜 값, 항목 다수)
  {
    id: "5a1c0e7b3d9f4a2e8b6c1d0f9e8a7b61",
    invoiceNumber: "INV-2026-001",
    clientName: "ABC 회사",
    issueDate: "2026-10-01",
    validUntil: "2026-10-26",
    status: "대기",
    totalAmount: 5_000_000,
    items: [
      {
        id: "5a1c0e7b3d9f4a2e8b6c1d0f9e8a7b62",
        description: "웹사이트 디자인",
        quantity: 1,
        unitPrice: 3_000_000,
        amount: 3_000_000,
      },
      {
        id: "5a1c0e7b3d9f4a2e8b6c1d0f9e8a7b63",
        description: "로고 제작",
        quantity: 2,
        unitPrice: 500_000,
        amount: 1_000_000,
      },
      {
        id: "5a1c0e7b3d9f4a2e8b6c1d0f9e8a7b64",
        description: "명함 디자인",
        quantity: 100,
        unitPrice: 10_000,
        amount: 1_000_000,
      },
    ],
  },
  // 항목 0개 (빈 상태 표시 확인)
  {
    id: "a1b2c3d4e5f60718293a4b5c6d7e8f90",
    invoiceNumber: "INV-2026-002",
    clientName: "빈 견적 주식회사",
    issueDate: "2026-10-05",
    validUntil: "2026-11-04",
    status: "승인",
    totalAmount: 0,
    items: [],
  },
  // 항목 1개
  {
    id: "0f1e2d3c4b5a69788796a5b4c3d2e1f0",
    invoiceNumber: "INV-2026-003",
    clientName: "한빛 스튜디오",
    issueDate: "2026-10-12",
    validUntil: "2026-10-31",
    status: "거절",
    totalAmount: 1_200_000,
    items: [
      {
        id: "11111111222233334444555555555555",
        description: "랜딩 페이지 리뉴얼",
        quantity: 1,
        unitPrice: 1_200_000,
        amount: 1_200_000,
      },
    ],
  },
  // 항목 다수, 긴 항목명·긴 클라이언트명, 큰 금액
  {
    id: "9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b",
    invoiceNumber: "INV-2026-004",
    clientName: "주식회사 아주긴이름을가진글로벌디지털트랜스포메이션컨설팅그룹",
    issueDate: "2026-10-20",
    validUntil: "2026-12-31",
    status: "대기",
    totalAmount: 1_234_567_890,
    items: [
      {
        id: "22222222333344445555666666666661",
        description:
          "통합 이커머스 플랫폼 구축 (회원·주문·결제·정산·재고 관리 모듈 및 관리자 대시보드 포함, 반응형 웹과 모바일 웹 동시 대응)",
        quantity: 1,
        unitPrice: 850_000_000,
        amount: 850_000_000,
      },
      {
        id: "22222222333344445555666666666662",
        description: "UI/UX 디자인 시스템 구축",
        quantity: 1,
        unitPrice: 120_000_000,
        amount: 120_000_000,
      },
      {
        id: "22222222333344445555666666666663",
        description: "서버 인프라 구성 및 운영 자동화",
        quantity: 12,
        unitPrice: 15_000_000,
        amount: 180_000_000,
      },
      {
        id: "22222222333344445555666666666664",
        description: "보안 취약점 점검",
        quantity: 2,
        unitPrice: 25_000_000,
        amount: 50_000_000,
      },
      {
        id: "22222222333344445555666666666665",
        description: "사용자 교육",
        quantity: 3,
        unitPrice: 4_855_963,
        amount: 14_567_889,
      },
      {
        id: "22222222333344445555666666666666",
        description: "유지보수 (1개월)",
        quantity: 1,
        unitPrice: 20_000_001,
        amount: 20_000_001,
      },
    ],
  },
  // 상태·날짜·금액이 비어 있는 견적서 (값 없음 표시 확인)
  {
    id: "abcdefabcdefabcdefabcdefabcdef12",
    invoiceNumber: "INV-2026-005",
    clientName: "미정 고객",
    issueDate: null,
    validUntil: null,
    status: null,
    totalAmount: null,
    items: [
      {
        id: "33333333444455556666777777777777",
        description: "견적 협의 중 항목",
        quantity: null,
        unitPrice: null,
        amount: null,
      },
    ],
  },
] satisfies Invoice[];
