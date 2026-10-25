import { Container } from "@/components/common/container";

// 견적서 영역 독립 레이아웃: 마케팅 헤더·푸터 없이 문서형 화면만 표시한다 (D10)
export default function InvoiceLayout({ children }: LayoutProps<"/invoice">) {
  return (
    <main className="flex flex-1 flex-col py-8 sm:py-12">
      <Container className="flex flex-1 flex-col">{children}</Container>
    </main>
  );
}
