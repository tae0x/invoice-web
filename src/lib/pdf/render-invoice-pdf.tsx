// 견적서 PDF 렌더링 (서버 전용, D1). 노션과 무관하게 Invoice만 받아 Buffer를 만든다
import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import { InvoiceDocument } from "@/lib/pdf/invoice-document";
import type { Invoice } from "@/types/invoices";

export function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument invoice={invoice} />);
}
