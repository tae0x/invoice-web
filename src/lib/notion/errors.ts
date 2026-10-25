import "server-only";

import { isNotionClientError } from "@notionhq/client";

import { logger } from "@/lib/logger";

// 화면·PDF API·관리자 목록에 넘기는 오류. 노션 오류 메시지·응답 본문은 담지 않고 코드와 HTTP 상태만 남긴다
export class NotionRequestError extends Error {
  constructor(
    readonly code: string,
    readonly status: number | null,
  ) {
    super(
      `노션 견적서 조회에 실패했습니다 (code=${code}, status=${status ?? "-"})`,
    );
    this.name = "NotionRequestError";
  }
}

// 노션 SDK 오류와 내부 응답 검사 오류를 코드·상태만 담은 오류로 맞추고 서버 로그에 남긴다
// event: 호출부별 로그 이벤트명 (예: `notion.invoice_fetch_failed`, `notion.invoice_list_failed`)
export function toRequestError(error: unknown, event: string): unknown {
  const requestError =
    error instanceof NotionRequestError
      ? error
      : isNotionClientError(error)
        ? new NotionRequestError(
            error.code,
            "status" in error ? error.status : null,
          )
        : null;
  // 환경 변수 오류 등 그 밖의 오류는 그대로 넘긴다 (메시지에 값이 없음)
  if (!requestError) return error;

  logger.error(event, {
    code: requestError.code,
    status: requestError.status ?? undefined,
  });
  return requestError;
}
