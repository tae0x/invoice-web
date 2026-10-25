import { z } from "zod";

// 노션 페이지 ID: 32자리 16진수 또는 8-4-4-4-12 하이픈 형식 (대소문자 무시, D5)
const NOTION_PAGE_ID_PATTERN =
  /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

// 앞뒤 공백도 허용하지 않는다 (proxy 404 판정과 같은 기준). 형식을 검사한 뒤 하이픈 없는 소문자로 정규화한다
export const notionPageIdSchema = z
  .string()
  .regex(NOTION_PAGE_ID_PATTERN)
  .transform((value) => value.replaceAll("-", "").toLowerCase());
