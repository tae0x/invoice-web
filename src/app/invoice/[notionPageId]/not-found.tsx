import type { Metadata } from "next";
import { FileQuestion } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { siteConfig } from "@/config/site";

const NOT_FOUND_TITLE = "견적서를 찾을 수 없습니다";

// 스트리밍 전 404(proxy가 형식 오류로 404를 준 요청)의 탭 제목
// `noindex` 메타 태그는 notFound() 처리 시 Next.js가 자동으로 넣는다 (not-found.md)
export const metadata: Metadata = {
  title: NOT_FOUND_TITLE,
};

// 견적서 전용 404 화면: 클라이언트용 문서 화면이므로 홈 이동 버튼은 두지 않는다
export default function InvoiceNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      {/* 스트리밍 후 notFound()(형식은 맞지만 없는 견적서)는 메타데이터가 이미 전송되어
          위 metadata가 적용되지 않으므로 React <title>로 탭 제목을 바꾼다.
          형식은 루트 layout의 title template(`%s | 사이트명`)과 같게 유지한다 */}
      <title>{`${NOT_FOUND_TITLE} | ${siteConfig.name}`}</title>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion aria-hidden="true" />
          </EmptyMedia>
          {/* EmptyTitle은 div이고 ui 파일은 수정하지 않으므로 heading role로 h1 역할을 준다 */}
          <EmptyTitle role="heading" aria-level={1}>
            {NOT_FOUND_TITLE}
          </EmptyTitle>
          <EmptyDescription className="break-keep">
            링크가 올바른지 확인하고 견적서를 보낸 발행자에게 문의해 주세요.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
