import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AdminInvoiceListItem } from "@/lib/admin/invoices";

import { CopyInvoiceLinkButton } from "./copy-invoice-link-button";

// 목록 행의 동작 묶음: 새 탭으로 열기 + 링크 복사 (표와 카드가 공유)
export function InvoiceRowActions({
  invoice,
}: {
  invoice: AdminInvoiceListItem;
}) {
  const number = invoice.invoiceNumber.trim() || invoice.id;

  return (
    <div className="flex items-start justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <a
            href={`/invoice/${invoice.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`견적서 ${number} 새 탭에서 열기`}
          />
        }
      >
        <ExternalLink aria-hidden="true" />
        <span className="hidden lg:inline">열기</span>
      </Button>
      <CopyInvoiceLinkButton invoiceNumber={number} url={invoice.url} />
    </div>
  );
}
