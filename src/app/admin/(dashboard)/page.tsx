import type { Metadata } from "next";
import { Suspense } from "react";

import { getAdminInvoiceList } from "@/lib/admin/invoices";

import { InvoiceList } from "./_components/invoice-list";
import { InvoiceListHeading } from "./_components/invoice-list-heading";
import { InvoiceListSkeleton } from "./_components/invoice-list-skeleton";

export const metadata: Metadata = {
  title: "견적서 목록",
};

// 세션 검사(cookies)와 노션 조회를 이 컴포넌트 안에서 함께 한다. 호출한 쪽이 Suspense로 감싸므로
// 제목은 즉시 나가고 목록만 스트리밍된다. 오류는 같은 세그먼트의 error.tsx가 처리한다
async function AdminInvoiceList() {
  const result = await getAdminInvoiceList();
  return <InvoiceList result={result} />;
}

// 견적서 목록 화면 (노션 실데이터, D17: 요청 간 캐시 없음)
export default function AdminPage() {
  return (
    <>
      <InvoiceListHeading />
      <Suspense fallback={<InvoiceListSkeleton />}>
        <AdminInvoiceList />
      </Suspense>
    </>
  );
}
