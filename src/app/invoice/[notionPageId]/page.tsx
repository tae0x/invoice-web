import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { INVOICE_NOT_FOUND_TITLE } from "@/config/site";
import { getCachedInvoice } from "@/lib/notion/invoices";

import { InvoiceSkeleton } from "./_components/invoice-skeleton";
import { InvoiceView } from "./_components/invoice-view";

// 탭 제목에 견적서 번호를 넣는다. getCachedInvoice는 60초 캐시(D8)이고 React.cache로 페이지 본문과 같은 요청 안의 중복 호출도 합친다
export async function generateMetadata({
  params,
}: PageProps<"/invoice/[notionPageId]">): Promise<Metadata> {
  const { notionPageId } = await params;
  try {
    const invoice = await getCachedInvoice(notionPageId);
    // 없는 견적서는 404 화면의 <title>과 같은 제목을 줘서 탭 제목이 중간에 바뀌어 보이지 않게 한다
    return {
      title: invoice
        ? `견적서 ${invoice.invoiceNumber}`
        : INVOICE_NOT_FOUND_TITLE,
    };
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

// 노션 조회: 없는 견적서면 null → 404 화면, 조회 실패는 throw → error.tsx (D8: 60초 캐시)
async function InvoiceContent({ notionPageId }: { notionPageId: string }) {
  const invoice = await getCachedInvoice(notionPageId);
  if (!invoice) notFound();

  return <InvoiceView invoice={invoice} />;
}
