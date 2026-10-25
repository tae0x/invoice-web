import { formatText } from "@/lib/format";

// 견적서 수신 클라이언트 정보 (빈 문자열이면 "-")
export function InvoiceClient({ clientName }: { clientName: string }) {
  return (
    <section aria-label="수신 클라이언트" className="min-w-0">
      <dl className="space-y-1">
        <dt className="text-sm text-muted-foreground">수신</dt>
        <dd className="text-lg font-semibold break-words">{formatText(clientName)}</dd>
      </dl>
    </section>
  );
}
