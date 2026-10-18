import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  ClipboardCheck,
  Code,
  Layers,
  Moon,
  Palette,
  Zap,
} from "lucide-react";

import { Container } from "@/components/common/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: Zap,
    title: "Next.js 16 App Router",
    description: "서버 컴포넌트와 최신 라우팅 기능을 바로 사용할 수 있습니다.",
  },
  {
    icon: Code,
    title: "TypeScript",
    description: "strict 모드로 타입 안정성을 확보했습니다.",
  },
  {
    icon: Palette,
    title: "Tailwind CSS 4",
    description: "디자인 토큰 기반의 유틸리티 스타일링을 제공합니다.",
  },
  {
    icon: Blocks,
    title: "shadcn/ui",
    description: "자주 쓰는 UI 컴포넌트가 미리 설치되어 있습니다.",
  },
  {
    icon: Moon,
    title: "다크 모드",
    description: "next-themes로 라이트·다크·시스템 테마를 지원합니다.",
  },
  {
    icon: ClipboardCheck,
    title: "폼 & 검증",
    description: "React Hook Form과 Zod 조합의 폼 예제를 포함합니다.",
  },
  {
    icon: Layers,
    title: "전역 상태",
    description: "Zustand와 usehooks-ts로 상태와 훅을 간단히 관리합니다.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b py-20 sm:py-28">
        <Container className="flex flex-col items-center gap-6 text-center">
          <Badge variant="secondary">Starter Kit</Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            빠르게 시작하는 모던 웹 개발
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              render={<Link href="/docs/getting-started" />}
              nativeButton={false}
            >
              문서 보기
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/examples" />}
              nativeButton={false}
            >
              예제 보기
            </Button>
          </div>
        </Container>
      </section>

      <section id="features" className="py-16">
        <Container className="space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">포함된 기능</h2>
            <p className="text-muted-foreground">
              프로젝트 시작에 필요한 구성이 이미 준비되어 있습니다.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="mb-2 size-6 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
