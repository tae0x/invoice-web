import type { Invoice } from "@/types/invoices";

import { DownloadPdfButton } from "./download-pdf-button";
import { InvoiceClient } from "./invoice-client";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceItemsTable } from "./invoice-items-table";
import { InvoiceSummary } from "./invoice-summary";

// 견적서 화면 조합: 헤더(PDF 다운로드 버튼 포함) → 클라이언트 → 견적 항목 → 총 금액
export function InvoiceView({ invoice }: { invoice: Invoice }) {
  return (
    <article className="flex min-w-0 flex-col gap-8">
      <InvoiceHeader
        invoice={invoice}
        actions={
          <DownloadPdfButton
            notionPageId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
          />
        }
      />
      <InvoiceClient clientName={invoice.clientName} />
      <InvoiceItemsTable items={invoice.items} />
      <InvoiceSummary totalAmount={invoice.totalAmount} />
    </article>
  );
}
