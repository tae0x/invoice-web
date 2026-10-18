"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

// 검증 스키마 (zod)
const signupSchema = z.object({
  name: z.string().trim().min(2,"이름은 2자 이상이어야 합니다."),
  email: z.email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignupValues) {
    // 실제 서비스에서는 서버 액션/API 호출로 교체
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.success(`${values.name}님, 가입 요청이 전송되었습니다. (예시)`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signup-name">이름</FieldLabel>
              <Input
                {...field}
                id="signup-name"
                autoComplete="name"
                placeholder="홍길동"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signup-email">이메일</FieldLabel>
              <Input
                {...field}
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="user@example.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
              <Input
                {...field}
                id="signup-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner />}
          가입하기
        </Button>
        <FieldDescription className="text-center">
          이미 계정이 있으신가요? <Link href="/login">로그인</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
