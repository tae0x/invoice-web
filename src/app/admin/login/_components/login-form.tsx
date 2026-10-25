"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { login, type LoginState } from "../actions";

const initialState: LoginState = {};

type LoginFormProps = {
  // 로그인 후 이동할 경로 (서버에서 한 번 더 검증한다)
  next: string;
};

// 관리자 로그인 폼: useActionState로 login 액션에 연결한다
// 액션을 form의 action에 넘기므로 JS가 없어도 POST로 제출되고, 비밀번호가 URL에 실리지 않는다
export function LoginForm({ next }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const errorMessage = state.error;
  // 개발 서버에서만 서버가 채워 보내는 설정 오류 진단 문구
  const hint = state.hint;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">비밀번호</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          // 오류가 있을 때만 오류 문구와 연결한다
          aria-describedby={errorMessage ? "admin-login-error" : undefined}
          aria-invalid={errorMessage ? true : undefined}
        />
      </div>
      {/* 오류가 생길 때 요소를 마운트해 role="alert"가 바로 읽히게 한다 (빈 영역은 렌더링하지 않는다) */}
      {errorMessage ? (
        <p
          id="admin-login-error"
          role="alert"
          className="text-sm break-words text-destructive"
        >
          {errorMessage}
          {hint ? (
            <span className="mt-1 block text-muted-foreground">{hint}</span>
          ) : null}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <Spinner aria-hidden="true" role="presentation" />
        ) : (
          <LogIn aria-hidden="true" />
        )}
        {pending ? "로그인 중" : "로그인"}
      </Button>
    </form>
  );
}
