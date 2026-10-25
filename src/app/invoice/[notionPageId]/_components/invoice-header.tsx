import { siteConfig } from "@/config/site";
import { formatDate, formatText } from "@/lib/format";
import type { Invoice } from "@/types/invoices";

import { InvoiceStatusBadge } from "./invoice-status-badge";

type InvoiceHeaderProps = {
  invoice: Invoice;
  // 우측 액션 영역 (PDF 다운로드 버튼 자리)
  actions?: React.ReactNode;
};

// 견적서 헤더: 제목·번호·상태 배지, 발행일·유효기간, 발행자 정보
export function InvoiceHeader({ invoice, actions }: InvoiceHeaderProps) {
  const { issuer } = siteConfig;

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">견적서</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className="font-mono text-sm break-all text-muted-foreground">
            {formatText(invoice.invoiceNumber)}
          </p>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      <dl className="grid gap-4 border-y py-4 text-sm sm:grid-cols-3">
        <div className="min-w-0 space-y-1">
          <dt className="text-muted-foreground">발행일</dt>
          <dd className="font-medium">{formatDate(invoice.issueDate)}</dd>
        </div>
        <div className="min-w-0 space-y-1">
          <dt className="text-muted-foreground">유효기간</dt>
          <dd className="font-medium">{formatDate(invoice.validUntil)}</dd>
        </div>
        <div className="min-w-0 space-y-1">
          <dt className="text-muted-foreground">발행자</dt>
          <dd className="font-medium break-words">{issuer.name}</dd>
          <dd className="break-all text-muted-foreground">{issuer.email}</dd>
        </div>
      </dl>
    </header>
  );
}
