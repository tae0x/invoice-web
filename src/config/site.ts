// 사이트 기본 정보 (metadata, 헤더, 푸터에서 공유)
// 서비스명은 임시값이며 확정되면 변경한다
export const siteConfig = {
  name: "Invoice Web",
  description:
    "노션으로 작성한 견적서를 링크 하나로 확인하고 PDF로 저장합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // 서비스 초기 화면 (조회 방법 안내). `/`는 여기로 리디렉트한다
  guidePath: "/invoice/guide",
  // 견적서 발행자 정보 (D7: 상호·이메일만 둔다. 화면과 PDF가 공통으로 사용)
  // 아래 값은 가상 값이므로 실제 상호·이메일로 교체한다
  issuer: {
    name: "Invoice Web 스튜디오",
    email: "hello@example.com",
  },
};
