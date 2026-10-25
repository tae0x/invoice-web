import { FileQuestion } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

// 견적서 전용 404 화면: 클라이언트용 문서 화면이므로 홈 이동 버튼은 두지 않는다
export default function InvoiceNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion aria-hidden="true" />
          </EmptyMedia>
          {/* EmptyTitle은 div이고 ui 파일은 수정하지 않으므로 heading role로 h1 역할을 준다 */}
          <EmptyTitle role="heading" aria-level={1}>
            견적서를 찾을 수 없습니다
          </EmptyTitle>
          <EmptyDescription className="break-keep">
            링크가 올바른지 확인하고 견적서를 보낸 발행자에게 문의해 주세요.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
