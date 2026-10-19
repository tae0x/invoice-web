# 프로젝트 구조

소스는 모두 `src/` 아래에 있습니다. `public/`, 설정 파일(`next.config.ts`, `tsconfig.json`, `components.json` 등), `CLAUDE.md`·`AGENTS.md`·`README.md`는 루트에, 상세 문서는 `docs/`에 둡니다.

## 폴더 구조와 컴포넌트 계층

폴더가 곧 계층입니다. 의존 방향은 아래에서 위로만 갑니다(상위 계층만 하위 계층을 import).

```
L0 Foundation   src/app/globals.css, src/lib/utils.ts, src/config/site.ts
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
└─ (marketing)/                헤더 + 푸터 레이아웃
   └─ page.tsx                 서비스 안내 홈 (/)
```

## 예정된 구조 (미구현)

PRD(`docs/PRD.md`)에 따라 아래 구조가 구현 단계에서 추가될 예정입니다. 구현 전이므로 현재는 존재하지 않습니다.

- `src/app/(invoice)/` 라우트 그룹: 견적서 열람 화면 (`/invoice/[token]`)
- `src/components/invoice/`: 견적서 UI 블록 (Common 계층의 도메인 블록)
- `src/lib/invoice/`, `src/lib/notion/`: 도메인 로직과 Notion 어댑터

## 규칙

- 서버 컴포넌트가 기본이며, 상호작용이 필요한 말단 컴포넌트에만 `"use client"`를 씁니다.
- 사이트 이름·설명·URL은 `src/config/site.ts` 한 곳에서 관리합니다. 내비게이션 항목이 필요해지면 이 파일에 추가합니다.
- 경로 별칭은 `@/`(`src/`)입니다.
- `src/components/ui`는 shadcn CLI로 추가한 원본이므로 직접 수정을 최소화합니다. 필요한 컴포넌트는 `npx shadcn@latest add <name>`으로 다시 추가할 수 있습니다.
- 클래스 병합은 `cn`(`import { cn } from "cn"`)을 사용합니다.

## 스타터 정리 이력

스타터킷의 문서·예제·앱 셸·로그인/회원가입 코드는 PRD D7 결정에 따라 삭제했습니다. 삭제된 영역은 다음과 같습니다.

- `src/app/(marketing)/docs`, `examples`, `login`, `signup`, `src/app/(app-shell)`
- `src/components/docs`, `src/components/examples`, `AppSidebar`·`ShellHeader`·`Breadcrumbs`·`UserNav`
- zustand 스토어, `useIsMobile` 훅, 미사용 shadcn 컴포넌트(sidebar, form 계열, dialog 등)
