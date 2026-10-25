import { TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AdminInvoiceListResult } from "@/lib/admin/invoices";

import { InvoiceListCards } from "./invoice-list-cards";
import { InvoiceListEmpty } from "./invoice-list-empty";
import { InvoiceListTable } from "./invoice-list-table";

// 견적서 목록 조합: DAL이 만든 화면용 DTO를 props로 받는 서버 컴포넌트
// (`import type`이라 서버 전용 모듈이 번들에 들어오지 않는다)
// 경고 분기(`showBaseUrlWarning`)는 빌드를 통과한 localhost·비정상 기준 URL을 위한 것이다. 빈 값은 빌드에서 먼저 막힌다
export function InvoiceList({ result }: { result: AdminInvoiceListResult }) {
  const { invoices, truncated, showBaseUrlWarning } = result;

  return (
    <div className="flex flex-col gap-4">
      {showBaseUrlWarning && (
        <Alert variant="destructive" role="status">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>복사되는 링크의 도메인을 확인하세요</AlertTitle>
          <AlertDescription>
            기준 URL(NEXT_PUBLIC_SITE_URL)이 localhost이거나 올바른 URL이
            아니어서 복사한 링크를 다른 사람이 열 수 없을 수 있습니다. 환경
            변수를 https://로 시작하는 배포 주소로 설정해 주세요.
          </AlertDescription>
        </Alert>
      )}

      {invoices.length === 0 ? (
        <InvoiceListEmpty />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {/* 잘렸을 때 "총"이라고 하면 전체가 이 건수라는 오해를 준다 */}
            {truncated ? "최근" : "총"} {invoices.length}건
          </p>
          <InvoiceListTable invoices={invoices} />
          <InvoiceListCards invoices={invoices} />
        </>
      )}

      {truncated && (
        <Alert role="status">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>최근 {invoices.length}건만 표시합니다</AlertTitle>
          <AlertDescription>
            견적서가 많아 최근 발행한 {invoices.length}건까지만 보여 줍니다.
            그보다 오래된 견적서는 노션에서 확인해 주세요.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
