// 사이트 기본 정보 (metadata, 헤더, 푸터에서 공유)
// 서비스명은 임시값이며 확정되면 변경한다
export const siteConfig = {
  name: "Invoice Web",
  description: "노션으로 작성한 견적서를 링크 하나로 확인하고 PDF로 저장합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
