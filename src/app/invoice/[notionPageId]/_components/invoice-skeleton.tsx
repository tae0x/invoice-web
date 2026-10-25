import { Skeleton } from "@/components/ui/skeleton";

// 견적서 화면(InvoiceView) 형태의 로딩 골격: loading.tsx와 페이지 Suspense fallback이 함께 쓴다
// 구조가 같아야 로딩이 끝날 때 화면이 덜 흔들린다 (md 미만은 카드 목록, md 이상은 표 행)
export function InvoiceSkeleton() {
  return (
    <div role="status" className="flex min-w-0 flex-col gap-8">
      <span className="sr-only">견적서를 불러오는 중입니다</span>

      {/* 헤더: 제목·번호·버튼, 발행일·유효기간·발행자 */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid gap-4 border-y py-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-36 max-w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 클라이언트 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-6 w-56 max-w-full" />
      </div>

      {/* 견적 항목 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />

        {/* 모바일 카드 */}
        <div className="flex flex-col gap-3 md:hidden">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* 태블릿·데스크톱 표 행 */}
        <div className="hidden flex-col gap-3 md:flex">
          <Skeleton className="h-8 w-full" />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-2">
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* 총 금액 */}
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}
