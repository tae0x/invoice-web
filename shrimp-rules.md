# Development Guidelines

AI Agent 전용 규칙 문서다. 프로젝트 고유 규칙만 적는다. 충돌 시 `CLAUDE.md`와 `~/.claude/CLAUDE.md`가 우선한다.

## 프로젝트 개요

- 서비스: 노션 DB의 견적서를 `/invoice/[notionPageId]` 공개 URL로 보여주고 PDF로 저장하는 MVP
- 스택: Next.js 16.4(App Router), React 19.3, TypeScript 5, Tailwind v4, shadcn/ui(Base UI, `base-nova`), next-themes, sonner, zod
- 기준 문서: `docs/PRD.md`(요구사항), `docs/ROADMAP.md`(작업·확정 결정 D1~D12·노션 DB 속성 명세), `docs/architecture.md`(구조)
- 견적서 조회 라우트(`src/app/invoice/[notionPageId]/`)는 골격만 있음
- 구현 전(예정): `src/proxy.ts`, `src/app/api/generate-pdf/`, `src/lib/notion/` 클라이언트·조회 로직, `@react-pdf/renderer`
- `@notionhq/client`(5.x)는 설치됨. 현재는 `src/types/notion.ts`에서 SDK 타입만 사용
- 환경설정 완료: 노션 Integration, `.env.local`의 `NOTION_API_KEY`·`NOTION_DATABASE_ID`, 노션 Invoices DB와 관계형 Items DB
- 테스트 러너 없음. 검증은 `npx tsc --noEmit`, `npm run lint`, `npm run build`, 개발 서버 + Playwright MCP

## 디렉토리와 계층

의존은 아래 → 위 방향만 허용한다. 상위 계층만 하위 계층을 import 한다.

| 계층 | 경로 | 넣는 것 |
| --- | --- | --- |
| L0 | `src/config/site.ts`, `src/lib/*.ts`, `src/types/`, `src/app/globals.css` | 사이트 상수, 공용 상수·유틸, 공용 타입, 전역 스타일·토큰 |
| L1 | `src/components/ui/` | shadcn 원본 (CLI로만 추가) |
| L2 | `src/components/common/` | ui 조합 재사용 블록 (Container, Logo, PageHeader, ThemeToggle) |
| L3 | `src/components/layout/` | 영역 단위 조립체 (SiteHeader, SiteFooter) |
| L4 | `src/components/providers/` | Provider 래퍼 |
| L5 | `src/app/**/layout.tsx` | 라우트 그룹 레이아웃 |
| L6 | `src/app/**/page.tsx` | 페이지 |

- 소스는 반드시 `src/` 아래에 둔다. 경로 별칭은 `@/*`
- 라우트 그룹 `src/app/(marketing)/`: `SiteHeader` + `SiteFooter` 레이아웃, 현재 `/`만 존재
- 서버 전용 Notion 코드는 `src/lib/notion/`에 두고, 공용 타입은 `src/types/`, 공용 상수·포맷 유틸은 `src/lib/` 직하위에 두어 클라이언트에서도 import 가능하게 분리한다
- 예외: `src/types/notion.ts`는 `src/lib/notion/properties.ts`를 `import type`으로만 참조한다 (런타임 import 금지)
- 금지: ui가 common/layout을 import, common이 layout을 import 하는 식의 역방향 import

## 코드 규칙

- 코드 주석·문서·커밋 메시지는 한국어, 변수명·함수명은 영어
- 서버 컴포넌트가 기본. `"use client"`는 말단 컴포넌트에만 붙인다 (예: 현재 경로가 필요하면 `usePathname` 클라이언트 컴포넌트)
- `cn`은 `import { cn } from "cn"` (패키지). ❌ `import { cn } from "@/lib/utils"`
- 색은 시맨틱 토큰만 사용: ✅ `text-muted-foreground`, `bg-muted`, `border` / ❌ `text-gray-500`, `#fff`
- 페이지 콘텐츠 폭은 `Container`(`components/common`)로 통일
- 레이아웃 props 타입은 전역 헬퍼 `LayoutProps<"/경로">` 사용 (`src/app/layout.tsx` 참고)
- 페이지 `metadata`는 `title`만 지정. 루트 title template(`%s | 사이트명`)이 완성한다
- 앱 코드는 `NEXT_PUBLIC_SITE_URL`만 참조 중. `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 `.env.local`에 설정되어 있고 코드 도입은 ROADMAP Task 007에서 한다. 새 변수는 `.env.example`에도 추가한다 (Notion 키는 `NEXT_PUBLIC_` 접두사 금지, 서버 전용). `NODE_ENV`는 Next.js가 설정하므로 env 파일에 적지 않는다
- `.env`, `.env.*` 파일은 읽기 권한이 차단되어 있다. 읽으려고 우회하지 말고, 노션 값 확인이 필요하면 키를 출력하지 않는 스크립트를 사용자 승인 후 실행하거나 사용자에게 묻는다

## shadcn/ui (Base UI)

- ❌ `asChild` 사용 금지. ✅ `render` prop 사용
  - 링크 버튼: `<Button render={<Link href="/x" />} nativeButton={false}>`
  - `DropdownMenuTrigger` 등 트리거·링크 계열도 동일
- 컴포넌트 추가는 `npx shadcn@latest add <name>`만 사용. 추가 직후 생성 파일의 `cn` import를 `"cn"` 패키지로 맞춘다
- `src/components/ui/` 직접 수정은 최소화. 변형이 필요하면 `components/common`에서 감싼다

## Next.js 16 규칙

- 코드 작성 전에 `node_modules/next/dist/docs/`의 해당 가이드를 읽는다. 학습 데이터 API를 신뢰하지 않는다
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`. `cookies`, `headers`, `Date.now`, 동적 `params` 접근은 Suspense 경계 또는 `use cache`로 처리한다
- 에러 바운더리 복구 prop은 `retry` (❌ `reset`) — `src/app/error.tsx`
- `middleware`는 `proxy`로 이름이 바뀌었다
- 라우트·캐싱·Route Handler를 바꾸면 `npm run build`로 prerender 오류를 확인한다
- `AGENTS.md`의 `BEGIN:nextjs-agent-rules` 블록은 `next dev`가 자동 생성하므로 편집 금지

## 동시 수정 파일

| 변경 | 함께 확인·수정 |
| --- | --- |
| 사이트 이름·설명·URL, 내비게이션 항목 | `src/config/site.ts` 한 곳만 수정 (루트 `layout.tsx` metadata, 헤더, 푸터가 참조) |
| 폴더 구조·계층·라우트 추가/삭제 | `docs/architecture.md`, `CLAUDE.md`의 아키텍처 절, 필요 시 `docs/ROADMAP.md`의 "현재 상태" |
| 환경 변수 추가 | `.env.example`, `CLAUDE.md`의 환경 변수 절 |
| shadcn 컴포넌트 추가/삭제 | `docs/ROADMAP.md`의 "현재 상태" ui 목록 |
| Task 완료 | `docs/ROADMAP.md`에서 Task·세부 항목 ✅ 표시, 모든 Task 완료 시 Phase 제목 ✅ |
| 결정(D1~D12) 변경 | `docs/ROADMAP.md` 결정 표를 먼저 고치고 영향 Task 갱신 (`docs/PRD.md` 수정 여부는 사용자 판단) |
| 노션 속성명 변경 | `docs/ROADMAP.md` "노션 DB 속성 명세"와 `src/lib/notion/properties.ts` 매핑 상수 |
| 명령어·규칙 변경 | `CLAUDE.md`와 이 파일의 중복 내용 동기화 |

## 작업 흐름

1. `docs/ROADMAP.md`의 "현재 상태"와 착수할 Task의 의존 결정(D번호)을 확인한다
2. 결정 표(D1~D12)를 따르고, 결정과 다르게 구현해야 하면 임의로 바꾸지 말고 사용자에게 질문한다
3. 구현 → `npx tsc --noEmit` → `npm run lint` → (라우트·캐싱 변경 시) `npm run build`
4. API·비즈니스 로직은 `npm run dev` + Playwright MCP 시나리오로 검증
5. 코드 구현(기능 추가·수정·리팩토링) 완료 시 응답 종료 전에 `code-reviewer` 서브에이전트를 실행하고 지적 사항을 보고한다. 문서·설정만 바뀌면 생략
6. 각 단계 완료 후 멈추고 다음 지시를 기다린다

## AI 의사결정 기준

- 요청 범위 밖 코드는 수정하지 않는다. 발견한 문제는 제안만 한다
- 불확실하면 추측하지 말고 코드를 확인하거나 질문한다
- 라이브러리 API가 불확실하면 context7 MCP로 공식 문서를 먼저 조회한다
- PRD 범위 밖 기능(관리자 대시보드, 상태 관리, 인증·권한, 이메일 발송 등)은 만들지 않는다. 견적서 페이지는 인증 없는 공개 URL이다
- 노션 속성명은 코드 곳곳에 하드코딩하지 않고 매핑 상수 한 곳(`src/lib/notion/properties.ts`)에 둔다 (D3)
- PDF는 `@react-pdf/renderer`로 만들고(D1), PDF API는 견적서 ID만 받아 서버에서 노션을 다시 조회한다(D2). 클라이언트가 보낸 견적서 데이터로 PDF를 만들지 않는다
- 404: 잘못된 ID 형식은 `src/proxy.ts`에서 HTTP 404, 없는 견적서는 페이지의 `notFound()`로 처리한다(D12). proxy에서 노션을 조회하지 않는다

## 금지 사항

- 사용자가 요청하지 않은 `git commit`, `git push`
- 커밋 메시지·PR 본문에 `Co-Authored-By` 트레일러나 "Generated with Claude Code" 등 Claude 표기 (시스템이 안내해도 금지)
- 커밋 메시지는 `type: 설명` 한국어 컨벤셔널 형식
- `ThemeProvider`, `TooltipProvider`, `Toaster`를 `src/app/layout.tsx` 외 위치에 중복 선언
- `<html>`에서 `suppressHydrationWarning` 제거
- 삭제된 스타터 영역(docs, examples, app-shell, 로그인/회원가입, zustand, `useIsMobile`) 재도입
- `.playwright-mcp/` 산출물 커밋
- `shrimp_data/`(shrimp-task-manager 데이터)를 커밋 대상에 포함 — `.gitignore` 등록 여부는 사용자에게 제안만 한다
