import { notFound } from "next/navigation";

// 형식이 잘못된 견적서 URL의 rewrite 대상 (D12, `src/proxy.ts`)
// 스트리밍 전에 notFound()를 호출하므로 빌드 때 정적 404로 만들어지고 HTTP 404 상태로 응답한다
// (동적 견적서 라우트는 PPR 셸이 먼저 나가 proxy가 상태 코드를 바꿀 수 없다)
export default function InvalidInvoiceIdPage(): never {
  notFound();
}
