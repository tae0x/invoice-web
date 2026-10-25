import "server-only";

// 서버 전용 경량 로거. 외부 로깅 서비스 없이 stdout/stderr에 JSON 한 줄을 남긴다 (Vercel 로그에서 검색 가능)
// - 이벤트명과 단순 값(string·number·boolean) 필드만 받는다. 객체·에러 인스턴스는 타입에서 막는다
// - API 키, 노션 응답 본문, 클라이언트 IP, 에러 메시지 전체는 넘기지 않는다
//   (에러는 describeError로 이름·코드·상태만 뽑아 쓴다)
// - 시각은 넣지 않는다. 로그 수집 쪽이 줄마다 찍어 준다

type LogLevel = "info" | "warn" | "error";

// undefined 값은 출력에서 빠진다 (선택 필드를 조건 없이 넘기기 위함)
export type LogFields = Record<string, string | number | boolean | undefined>;

function write(level: LogLevel, event: string, fields: LogFields = {}) {
  // level·event는 fields가 덮어쓰지 못하게 마지막에 둔다
  const line = JSON.stringify({ ...fields, level, event });
  console[level](line);
}

export const logger = {
  info: (event: string, fields?: LogFields) => write("info", event, fields),
  warn: (event: string, fields?: LogFields) => write("warn", event, fields),
  error: (event: string, fields?: LogFields) => write("error", event, fields),
};

// 에러에서 로그에 남겨도 되는 값만 뽑는다: 이름, 문자열·숫자 code, 숫자 status
// 메시지와 스택은 노션 응답 내용이 섞일 수 있어 뽑지 않는다
export function describeError(error: unknown): LogFields {
  if (!(error instanceof Error)) return { errorName: "unknown" };

  const { code, status } = error as { code?: unknown; status?: unknown };
  return {
    errorName: error.name,
    errorCode:
      typeof code === "string" || typeof code === "number" ? code : undefined,
    errorStatus: typeof status === "number" ? status : undefined,
  };
}
