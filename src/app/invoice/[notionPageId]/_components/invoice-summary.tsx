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
        {/* bg-muted 위에서 muted-foreground는 대비가 4.5:1에 못 미쳐(라이트 4.35) 본문색을 쓴다 */}
        <dt className="text-sm">총 금액</dt>
        <dd className="text-xl font-bold whitespace-nowrap tabular-nums sm:text-2xl">
          {formatCurrency(totalAmount)}
        </dd>
      </dl>
    </div>
  );
}
