// PDF 생성 API(`/api/generate-pdf`) 요청·응답 타입
import type { z } from "zod";

import type { generatePdfRequestSchema } from "@/lib/invoice-schema";

// 요청 본문 (D2: 견적서 ID만 받고 서버가 노션을 다시 조회한다)
// 스키마에서 파생한다. 클라이언트는 변환 전 입력 타입을 보내므로 z.input을 쓴다.
// import type만 쓰므로 zod가 클라이언트 번들에 들어오지 않는다
export type GeneratePdfRequest = z.input<typeof generatePdfRequestSchema>;

// 실패 응답 본문 (내부 오류 메시지는 담지 않는다)
export type GeneratePdfErrorResponse = {
  error: string;
};
