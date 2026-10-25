import { FileText } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// 견적서가 0건일 때의 빈 상태
export function InvoiceListEmpty() {
  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText aria-hidden="true" />
        </EmptyMedia>
        {/* 페이지의 h1과 겹치지 않도록 h2 역할을 준다 (EmptyTitle은 div) */}
        <EmptyTitle role="heading" aria-level={2}>
          표시할 견적서가 없습니다
        </EmptyTitle>
        <EmptyDescription className="break-keep">
          노션 견적서 데이터베이스에 견적서를 만들면 여기에 나타납니다.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
