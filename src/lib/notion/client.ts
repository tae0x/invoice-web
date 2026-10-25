import "server-only";

import { Client, LogLevel, type Logger } from "@notionhq/client";

import { logger } from "@/lib/logger";

import { getNotionEnv } from "./env";

// 노션 요청 1회의 제한 시간 (SDK 기본 60초는 페이지 응답 대기로 너무 길다)
const NOTION_TIMEOUT_MS = 10_000;

// SDK 로그는 오류 코드·시도 횟수·요청 ID만 남긴다
// (기본 로거는 노션 오류 메시지를 함께 남기고, DEBUG에서는 응답 본문까지 남긴다)
const notionLogger: Logger = (level, _message, extraInfo) => {
  const { code, attempt, request_id: requestId } = extraInfo;
  logger.warn("notion.sdk_log", {
    sdkLevel: level,
    code: typeof code === "string" ? code : undefined,
    attempt: typeof attempt === "number" ? attempt : undefined,
    requestId: typeof requestId === "string" ? requestId : undefined,
  });
};

let client: Client | null = null;

// 서버 전용 노션 클라이언트 싱글턴 (첫 호출 시 환경 변수를 검증하고 만든다)
// Notion-Version은 SDK 기본값(2025-09-03, 데이터 소스 API)을 쓴다
export function getNotionClient(): Client {
  if (client) return client;

  const { apiKey } = getNotionEnv();
  client = new Client({
    auth: apiKey,
    timeoutMs: NOTION_TIMEOUT_MS,
    logLevel: LogLevel.WARN,
    logger: notionLogger,
    // 429·529(모든 메서드)와 GET의 500·503을 SDK가 Retry-After를 지켜 재시도한다
    retry: { maxRetries: 2, initialRetryDelayMs: 500, maxRetryDelayMs: 5_000 },
  });
  return client;
}
