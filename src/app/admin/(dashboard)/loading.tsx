import { InvoiceListHeading } from "./_components/invoice-list-heading";
import { InvoiceListSkeleton } from "./_components/invoice-list-skeleton";

// 관리자 대시보드 로딩 화면: 페이지와 같은 제목 위치에 목록 스켈레톤을 보여 준다
export default function Loading() {
  return (
    <>
      <InvoiceListHeading />
      <InvoiceListSkeleton />
    </>
  );
}
