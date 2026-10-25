import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 5;

// 목록 로딩 스켈레톤: loading.tsx와 Suspense fallback이 함께 쓴다
// 표(md 이상)와 카드(md 미만)를 모두 그리되 display:none으로 하나만 보이게 한다
export function InvoiceListSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">견적서 목록을 불러오는 중입니다</span>

      {/* 표 형태 */}
      <div aria-hidden="true" className="hidden flex-col gap-3 md:flex">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: ROW_COUNT }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* 카드 형태 */}
      <div aria-hidden="true" className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
