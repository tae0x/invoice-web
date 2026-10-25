# 프로젝트 구조

소스는 모두 `src/` 아래에 있습니다. `public/`, 설정 파일(`next.config.ts`, `tsconfig.json`, `components.json` 등), `CLAUDE.md`·`AGENTS.md`·`README.md`는 루트에, 상세 문서는 `docs/`에 둡니다.

## 폴더 구조와 컴포넌트 계층

폴더가 곧 계층입니다. 의존 방향은 아래에서 위로만 갑니다(상위 계층만 하위 계층을 import).

```
L0 Foundation   src/app/globals.css, src/config/site.ts, src/lib/*.ts, src/types/
L1 Primitives   src/components/ui/          shadcn 원본 (CLI로만 추가)
L2 Common       src/components/common/      ui를 조합한 재사용 블록 (로고, 테마 토글, 컨테이너 등)
L3 Layout       src/components/layout/      헤더, 푸터 등 영역 단위 조립체
L4 Providers    src/components/providers/   ThemeProvider
L5 Templates    src/app/**/layout.tsx       라우트 그룹별 레이아웃
L6 Pages        src/app/**/page.tsx         페이지
```

```
src/app/
├─ layout.tsx                  루트 레이아웃 (폰트, 테마, 툴팁, 토스트)
├─ loading.tsx / error.tsx / global-error.tsx / not-found.tsx
├─ (marketing)/                헤더 + 푸터 레이아웃
│  └─ invoice/guide/page.tsx   서비스 안내 (/invoice/guide, `/`는 여기로 리디렉트)
├─ api/generate-pdf/route.tsx  PDF 생성 Route Handler (POST, 견적서 ID만 받아 서버가 노션을 재조회, D2)
└─ invoice/
   ├─ layout.tsx               견적서 전용 레이아웃 (헤더·푸터 없음, Container만 사용)
   ├─ [notionPageId]/          견적서 조회 (/invoice/[notionPageId])
   │  ├─ page.tsx / loading.tsx / error.tsx / not-found.tsx
   │  └─ _components/          견적서 전용 컴포넌트 (비공개 폴더)
   └─ invalid-id/              형식이 틀린 ID의 정적 404 (proxy rewrite 대상, not-found.tsx는 위 404 화면 재사용)
src/proxy.ts                   /invoice/:path* ID 형식 검사 → 형식 오류는 invalid-id로 rewrite (D12, 노션 조회 없음)
```

```
src/types/                     공용 타입 (서버·클라이언트 공용)
├─ invoices.ts                 견적서 도메인 타입 (Invoice, InvoiceItem, InvoiceStatus)
├─ notion.ts                   노션 속성 값 타입 (@notionhq/client SDK 타입 재사용)
└─ pdf.ts                      PDF API 요청·응답 타입
src/lib/
├─ utils.ts                    cn re-export
├─ constants.ts                상태 옵션·라벨, 로케일·통화·시간대 상수
├─ format.ts                   금액·날짜 포맷 유틸
├─ invoice-schema.ts           노션 페이지 ID zod 스키마
├─ pdf/                        PDF 생성 (서버 전용, `server-only`)
│  ├─ fonts.ts / fonts/        Noto Sans KR 정적 TTF 등록
│  ├─ invoice-document.tsx     A4 견적서 PDF 문서
│  ├─ render-invoice-pdf.tsx   renderInvoicePdf(invoice) → Buffer
│  └─ response-headers.ts      파일명 정리·Content-Disposition 등 응답 헤더
└─ notion/                    노션 연동 (서버 전용, `server-only`. types/notion.ts만 properties.ts를 import type으로 참조)
   ├─ properties.ts            노션 속성명 매핑 상수
   ├─ env.ts                   NOTION_API_KEY·NOTION_DATABASE_ID 지연 검증 (zod)
   ├─ client.ts                노션 클라이언트 싱글턴
   ├─ mappers.ts               노션 속성 → 도메인 값 변환
   └─ invoices.ts              getInvoice (견적서 + 항목 조회)
```

## 규칙

- 서버 컴포넌트가 기본이며, 상호작용이 필요한 말단 컴포넌트에만 `"use client"`를 씁니다.
- 사이트 이름·설명·URL은 `src/config/site.ts` 한 곳에서 관리합니다. 내비게이션 항목이 필요해지면 이 파일에 추가합니다.
- 경로 별칭은 `@/`(`src/`)입니다.
- `src/components/ui`는 shadcn CLI로 추가한 원본이므로 직접 수정을 최소화합니다. 필요한 컴포넌트는 `npx shadcn@latest add <name>`으로 다시 추가할 수 있습니다.
- 클래스 병합은 `cn`(`import { cn } from "cn"`)을 사용합니다.

## 스타터 정리 이력

스타터킷의 문서·예제·앱 셸·로그인/회원가입 코드는 삭제했습니다. 삭제된 영역은 다음과 같습니다.

- `src/app/(marketing)/docs`, `examples`, `login`, `signup`, `src/app/(app-shell)`
- `src/components/docs`, `src/components/examples`, `AppSidebar`·`ShellHeader`·`Breadcrumbs`·`UserNav`
- zustand 스토어, `useIsMobile` 훅, 미사용 shadcn 컴포넌트(sidebar, form 계열, dialog 등)
