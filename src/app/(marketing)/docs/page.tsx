import { redirect } from "next/navigation";

// 문서 루트는 첫 문서(시작하기)로 이동한다
export default function DocsIndexPage() {
  redirect("/docs/getting-started");
}
