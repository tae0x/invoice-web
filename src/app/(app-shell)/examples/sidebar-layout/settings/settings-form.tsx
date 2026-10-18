"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsForm() {
  const [name, setName] = useState("홍길동");
  const [emailNotice, setEmailNotice] = useState(true);
  // localStorage에 유지되는 설정 (SSR hydration 불일치 방지를 위해 초기 렌더에서는 읽지 않는다)
  const [compact, setCompact] = useLocalStorage("settings:compact", false, {
    initializeWithValue: false,
  });

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">일반</TabsTrigger>
        <TabsTrigger value="notifications">알림</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>일반</CardTitle>
            <CardDescription>기본 프로필과 화면 옵션을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">표시 이름</FieldLabel>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="compact">컴팩트 보기</FieldLabel>
                  <FieldDescription>
                    새로고침 후에도 유지됩니다 (localStorage).
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="compact"
                  checked={compact}
                  onCheckedChange={setCompact}
                />
              </Field>
              <Button
                className="w-fit"
                onClick={() => toast.success("설정이 저장되었습니다.")}
              >
                저장
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>알림</CardTitle>
            <CardDescription>알림 수신 방법을 설정합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="email-notice">이메일 알림</FieldLabel>
                  <FieldDescription>
                    중요한 소식을 이메일로 받아봅니다.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="email-notice"
                  checked={emailNotice}
                  onCheckedChange={setEmailNotice}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
