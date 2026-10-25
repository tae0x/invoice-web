import "server-only";

import { getClientKey, UNKNOWN_CLIENT_KEY } from "@/lib/pdf/rate-limit";

// 관리자 로그인 시도 제한 (고정 윈도우, 서버 프로세스 메모리)
// `src/lib/pdf/rate-limit.ts`와 같은 방식이며 카운터는 별도다 (PDF 호출과 로그인이 서로의 한도를 쓰지 않는다)
// 서버리스 인스턴스끼리 카운터를 공유하지 않으므로 실질적인 방어는 긴 무작위 비밀번호다 (ROADMAP 위험 요약)
// 성공·실패와 관계없이 시도마다 세고, 로그인에 성공하면 `resetLoginRateLimit`로 해당 키를 지운다. 키는 클라이언트 IP다 (IP는 로그에 남기지 않는다)

// 윈도우당 허용 횟수
export const LOGIN_RATE_LIMIT_MAX = 5;
// 윈도우 길이(ms)
export const LOGIN_RATE_LIMIT_WINDOW_MS = 60_000;
// 보관하는 IP 버킷 수의 상한 (헤더를 바꿔 가며 보내도 메모리가 무한히 늘지 않게 한다)
const MAX_BUCKETS = 5_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweepAt = 0;

// 만료된 버킷을 지우고, 그래도 상한을 넘으면 가장 먼저 들어온 버킷부터 지운다 (Map은 삽입 순서를 유지한다)
function sweepBuckets(now: number) {
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(bucketKey);
  }
  for (const bucketKey of buckets.keys()) {
    if (buckets.size < MAX_BUCKETS) break;
    buckets.delete(bucketKey);
  }
  lastSweepAt = now;
}

export type LoginRateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkLoginRateLimit(
  key: string,
  now: number = Date.now(),
): LoginRateLimitResult {
  if (
    buckets.size >= MAX_BUCKETS ||
    now - lastSweepAt >= LOGIN_RATE_LIMIT_WINDOW_MS
  ) {
    sweepBuckets(now);
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (current.count >= LOGIN_RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true };
}

// 로그인 시도 제한용 클라이언트 키
// Vercel은 들어온 요청의 `x-vercel-forwarded-for`·`x-real-ip`를 클라이언트가 보낸 값과 무관하게 직접 설정한다.
// 그래서 이 두 헤더를 `x-forwarded-for`(클라이언트가 값을 덧붙일 수 있음)보다 먼저 본다.
// 한계: Vercel 배포를 전제로 한 방어다. 자체 호스팅·앞단 프록시 환경에서는 클라이언트가 이 헤더를 위조해
// 요청마다 다른 키를 만들어 제한을 약하게 할 수 있다. 그런 환경에서는 신뢰하는 프록시가 헤더를 덮어쓰게 해야 한다
// 두 헤더가 모두 없으면(로컬 개발 등) 기존 `getClientKey` 동작을 따른다
export function getLoginClientKey(headers: Headers): string {
  const vercelIp = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  return vercelIp || realIp || getClientKey(headers);
}

// 로그인에 성공하면 해당 키의 실패 기록을 지운다 (정상 사용자가 앞선 오타 때문에 막히지 않게 한다)
// 키가 "unknown"이면 식별할 수 없는 요청들이 한 버킷을 공유하므로, 성공해도 다른 요청의 실패 누적을 지우지 않도록 건너뛴다
// (Vercel은 IP 헤더를 항상 붙이므로 로컬·자체 호스팅 환경에서만 해당한다)
// 한계: 헤더가 없는 환경에서는 모든 요청이 한 버킷을 공유해 5회 실패로 관리자도 60초 잠길 수 있다 (Vercel에서는 해당 없음)
export function resetLoginRateLimit(key: string): void {
  if (key === UNKNOWN_CLIENT_KEY) return;
  buckets.delete(key);
}
