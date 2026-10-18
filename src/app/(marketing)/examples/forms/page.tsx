import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/common/page-header";
import { SignupForm } from "@/components/examples/signup-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "폼 예제",
};

export default function FormsExamplePage() {
  return (
    <>
      <PageHeader
        title="폼 예제"
        description="React Hook Form + Zod 검증이 적용된 가입 폼입니다. 모든 입력 유형이 포함되어 있습니다."
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href="/login" />}
              nativeButton={false}
            >
              로그인 폼
            </Button>
            <Button
              variant="outline"
              render={<Link href="/docs/forms" />}
              nativeButton={false}
            >
              폼 문서 보기
            </Button>
          </>
        }
      />
      <Card>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </>
  );
}
