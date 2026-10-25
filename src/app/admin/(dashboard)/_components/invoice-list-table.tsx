import { InvoiceStatusBadge } from "@/components/common/invoice-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatText } from "@/lib/format";
import type { AdminInvoiceListItem } from "@/lib/admin/invoices";

import { InvoiceRowActions } from "./invoice-row-actions";

// md 이상 표. md 미만에서는 display:none이라 카드 목록과 스크린 리더에 중복 노출되지 않는다
export function InvoiceListTable({
  invoices,
}: {
  invoices: AdminInvoiceListItem[];
}) {
  return (
    <div className="hidden md:block">
      {/* md~lg 구간 폭이 빠듯해 셀 좌우 여백을 줄인다 */}
      <Table className="[&_td]:px-1.5 [&_th]:px-1.5">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">견적서 번호</TableHead>
            <TableHead scope="col">클라이언트명</TableHead>
            <TableHead scope="col">발행일</TableHead>
            <TableHead scope="col">유효기간</TableHead>
            <TableHead scope="col">상태</TableHead>
            <TableHead scope="col" className="text-right">
              총 금액
            </TableHead>
            <TableHead scope="col" className="text-right">
              동작
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableHead
                scope="row"
                className="max-w-40 font-mono text-xs break-all whitespace-normal"
              >
                {formatText(invoice.invoiceNumber)}
              </TableHead>
              <TableCell className="max-w-56 min-w-24 whitespace-normal break-words">
                {formatText(invoice.clientName)}
              </TableCell>
              <TableCell>{formatDate(invoice.issueDate)}</TableCell>
              <TableCell>{formatDate(invoice.validUntil)}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(invoice.totalAmount)}
              </TableCell>
              <TableCell>
                <InvoiceRowActions invoice={invoice} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
