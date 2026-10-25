// 관리자 세션 토큰: `<만료 시각(ms)>.<HMAC-SHA256 서명(base64url)>`
// proxy와 DAL이 함께 쓰는 순수 함수다. `next/headers`·`server-only`를 쓰지 않고 비밀 키는 인자로 받는다
// 서명 대상에 버전 접두사(`v1.`)를 붙여, 같은 키로 다른 용도의 서명을 만들게 되더라도 서로 통용되지 않게 한다
// Web Crypto(`crypto.subtle`)만 사용한다 (proxy는 Node.js 런타임이라 전역 `crypto`가 있다)

const encoder = new TextEncoder();
const SIGNATURE_PREFIX = "v1.";

// 만료 시각(최대 15자리 정수) + "." + SHA-256 HMAC의 base64url(43자)
const TOKEN_PATTERN = /^(\d{1,15})\.([A-Za-z0-9_-]{43})$/;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function importKey(secret: string, usage: "sign" | "verify") {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

function signedPayload(expiresAt: number): Uint8Array<ArrayBuffer> {
  return encoder.encode(`${SIGNATURE_PREFIX}${expiresAt}`);
}

// 만료 시각(ms, epoch)을 담은 서명 토큰을 만든다
export async function signSessionToken(
  expiresAt: number,
  secret: string,
): Promise<string> {
  const key = await importKey(secret, "sign");
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    signedPayload(expiresAt),
  );
  return `${expiresAt}.${toBase64Url(new Uint8Array(signature))}`;
}

// 서명과 만료를 검사한다. 어떤 이유로든 실패하면 false (형식 오류·위조·만료를 구분하지 않는다)
// 서명 비교는 `crypto.subtle.verify`가 하며 상수 시간이다
export async function verifySessionToken(
  token: string | undefined,
  secret: string,
  now: number = Date.now(),
): Promise<boolean> {
  if (!token) return false;

  const match = TOKEN_PATTERN.exec(token);
  if (!match) return false;

  const expiresAt = Number(match[1]);
  try {
    const key = await importKey(secret, "verify");
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(match[2]),
      signedPayload(expiresAt),
    );
    return isValid && expiresAt > now;
  } catch {
    return false;
  }
}
