import "server-only";

// PDF API 호출 빈도 제한 (고정 윈도우, 서버 프로세스 메모리)
// - 외부 저장소를 쓰지 않으므로 서버리스 인스턴스끼리 카운터를 공유하지 않는다.
//   인스턴스가 여러 개 뜨면 실제 허용량은 (인스턴스 수 × 한도)이고, 콜드 스타트 때 초기화된다.
//   완전한 차단이 아니라 한 클라이언트의 반복 호출이 노션 요청 제한(평균 초당 3회)을 소진하는 것을 줄이는 최소한의 방어다.
// - 키는 클라이언트 IP다. 프록시 헤더가 없으면(로컬 등) 하나의 버킷을 함께 쓴다.

// 윈도우당 허용 횟수. 정상 사용(버튼 클릭, 생성 중 재클릭 차단)으로는 닿기 어려운 값이다
export const PDF_RATE_LIMIT_MAX = 10;
// 윈도우 길이(ms)
export const PDF_RATE_LIMIT_WINDOW_MS = 60_000;
// 보관하는 IP 버킷 수의 상한. 헤더를 직접 바꿀 수 있는 환경에서 IP를 계속 바꿔 보내도 메모리가 무한히 늘지 않게 한다
const MAX_BUCKETS = 5_000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
// 마지막으로 만료 항목을 정리한 시각. 정리는 윈도우당 한 번만 해서 요청마다 전체를 훑지 않는다
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

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfterSeconds: number };

// IP 헤더가 하나도 없을 때 `getClientKey`가 돌려주는 키 (로그인 제한 쪽 가드와 공유한다)
export const UNKNOWN_CLIENT_KEY = "unknown";

// 요청 헤더에서 클라이언트 IP를 읽는다 (Vercel은 x-forwarded-for를 직접 설정한다)
export function getClientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || UNKNOWN_CLIENT_KEY;
}

export function checkPdfRateLimit(
  key: string,
  now: number = Date.now(),
): RateLimitResult {
  // 요청이 끊긴 IP의 만료 항목이 남지 않도록 윈도우마다, 상한에 닿으면 즉시 정리한다
  if (
    buckets.size >= MAX_BUCKETS ||
    now - lastSweepAt >= PDF_RATE_LIMIT_WINDOW_MS
  ) {
    sweepBuckets(now);
  }

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + PDF_RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (current.count >= PDF_RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true };
}
