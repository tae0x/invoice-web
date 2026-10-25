import { Badge } from "@/components/ui/badge";
import { INVOICE_STATUS_LABELS } from "@/lib/constants";
import type { InvoiceStatus } from "@/types/invoices";

// 상태별 배지 변형 (D4: 대기=secondary, 승인=default, 거절=destructive)
const STATUS_VARIANTS = {
  대기: "secondary",
  승인: "default",
  거절: "destructive",
} as const satisfies Record<
  InvoiceStatus,
  "secondary" | "default" | "destructive"
>;

// 견적서 상태 배지: 상태가 없으면(빈 값·알 수 없는 값) 렌더링하지 않는다
export function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus | null;
}) {
  if (status === null) return null;

  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  );
}
