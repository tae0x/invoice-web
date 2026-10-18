import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/docs/code-block";
import { DocContent } from "@/components/docs/doc-content";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "시작하기",
};

export default function GettingStartedPage() {
  return (
    <DocContent
      title="시작하기"
      description="설치부터 개발 서버 실행까지 5분이면 충분합니다."
    >
      <h2 id="requirements">요구 사항</h2>
      <ul>
        <li>Node.js 20.9 이상</li>
        <li>npm (또는 호환되는 패키지 매니저)</li>
      </ul>

      <h2 id="install">설치 및 실행</h2>
      <CodeBlock
        title="터미널"
        code={`npm install
cp .env.example .env.local   # 필요 시 환경 변수 수정
npm run dev`}
      />
      <p>
        브라우저에서 <code>http://localhost:3000</code>을 열면 랜딩 페이지가
        보입니다.
      </p>

      <h2 id="scripts">스크립트</h2>
      <ul>
        <li>
          <code>npm run dev</code> — 개발 서버 실행
        </li>
        <li>
          <code>npm run build</code> — 프로덕션 빌드
        </li>
        <li>
          <code>npm run start</code> — 프로덕션 서버 실행
        </li>
        <li>
          <code>npm run lint</code> — ESLint 검사
        </li>
      </ul>

      <h2 id="env">환경 변수</h2>
      <p>
        <code>NEXT_PUBLIC_SITE_URL</code>은 metadata의 절대 경로 기준이 되는 사이트
        URL입니다. 설정하지 않으면 <code>http://localhost:3000</code>을 사용합니다.
      </p>

      <h2 id="customize">내 프로젝트로 바꾸기</h2>
      <ol>
        <li>
          <code>src/config/site.ts</code>에서 사이트 이름, 설명, 네비게이션을
          수정합니다.
        </li>
        <li>
          <code>src/app/(marketing)/page.tsx</code>의 랜딩 내용을 서비스에 맞게
          바꿉니다.
        </li>
        <li>
          필요 없는 문서·예제 라우트(<code>src/app/(marketing)/docs</code>,{" "}
          <code>src/app/(marketing)/examples</code>,{" "}
          <code>src/app/(app-shell)</code>)는 폴더째 삭제해도 됩니다. 삭제 후{" "}
          <code>src/config/site.ts</code>의 <code>mainNav</code>도 정리하세요.
        </li>
      </ol>

      <Alert>
        <AlertTitle>다음 단계</AlertTitle>
        <AlertDescription>
          <Link href="/docs/project-structure">프로젝트 구조</Link>를 읽고 폴더
          규칙을 익힌 뒤, <Link href="/examples">예제</Link>를 직접 눌러보세요.
        </AlertDescription>
      </Alert>
    </DocContent>
  );
}
