import { FileText } from "lucide-react";
import { cn } from "cn";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatNumber, formatText } from "@/lib/format";
import type { InvoiceItem } from "@/types/invoices";

// 표 여백 (머리글·셀 공통). 값을 바꾸면 invoice-skeleton.tsx의 표 행 높이도 함께 맞춘다
const HEAD_CLASS = "h-12 px-4";
const CELL_CLASS = "p-4";

// 견적 항목 영역: h2 제목 아래에 md 미만은 카드형 목록, md 이상은 표로 표시한다
// (항목이 없으면 제목은 유지하고 본문만 빈 상태 안내로 바꾼다)
export function InvoiceItemsTable({ items }: { items: InvoiceItem[] }) {
  return (
    <section aria-labelledby="invoice-items-heading" className="space-y-4">
      <h2 id="invoice-items-heading" className="text-lg font-semibold">
        견적 항목
      </h2>

      {items.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>견적 항목이 없습니다</EmptyTitle>
            <EmptyDescription>
              등록된 견적 항목이 아직 없습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {/* 모바일 카드형 목록 */}
          <ul className="flex flex-col gap-4 md:hidden">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border p-5">
                <p className="font-medium break-words">
                  {formatText(item.description)}
                </p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm tabular-nums">
                  <dt className="text-muted-foreground">수량</dt>
                  <dd className="text-right">{formatNumber(item.quantity)}</dd>
                  <dt className="text-muted-foreground">단가</dt>
                  <dd className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </dd>
                  <dt className="text-muted-foreground">금액</dt>
                  <dd className="text-right font-semibold">
                    {formatCurrency(item.amount)}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>

          {/* 태블릿·데스크톱 표 (제목은 위 h2가 맡으므로 caption은 두지 않는다) */}
          <div className="hidden md:block">
            <Table aria-labelledby="invoice-items-heading">
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD_CLASS}>항목명</TableHead>
                  <TableHead className={cn(HEAD_CLASS, "text-right")}>
                    수량
                  </TableHead>
                  <TableHead className={cn(HEAD_CLASS, "text-right")}>
                    단가
                  </TableHead>
                  <TableHead className={cn(HEAD_CLASS, "text-right")}>
                    금액
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell
                      className={cn(
                        CELL_CLASS,
                        "whitespace-normal break-words",
                      )}
                    >
                      {formatText(item.description)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        CELL_CLASS,
                        "text-right whitespace-nowrap tabular-nums",
                      )}
                    >
                      {formatNumber(item.quantity)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        CELL_CLASS,
                        "text-right whitespace-nowrap tabular-nums",
                      )}
                    >
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        CELL_CLASS,
                        "text-right font-medium whitespace-nowrap tabular-nums",
                      )}
                    >
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
