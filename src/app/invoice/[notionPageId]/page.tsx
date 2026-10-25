import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getInvoice } from "@/lib/notion/invoices";

import { InvoiceSkeleton } from "./_components/invoice-skeleton";
import { InvoiceView } from "./_components/invoice-view";

// 탭 제목에 견적서 번호를 넣는다. getInvoice는 React.cache라 페이지 본문과 같은 요청 안에서 노션을 다시 조회하지 않는다
export async function generateMetadata({
  params,
}: PageProps<"/invoice/[notionPageId]">): Promise<Metadata> {
  const { notionPageId } = await params;
  try {
    const invoice = await getInvoice(notionPageId);
    return { title: invoice ? `견적서 ${invoice.invoiceNumber}` : "견적서" };
  } catch {
    // 조회 실패는 본문 렌더링이 error.tsx로 처리한다. 제목만 기본값으로 둔다
    return { title: "견적서" };
  }
}

// 견적서 조회 페이지: params는 런타임 데이터이므로 Suspense 안에서만 접근한다
export default function InvoicePage({
  params,
}: PageProps<"/invoice/[notionPageId]">) {
  return (
    <Suspense fallback={<InvoiceSkeleton />}>
      {params.then(({ notionPageId }) => (
        <InvoiceContent notionPageId={notionPageId} />
      ))}
    </Suspense>
  );
}

// 노션 조회: 없는 견적서면 null → 404 화면, 조회 실패는 throw → error.tsx (D8: 요청마다 조회)
async function InvoiceContent({ notionPageId }: { notionPageId: string }) {
  const invoice = await getInvoice(notionPageId);
  if (!invoice) notFound();

  return <InvoiceView invoice={invoice} />;
}
