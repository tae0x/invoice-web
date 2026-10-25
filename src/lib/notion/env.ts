import "server-only";

import { z } from "zod";

import { notionPageIdSchema } from "@/lib/invoice-schema";

// 노션 연동 환경 변수 (서버 전용, `NEXT_PUBLIC_` 접두사 금지)
const notionEnvSchema = z.object({
  NOTION_API_KEY: z.string().trim().min(1),
  // 하이픈 포함·미포함 32자리 ID를 받아 하이픈 없는 소문자로 정규화한다 (D9 비교 기준)
  NOTION_DATABASE_ID: notionPageIdSchema,
});

export type NotionEnv = {
  apiKey: string;
  databaseId: string;
};

let cachedEnv: NotionEnv | null = null;

// 첫 호출 시점에 검증한다 (모듈 로드 시 검증하면 환경 변수 없는 빌드가 깨진다)
// 오류 메시지에는 변수 이름만 적고 값은 절대 넣지 않는다
export function getNotionEnv(): NotionEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = notionEnvSchema.safeParse({
    NOTION_API_KEY: process.env.NOTION_API_KEY,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  });

  if (!parsed.success) {
    // issue.path만 사용한다 (issue.message·input에는 값이 섞일 수 있음)
    const names = [
      ...new Set(parsed.error.issues.map((issue) => String(issue.path[0]))),
    ];
    throw new Error(
      `노션 환경 변수가 없거나 형식이 올바르지 않습니다: ${names.join(", ")}`,
    );
  }

  cachedEnv = {
    apiKey: parsed.data.NOTION_API_KEY,
    databaseId: parsed.data.NOTION_DATABASE_ID,
  };
  return cachedEnv;
}
