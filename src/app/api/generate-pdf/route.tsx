import { generatePdfRequestSchema } from "@/lib/invoice-schema";
import { describeError, logger } from "@/lib/logger";
import { getInvoice } from "@/lib/notion/invoices";
import { checkPdfRateLimit, getClientKey } from "@/lib/pdf/rate-limit";
import { renderInvoicePdf } from "@/lib/pdf/render-invoice-pdf";
import { buildPdfResponseHeaders } from "@/lib/pdf/response-headers";
import type { GeneratePdfErrorResponse } from "@/types/pdf";

// 요청 본문은 ID 하나만 담으므로 작은 상한을 둔다 (바이트)
const MAX_BODY_BYTES = 1024;

// 오류 응답: 내부 오류 메시지는 담지 않고 일반 문장만 돌려준다
function errorResponse(
  message: string,
  status: number,
  extraHeaders?: Record<string, string>,
) {
  const body: GeneratePdfErrorResponse = { error: message };
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

// PDF 생성: 견적서 ID를 받아 A4 PDF를 돌려준다
export async function POST(request: Request) {
  // 호출 빈도 제한: 본문 읽기와 노션 조회 전에 먼저 확인한다
  const limit = checkPdfRateLimit(getClientKey(request.headers));
  if (!limit.allowed) {
    // 클라이언트 IP는 기록하지 않는다
    logger.warn("pdf.rate_limited", {
      retryAfterSeconds: limit.retryAfterSeconds,
    });
    return errorResponse(
      "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  // JSON이 아닌 요청은 거절한다. 다른 사이트의 단순 요청(text/plain 폼 등)이 이 API를 부르지 못하고
  // CORS preflight를 거치게 된다
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return errorResponse("잘못된 요청입니다.", 415);
  }

  // 본문을 읽기 전에 크기를 확인한다 (헤더가 없거나 거짓이어도 아래 텍스트 길이 검사가 막는다)
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return errorResponse("잘못된 요청입니다.", 413);
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
      return errorResponse("잘못된 요청입니다.", 413);
    }
    body = JSON.parse(text);
  } catch {
    return errorResponse("잘못된 요청입니다.", 400);
  }

  // 알 수 없는 키는 무시한다 (금액 등을 보내도 PDF 내용에 영향이 없다)
  const parsed = generatePdfRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("잘못된 요청입니다.", 400);
  }

  try {
    // D2: 클라이언트가 보낸 값은 ID뿐이고, 내용은 서버가 노션에서 다시 조회한다
    const invoice = await getInvoice(parsed.data.notionPageId);
    if (!invoice) {
      return errorResponse("견적서를 찾을 수 없습니다.", 404);
    }

    const pdf = await renderInvoicePdf(invoice);
    // Buffer의 기반 버퍼 타입(ArrayBufferLike)이 BodyInit과 맞지 않아 Uint8Array로 복사한다 (수십 KB라 비용이 작다)
    return new Response(new Uint8Array(pdf), {
      headers: buildPdfResponseHeaders(invoice.invoiceNumber),
    });
  } catch (error) {
    // 오류 이름·코드·상태만 남긴다 (메시지에 노션 응답 내용이 섞일 수 있다)
    logger.error("pdf.generate_failed", describeError(error));
    return errorResponse("PDF를 생성하지 못했습니다.", 500);
  }
}
