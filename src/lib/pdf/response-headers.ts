// PDF 응답 헤더 생성 (노션과 무관한 순수 함수)

const FALLBACK_BASENAME = "invoice";
const MAX_BASENAME_LENGTH = 100;

// 제어 문자, 줄·문단 구분자, 제로폭·양방향 제어 문자, 경로 문자, 따옴표, 파일명에 쓸 수 없는 문자
const UNSAFE_CHARS = new RegExp(
  "[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u2028-\\u202e\\u2066-\\u2069\\ufeff/\\\\:*?\"'`<>|]",
  "g",
);

// 견적서 번호를 파일명(확장자 제외)으로 정리한다. 비면 "invoice"
export function sanitizeFilenameBase(value: string): string {
  const cleaned = value
    // 짝 없는 서로게이트는 encodeURIComponent가 예외를 던지므로 U+FFFD로 바꾼다
    .toWellFormed()
    .replace(UNSAFE_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim()
    // 숨김 파일·상위 경로처럼 보이는 앞쪽 점 제거
    .replace(/^\.+/, "")
    .trim();
  // 코드 포인트 단위로 자른다 (서로게이트 쌍이 끊기지 않게)
  const truncated = Array.from(cleaned).slice(0, MAX_BASENAME_LENGTH).join("");
  return truncated.trim() || FALLBACK_BASENAME;
}

// RFC 5987 attr-char에 없는 문자까지 퍼센트 인코딩한다 (encodeURIComponent는 ' ( ) *를 남긴다)
function encodeRfc5987(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

// Content-Disposition 값: ASCII 대체 이름(filename)과 UTF-8 이름(filename*)을 함께 담는다
export function buildContentDisposition(invoiceNumber: string): string {
  const base = sanitizeFilenameBase(invoiceNumber);
  // 대체 이름은 ASCII 인쇄 가능 문자만 남긴다. 남는 게 없으면 invoice
  const asciiBase =
    base
      .replace(/[^\x20-\x7e]/g, "")
      .replace(/%/g, "")
      .replace(/\s+/g, " ")
      .trim() || FALLBACK_BASENAME;
  return `attachment; filename="${asciiBase}.pdf"; filename*=UTF-8''${encodeRfc5987(base)}.pdf`;
}

// PDF 응답 헤더 (매 요청마다 노션을 다시 조회하므로 캐시하지 않는다)
export function buildPdfResponseHeaders(invoiceNumber: string): Headers {
  return new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": buildContentDisposition(invoiceNumber),
    "Cache-Control": "no-store",
  });
}
