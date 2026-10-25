import { z } from "zod";

// 노션 페이지 ID: 32자리 16진수 또는 8-4-4-4-12 하이픈 형식 (대소문자 무시, D5)
const NOTION_PAGE_ID_PATTERN =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

// 앞뒤 공백도 허용하지 않는다 (proxy 404 판정과 같은 기준). 형식을 검사한 뒤 하이픈 없는 소문자로 정규화한다
export const notionPageIdSchema = z
  .string()
  .regex(NOTION_PAGE_ID_PATTERN)
  .transform((value) => value.replaceAll("-", "").toLowerCase());

// PDF 생성 API 요청 본문 (D2: 견적서 ID만 받고 서버가 노션을 다시 조회한다)
// 정의되지 않은 키는 무시한다 (zod 기본 동작이므로 클라이언트가 보낸 다른 값은 PDF 내용에 영향이 없다)
export const generatePdfRequestSchema = z.object({
  notionPageId: notionPageIdSchema,
});
