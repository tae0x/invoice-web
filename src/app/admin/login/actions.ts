"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminPassword, getAdminSessionSecret } from "@/lib/auth/env";
import {
  checkLoginRateLimit,
  getLoginClientKey,
  resetLoginRateLimit,
} from "@/lib/auth/login-rate-limit";
import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { createAdminSession } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export type LoginState = {
  // 화면에 보여줄 오류 문구 (없으면 오류 없음)
  error?: string;
  // 개발 환경에서만 채우는 설정 오류 진단 문구 (프로덕션 응답에는 절대 포함하지 않는다)
  hint?: string;
};

// 실패 문구는 하나로 통일한다 (비밀번호 오류와 서버 설정 오류를 구분해 알려주지 않는다)
const LOGIN_FAILED_MESSAGE =
  "비밀번호가 올바르지 않습니다. 다시 확인해 주세요.";

type MisconfiguredVariable = "ADMIN_PASSWORD" | "ADMIN_SESSION_SECRET";

// 변수별 개발용 안내 (비밀 값이나 현재 길이는 담지 않는다)
const DEV_HINT_BY_VARIABLE: Record<MisconfiguredVariable, string> = {
  ADMIN_PASSWORD: "ADMIN_PASSWORD가 비어 있거나 설정되지 않았습니다",
  ADMIN_SESSION_SECRET: "ADMIN_SESSION_SECRET은 32자 이상이어야 합니다",
};

// 개발 서버에서만 설정 오류 원인을 알려 준다. 프로덕션에서는 undefined라 응답에 hint 필드가 실리지 않는다
function buildDevHint(variables: MisconfiguredVariable[]): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  const details = variables
    .map((variable) => DEV_HINT_BY_VARIABLE[variable])
    .join(", ");
  return `관리자 환경 변수 설정을 확인하세요: ${details}`;
}

// 비정상적으로 긴 입력은 해시 계산 전에 거른다
const loginInputSchema = z.object({
  password: z.string().min(1).max(1024),
});

// 두 값을 SHA-256 다이제스트로 만든 뒤 상수 시간으로 비교한다 (길이 차이로 인한 시간 차이도 없앤다)
function isSamePassword(input: string, expected: string): boolean {
  const inputDigest = createHash("sha256").update(input).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(inputDigest, expectedDigest);
}

// 로그인 Server Action: 시도 제한 → 입력 검증 → 비밀번호 비교 → 세션 발급 → 이동
// 로그에는 이벤트와 사유만 남기고 IP·비밀번호·토큰은 남기지 않는다
export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const clientKey = getLoginClientKey(await headers());
  const rateLimit = checkLoginRateLimit(clientKey);
  if (!rateLimit.allowed) {
    logger.warn("admin.login_rate_limited", {
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    });
    return {
      error: `로그인 시도가 너무 많습니다. ${rateLimit.retryAfterSeconds}초 후에 다시 시도해 주세요.`,
    };
  }

  const parsed = loginInputSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    logger.warn("admin.login_failed", { reason: "invalid_input" });
    return { error: LOGIN_FAILED_MESSAGE };
  }

  // 환경 변수를 따로 검사해 어떤 변수가 문제인지 구분한다 (값·길이는 다루지 않고 이름만 남긴다)
  // 세션 서명 키도 확인해, 발급할 수 없는 설정이면 비밀번호가 맞아도 실패로 처리한다
  const misconfigured: MisconfiguredVariable[] = [];
  let expectedPassword = "";
  try {
    expectedPassword = getAdminPassword();
  } catch {
    misconfigured.push("ADMIN_PASSWORD");
  }
  try {
    getAdminSessionSecret();
  } catch {
    misconfigured.push("ADMIN_SESSION_SECRET");
  }
  if (misconfigured.length > 0) {
    // 화면에는 일반 문구만 보여주고, 사유는 로그에 변수 이름만 남긴다
    logger.error("admin.login_failed", {
      reason: "misconfigured",
      variables: misconfigured.join(","),
    });
    // 프로덕션에서는 hint 키 자체를 응답에 싣지 않는다
    const hint = buildDevHint(misconfigured);
    return hint
      ? { error: LOGIN_FAILED_MESSAGE, hint }
      : { error: LOGIN_FAILED_MESSAGE };
  }

  const isPasswordCorrect = isSamePassword(
    parsed.data.password,
    expectedPassword,
  );

  if (!isPasswordCorrect) {
    logger.warn("admin.login_failed", { reason: "invalid_password" });
    return { error: LOGIN_FAILED_MESSAGE };
  }

  // 성공했으므로 이 클라이언트의 실패 기록을 지운다
  // 키가 "unknown"(IP 헤더 없음)이면 resetLoginRateLimit이 지우지 않는다 (여러 요청이 한 버킷을 공유하므로)
  resetLoginRateLimit(clientKey);
  await createAdminSession();
  logger.info("admin.login_succeeded");

  // redirect()는 예외를 던져 이동하므로 try/catch 밖에서 호출한다
  redirect(sanitizeNextPath(formData.get("next")));
}
