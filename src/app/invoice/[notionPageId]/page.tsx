import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { dummyInvoices } from "@/lib/dummy-invoices";
import { notionPageIdSchema } from "@/lib/invoice-schema";
import type { Invoice } from "@/types/invoices";

import { InvoiceSkeleton } from "./_components/invoice-skeleton";
import { InvoiceView } from "./_components/invoice-view";

export const metadata: Metadata = {
  title: "견적서",
};

// 더미 견적서 조회: ID 형식이 틀리거나 없는 ID면 null
// TODO(Task 009): getInvoice로 교체
function getDummyInvoice(id: string): Invoice | null {
  const parsed = notionPageIdSchema.safeParse(id);
  if (!parsed.success) return null;
  return dummyInvoices.find((invoice) => invoice.id === parsed.data) ?? null;
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

function InvoiceContent({ notionPageId }: { notionPageId: string }) {
  const invoice = getDummyInvoice(notionPageId);
  if (!invoice) notFound();

  return <InvoiceView invoice={invoice} />;
}
