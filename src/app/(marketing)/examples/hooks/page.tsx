import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import {
  CopyDemo,
  CountdownDemo,
  CounterDemo,
  DebounceDemo,
  InteractionDemo,
  LocalStorageDemo,
  MediaQueryDemo,
  StepDemo,
  ToggleDemo,
} from "@/components/examples/hook-demos";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "훅 예제",
};

export default function HooksExamplePage() {
  return (
    <>
      <PageHeader
        title="훅 예제"
        description="usehooks-ts 훅을 활용한 동작 데모입니다."
        actions={
          <Button
            variant="outline"
            render={<Link href="/docs/hooks" />}
            nativeButton={false}
          >
            훅 문서 보기
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <CounterDemo />
        <ToggleDemo />
        <DebounceDemo />
        <LocalStorageDemo />
        <MediaQueryDemo />
        <CopyDemo />
        <CountdownDemo />
        <InteractionDemo />
        <StepDemo />
      </div>
    </>
  );
}
