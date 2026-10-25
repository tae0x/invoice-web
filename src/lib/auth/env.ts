import "server-only";

import { z } from "zod";

// 관리자 인증 환경 변수 (서버 전용, `NEXT_PUBLIC_` 접두사 금지)
// 값은 어디에도 출력하지 않는다. 오류 메시지에는 변수 이름만 적는다
const passwordSchema = z.string().min(1);
// HMAC 서명 키는 32자 이상이어야 한다 (D14)
const sessionSecretSchema = z.string().min(32);

let cachedPassword: string | null = null;
let cachedSessionSecret: string | null = null;

// issue.path 대신 호출부가 이름을 알고 있으므로 변수 이름만으로 오류를 만든다
function invalidEnvError(name: string): Error {
  return new Error(
    `관리자 인증 환경 변수가 없거나 형식이 올바르지 않습니다: ${name}`,
  );
}

// 첫 호출 시점에 검증한다 (모듈 로드 시 검증하면 환경 변수 없는 빌드가 깨진다)
export function getAdminPassword(): string {
  if (cachedPassword) return cachedPassword;

  const parsed = passwordSchema.safeParse(process.env.ADMIN_PASSWORD);
  if (!parsed.success) throw invalidEnvError("ADMIN_PASSWORD");

  cachedPassword = parsed.data;
  return cachedPassword;
}

export function getAdminSessionSecret(): string {
  if (cachedSessionSecret) return cachedSessionSecret;

  const parsed = sessionSecretSchema.safeParse(
    process.env.ADMIN_SESSION_SECRET,
  );
  if (!parsed.success) throw invalidEnvError("ADMIN_SESSION_SECRET");

  cachedSessionSecret = parsed.data;
  return cachedSessionSecret;
}

// 비밀 키가 설정돼 있으면 반환하고, 없거나 형식이 틀리면 null (proxy·DAL이 "로그인 필요"로 처리)
export function tryGetAdminSessionSecret(): string | null {
  try {
    return getAdminSessionSecret();
  } catch {
    return null;
  }
}
