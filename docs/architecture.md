# 프로젝트 구조

소스는 모두 `src/` 아래에 있습니다. `public/`, 설정 파일(`next.config.ts`, `tsconfig.json`, `components.json` 등), `CLAUDE.md`·`AGENTS.md`·`README.md`는 루트에, 상세 문서는 `docs/`에 둡니다.

## 폴더 구조와 컴포넌트 계층

폴더가 곧 계층입니다. 의존 방향은 아래에서 위로만 갑니다(상위 계층만 하위 계층을 import).

```
L0 Foundation   src/app/globals.css, src/lib/utils.ts, src/config/site.ts, src/stores/, src/hooks/
L1 Primitives   src/components/ui/          shadcn 원본 (CLI로만 추가)
L2 Common       src/components/common/      ui를 조합한 재사용 블록 (로고, 테마 토글, 브레드크럼 등)
L3 Layout       src/components/layout/      헤더, 푸터, 사이드바 등 영역 단위 조립체
L4 Providers    src/components/providers/   ThemeProvider
L5 Templates    src/app/**/layout.tsx       라우트 그룹별 레이아웃
L6 Pages        src/app/**/page.tsx         페이지
```

`src/components/docs/`, `src/components/examples/`는 문서·예제 페이지 전용 데모 블록으로, 위 계층 밖에 있습니다.

```
src/app/
├─ layout.tsx                  루트 레이아웃 (폰트, 테마, 토스트)
├─ loading.tsx / error.tsx / global-error.tsx / not-found.tsx
├─ (marketing)/                헤더 + 푸터 레이아웃
│  ├─ page.tsx                 랜딩 페이지 (/)
│  ├─ login/                   로그인 폼 (/login)
│  ├─ signup/                  회원가입 폼 (/signup)
│  ├─ docs/                    문서 (/docs/*) - 좌측 내비게이션 레이아웃
│  └─ examples/                예제 (/examples/*)
└─ (app-shell)/examples/sidebar-layout/
                               사이드바 앱 셸 예제 (/examples/sidebar-layout)
```

## 규칙

- 서버 컴포넌트가 기본이며, 상호작용이 필요한 말단 컴포넌트에만 `"use client"`를 씁니다.
- 사이트 이름, 네비게이션, 브레드크럼 라벨은 `src/config/site.ts` 한 곳에서 관리합니다.
- 경로 별칭은 `@/`(`src/`)입니다.
- `src/components/ui`는 shadcn CLI로 추가한 원본이므로 직접 수정을 최소화합니다.
- 클래스 병합은 `cn`(`import { cn } from "cn"`)을 사용합니다.

## 문서와 예제

개발 서버를 실행하면 아래 경로에서 사용법과 동작하는 예제를 볼 수 있습니다.

| 경로 | 내용 |
| --- | --- |
| `/docs/getting-started` | 시작하기 (설치, 스크립트, 환경 변수) |
| `/docs/project-structure` | 프로젝트 구조와 코드 규칙 |
| `/docs/components` | 설치된 UI 컴포넌트와 Base UI 사용법 |
| `/docs/hooks` | 훅 라이브러리 (usehooks-ts) |
| `/docs/forms` | 폼 & 검증 |
| `/docs/state` | 상태 관리 (zustand) |
| `/docs/theming` | 테마와 디자인 토큰 |
| `/examples/components` | 컴포넌트 쇼케이스 |
| `/examples/layouts` | 레이아웃 예제 |
| `/examples/forms` | 폼 예제 (React Hook Form + Zod) |
| `/examples/hooks` | 훅 예제 |
| `/examples/sidebar-layout` | 사이드바 앱 셸 (사이드바 + 상단바 + 전역 상태) |

문서·예제가 필요 없다면 `src/app/(marketing)/docs`, `src/app/(marketing)/examples`, `src/app/(app-shell)`, `src/components/docs`, `src/components/examples`를 삭제하고 `src/config/site.ts`의 `mainNav`를 정리하세요.
