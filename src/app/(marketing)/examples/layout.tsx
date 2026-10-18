import { Container } from "@/components/common/container";

// 예제 공통 레이아웃: 컨테이너 + 상하 여백
export default function ExamplesLayout({ children }: LayoutProps<"/examples">) {
  return <Container className="flex-1 space-y-8 py-10">{children}</Container>;
}
