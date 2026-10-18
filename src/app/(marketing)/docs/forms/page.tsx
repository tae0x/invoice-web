import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "폼 & 검증",
};

export default function FormsDocPage() {
  return (
    <DocContent
      title="폼 & 검증"
      description="React Hook Form + Zod + shadcn Field 조합으로 폼을 만듭니다."
    >
      <h2 id="stack">구성</h2>
      <ul>
        <li>
          <code>zod</code> — 스키마로 검증 규칙과 타입을 함께 정의
        </li>
        <li>
          <code>react-hook-form</code> — 입력 상태·제출 처리
        </li>
        <li>
          <code>@hookform/resolvers</code> — zod 스키마를 폼에 연결
        </li>
        <li>
          <code>src/components/ui/field</code> — 라벨·설명·에러 메시지 레이아웃
        </li>
      </ul>

      <h2 id="schema">1. 스키마 정의</h2>
      <CodeBlock
        title="스키마"
        code={`import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

type LoginValues = z.infer<typeof loginSchema>;`}
      />

      <h2 id="form">2. 폼 작성</h2>
      <p>
        <code>Controller</code>로 각 입력을 연결하고, 에러는{" "}
        <code>FieldError</code>로 표시합니다. 제출 중에는{" "}
        <code>formState.isSubmitting</code>으로 버튼을 비활성화합니다.
      </p>
      <CodeBlock
        title="login-form.tsx"
        code={`"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    // 서버 액션 또는 API 호출
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">이메일</FieldLabel>
              <Input {...field} id="email" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          로그인
        </Button>
      </FieldGroup>
    </form>
  );
}`}
      />

      <h2 id="controls">입력 컴포넌트별 연결</h2>
      <ul>
        <li>
          <code>Input</code>, <code>Textarea</code> — <code>{"{...field}"}</code>를
          그대로 전개합니다.
        </li>
        <li>
          <code>Select</code>, <code>RadioGroup</code> —{" "}
          <code>value</code> / <code>onValueChange</code>를 연결합니다.
        </li>
        <li>
          <code>Checkbox</code>, <code>Switch</code> — <code>checked</code> /{" "}
          <code>onCheckedChange</code>를 연결합니다.
        </li>
      </ul>

      <Alert>
        <AlertTitle>동작하는 예제</AlertTitle>
        <AlertDescription>
          모든 입력 유형이 들어간 <Link href="/examples/forms">폼 예제</Link>와
          간단한 <Link href="/login">로그인 폼</Link>을 확인해 보세요.
        </AlertDescription>
      </Alert>
    </DocContent>
  );
}
