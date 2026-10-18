import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";
import { ComponentShowcase } from "@/components/examples/component-showcase";

export const metadata: Metadata = {
  title: "컴포넌트 쇼케이스",
};

export default function ComponentsExamplePage() {
  return (
    <>
      <PageHeader
        title="컴포넌트 쇼케이스"
        description="설치된 UI 컴포넌트를 직접 눌러보며 확인하세요. 각 카드의 배지는 사용된 컴포넌트 이름입니다."
      />
      <ComponentShowcase />
    </>
  );
}
