import type { NextConfig } from "next";

import { siteConfig } from "./src/config/site";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      // 초기 페이지는 `/invoice/guide`다 (siteConfig.guidePath와 같은 값)
      { source: "/", destination: "/invoice/guide", permanent: false },
      // 견적서 목록 주소를 `/invoices`로 짐작하는 경우를 위한 별칭. 쿠키 Path=/admin과 proxy matcher는
      // 그대로 두고, 이동한 `/admin`에서 인증 검사가 이뤄진다
      {
        source: "/invoices",
        destination: siteConfig.adminPath,
        permanent: false,
      },
    ];
  },
  // PDF 폰트(TTF)는 process.cwd() 기준 경로로 읽으므로 파일 추적에 잡히지 않는다.
  // 키는 라우트 경로, 값은 프로젝트 루트 기준 글롭이다
  outputFileTracingIncludes: {
    "/api/generate-pdf": ["src/lib/pdf/fonts/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
