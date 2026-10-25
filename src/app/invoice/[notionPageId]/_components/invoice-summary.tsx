import { formatCurrency } from "@/lib/format";

// 총 금액 영역 (dt가 레이블이므로 별도 aria-label을 두지 않는다. D6: totalAmount를 그대로 표시, VAT 표기 없음, 값이 없으면 "-")
export function InvoiceSummary({
  totalAmount,
}: {
  totalAmount: number | null;
}) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <dl className="flex items-baseline justify-between gap-4 sm:justify-end">
        <dt className="text-sm text-muted-foreground">총 금액</dt>
        <dd className="text-xl font-bold whitespace-nowrap tabular-nums sm:text-2xl">
          {formatCurrency(totalAmount)}
        </dd>
      </dl>
    </div>
  );
}
