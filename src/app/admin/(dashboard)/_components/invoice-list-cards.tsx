import { InvoiceStatusBadge } from "@/components/common/invoice-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatText } from "@/lib/format";
import type { AdminInvoiceListItem } from "@/lib/admin/invoices";

import { InvoiceRowActions } from "./invoice-row-actions";

// md 미만 카드 목록. md 이상에서는 display:none이라 표와 스크린 리더에 중복 노출되지 않는다
export function InvoiceListCards({
  invoices,
}: {
  invoices: AdminInvoiceListItem[];
}) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {invoices.map((invoice) => (
        <li key={invoice.id}>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 font-mono text-xs break-all text-muted-foreground">
                  {formatText(invoice.invoiceNumber)}
                </p>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <p className="text-base font-medium break-words">
                {formatText(invoice.clientName)}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="min-w-0">
                  <dt className="text-muted-foreground">발행일</dt>
                  <dd>{formatDate(invoice.issueDate)}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">유효기간</dt>
                  <dd>{formatDate(invoice.validUntil)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap items-start justify-between gap-3 border-t pt-3">
                <p className="min-w-0 text-base font-semibold tabular-nums break-all">
                  <span className="sr-only">총 금액 </span>
                  {formatCurrency(invoice.totalAmount)}
                </p>
                <InvoiceRowActions invoice={invoice} />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
