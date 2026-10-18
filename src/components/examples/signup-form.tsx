"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const roles = [
  { label: "개발자", value: "developer" },
  { label: "디자이너", value: "designer" },
  { label: "기획자", value: "pm" },
];

const plans = [
  { label: "무료", value: "free", description: "개인 프로젝트에 적합" },
  { label: "프로", value: "pro", description: "개발자를 위한 모든 기능" },
  { label: "팀", value: "team", description: "여러 명이 함께 사용" },
] as const;

// 검증 스키마 (zod): 에러 메시지가 곧 화면에 표시되는 문구
const signupSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  email: z.email("올바른 이메일 형식이 아닙니다."),
  role: z.string().min(1, "직군을 선택해 주세요."),
  plan: z.enum(["free", "pro", "team"]),
  bio: z.string().max(100, "소개는 100자 이하로 입력해 주세요."),
  newsletter: z.boolean(),
  terms: z.boolean().refine((value) => value, "약관에 동의해야 가입할 수 있습니다."),
});

type SignupValues = z.infer<typeof signupSchema>;

const defaultValues: SignupValues = {
  name: "",
  email: "",
  role: "",
  plan: "free",
  bio: "",
  newsletter: true,
  terms: false,
};

// 모든 입력 유형이 들어간 가입 폼 예제 (react-hook-form + zod)
export function SignupForm() {
  const [submitted, setSubmitted] = useState<SignupValues | null>(null);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  });

  async function onSubmit(values: SignupValues) {
    // 실제 서비스에서는 서버 액션/API 호출로 교체
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitted(values);
    toast.success("가입 요청이 전송되었습니다. (예시)");
  }

  function handleReset() {
    form.reset(defaultValues);
    setSubmitted(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="signup-role">직군</FieldLabel>
                {/* Select는 선택 전 값이 null이므로 빈 문자열과 변환해 연결한다 */}
                <Select
                  items={roles}
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    id="signup-role"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="직군을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="plan"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel id="signup-plan-label">플랜</FieldLabel>
                <RadioGroup
                  aria-labelledby="signup-plan-label"
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as SignupValues["plan"])
                  }
                >
                  {plans.map((plan) => (
                    <div key={plan.value} className="flex items-start gap-2">
                      <RadioGroupItem
                        value={plan.value}
                        id={`signup-plan-${plan.value}`}
                        className="mt-0.5"
                      />
                      <div className="grid gap-0.5">
                        <Label htmlFor={`signup-plan-${plan.value}`}>
                          {plan.label}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {plan.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </Field>
            )}
          />

          <Controller
            name="bio"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="signup-bio">소개 (선택)</FieldLabel>
                <Textarea
                  {...field}
                  id="signup-bio"
                  placeholder="간단히 자신을 소개해 주세요."
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>{field.value.length} / 100자</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="newsletter"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="signup-newsletter">뉴스레터 수신</FieldLabel>
                  <FieldDescription>새로운 소식을 이메일로 받아봅니다.</FieldDescription>
                </FieldContent>
                <Switch
                  id="signup-newsletter"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />

          <Controller
            name="terms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="signup-terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <Label htmlFor="signup-terms">이용약관에 동의합니다</Label>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              가입하기
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              초기화
            </Button>
          </div>
        </FieldGroup>
      </form>

      <aside className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
        <h3 className="font-semibold">제출된 값</h3>
        {submitted ? (
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        ) : (
          <p className="text-muted-foreground">
            폼을 제출하면 검증을 통과한 값이 여기에 표시됩니다. 비워 둔 채
            제출하면 에러 메시지를 볼 수 있습니다.
          </p>
        )}
      </aside>
    </div>
  );
}
