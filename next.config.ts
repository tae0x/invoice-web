import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // 초기 페이지는 `/invoice/guide`다 (siteConfig.guidePath와 같은 값)
  async redirects() {
    return [{ source: "/", destination: "/invoice/guide", permanent: false }];
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
