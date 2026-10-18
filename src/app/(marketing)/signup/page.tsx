import type { Metadata } from "next";

import { Container } from "@/components/common/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "회원가입",
};

export default function SignupPage() {
  return (
    <Container className="flex flex-1 items-center justify-center py-8 sm:py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>계정을 만들고 시작해 보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </Container>
  );
}
