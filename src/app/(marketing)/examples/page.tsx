import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { examplesNav } from "@/config/site";

export const metadata: Metadata = {
  title: "예제",
};

export default function ExamplesPage() {
  return (
    <>
      <PageHeader
        title="예제"
        description="스타터킷에 포함된 기능을 직접 눌러보며 확인하세요. 모든 예제는 그대로 복사해 쓸 수 있습니다."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {examplesNav.map((example) => (
          <Link key={example.href} href={example.href} className="group">
            <Card className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {example.title}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </CardTitle>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
