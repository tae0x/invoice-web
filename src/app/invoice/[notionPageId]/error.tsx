"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// 견적서 전용 에러 바운더리: error.message는 화면에 노출하지 않는다
export default function InvoiceError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // 에러 리포팅 서비스(Sentry 등)를 연결할 위치
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert aria-hidden="true" />
          </EmptyMedia>
          {/* EmptyTitle은 div이고 ui 파일은 수정하지 않으므로 heading role로 h1 역할을 준다 */}
          <EmptyTitle role="heading" aria-level={1}>
            견적서를 불러오지 못했습니다
          </EmptyTitle>
          <EmptyDescription className="break-keep">
            일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => retry()}>다시 시도</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
