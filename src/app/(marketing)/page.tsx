import { CircleAlert, Download, FileText } from "lucide-react";

import { Container } from "@/components/common/container";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

// 견적서 조회 방법 3단계
const steps = [
  {
    title: "견적서 링크 받기",
    description:
      "발행자로부터 이메일이나 메신저를 통해 견적서 고유 링크를 받습니다.",
  },
  {
    title: "견적서 확인",
    description: "링크를 클릭하면 견적서 내용을 웹에서 바로 확인할 수 있습니다.",
  },
  {
    title: "PDF 다운로드",
    description:
      "견적서 페이지에서 'PDF 다운로드' 버튼을 클릭하여 파일로 저장하거나 인쇄할 수 있습니다.",
  },
];

// 서비스 안내 홈: 견적서 조회 방법, URL 예시, 문제 해결 안내
export default function HomePage() {
  return (
    <Container className="flex max-w-3xl flex-col gap-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">견적서 조회 시스템</h1>
        <p className="text-muted-foreground">
          노션 기반 견적서 관리 시스템에 오신 것을 환영합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="size-5" aria-hidden />
            <h2>견적서 조회 방법</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span
                  aria-hidden
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <p className="font-medium">{step.title}</p>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="size-5" aria-hidden />
            <h2>견적서 URL 예시</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <code className="block rounded-md bg-muted px-3 py-2 font-mono text-sm break-all">
            {siteConfig.url}/invoice/[견적서ID]
          </code>
          <p className="text-muted-foreground">
            발행자가 보낸 링크의 [견적서ID] 부분은 각 견적서마다 고유한
            값입니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CircleAlert className="size-5" aria-hidden />
            <h2>문제가 있나요?</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            견적서를 찾을 수 없거나 문제가 발생한 경우, 견적서를 발행한 담당자에게
            올바른 링크를 다시 요청해주세요.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
