import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/common/container";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { siteConfig } from "@/config/site";
import { sanitizeNextPath } from "@/lib/auth/redirect-path";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "관리자 로그인",
};

// `next` 쿼리는 런타임 데이터라 Suspense 안에서 읽는다 (나머지 화면은 정적 셸로 나간다)
// 값은 여기서도, Server Action에서도 검증한다
async function LoginFormWithNext({
  searchParams,
}: {
  searchParams: PageProps<"/admin/login">["searchParams"];
}) {
  const { next } = await searchParams;
  return <LoginForm next={sanitizeNextPath(next)} />;
}

// 관리자 로그인 화면: 상단바 대신 로고와 테마 전환만 둔다 (D20)
export default function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  return (
    <main className="flex flex-1 flex-col py-6">
      <Container className="flex items-center justify-between">
        <Logo href={siteConfig.adminPath} />
        <ThemeToggle />
      </Container>
      <Container className="flex max-w-sm flex-1 flex-col justify-center gap-6 py-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            관리자 로그인
          </h1>
          <p className="text-sm text-muted-foreground">
            관리자 비밀번호를 입력해 견적서 목록을 확인하세요.
          </p>
        </div>
        <Suspense fallback={<LoginForm next={siteConfig.adminPath} />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
