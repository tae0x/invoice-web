import { Skeleton } from "@/components/ui/skeleton";

// 견적서 화면(InvoiceView) 형태의 로딩 골격. 영역별로 나눠 두어 영역 단위 Suspense fallback에도 쓸 수 있다
// loading.tsx와 페이지 Suspense fallback은 InvoiceSkeleton을 함께 쓴다
// 구조가 같아야 로딩이 끝날 때 화면이 덜 흔들린다 (md 미만은 카드 목록, md 이상은 표 행)

// 헤더: 제목·번호·버튼, 발행일·유효기간·발행자
export function InvoiceHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-4 border-y py-4 sm:grid-cols-3">
        {/* 실제 헤더처럼 항목마다 한 줄 20px, 발행자(마지막)만 이메일 줄이 하나 더 있다 */}
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-36 max-w-full" />
            {index === 2 && <Skeleton className="h-5 w-44 max-w-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// 클라이언트
export function InvoiceClientSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-5 w-10" />
      <Skeleton className="h-7 w-56 max-w-full" />
    </div>
  );
}

// 견적 항목
export function InvoiceItemsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-7 w-24" />

      {/* 모바일 카드: 실제 카드와 같게 제목 24px + 줄 3개 20px */}
      <div className="flex flex-col gap-4 md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-5">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* 태블릿·데스크톱 표 행 */}
      {/* 실제 표와 높이를 맞춘다: 머리글 h-12, 행 p-4 + 한 줄(20px), 행마다 border-b(마지막 제외) */}
      <div className="hidden flex-col md:flex">
        <div className="flex h-12 items-center gap-4 border-b px-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b p-4 last:border-b-0"
          >
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 총 금액: 실제 박스는 p-4 + 금액 줄(모바일 text-xl 28px, sm 이상 text-2xl 32px)
export function InvoiceSummarySkeleton() {
  return <Skeleton className="h-15 w-full rounded-lg sm:h-16" />;
}

// 견적서 전체 로딩 골격 (영역 골격을 InvoiceView와 같은 순서·간격으로 조합)
export function InvoiceSkeleton() {
  return (
    <div role="status" className="flex min-w-0 flex-col gap-8">
      <span className="sr-only">견적서를 불러오는 중입니다</span>
      <InvoiceHeaderSkeleton />
      <InvoiceClientSkeleton />
      <InvoiceItemsSkeleton />
      <InvoiceSummarySkeleton />
    </div>
  );
}
