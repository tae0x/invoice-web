# CLAUDE.md

## 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드 (cacheComponents prerender 오류는 빌드에서도 드러남)
npm run start    # 빌드 결과 실행
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # 타입 검사
npx shadcn@latest add <name>  # shadcn 컴포넌트 추가
```

테스트 러너는 설정되어 있지 않다. 동작 검증은 개발 서버 + Playwright MCP로 한다. `.mcp.json`에는 playwright, context7(라이브러리 문서), sequential-thinking, shadcn MCP가 설정되어 있다.

## Next.js 버전 주의

Next.js 16.4 / React 19.3이며 학습 데이터와 다른 API가 있다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 읽는다 (`AGENTS.md` 지침). 예를 들어 에러 바운더리의 복구 prop은 `reset`이 아니라 `retry`다 (`app/error.tsx`).

`next.config.ts`에서 `cacheComponents: true`와 `partialPrefetching: true`가 켜져 있다. 동적 API(`cookies`, `headers`, `Date.now` 등)를 쓰면 Suspense 경계나 `use cache` 처리가 필요하다.

`AGENTS.md`의 `BEGIN:nextjs-agent-rules` 블록은 `next dev`가 자동 생성·갱신하므로 직접 편집하지 않는다.

## 아키텍처

### 폴더가 곧 계층 (`docs/architecture.md`에도 정의됨)

소스는 모두 `src/` 아래에 있다 (`src/app`, `src/components`, `src/config`, `src/hooks`, `src/lib`, `src/stores`). 이 문서의 소스 경로 표기는 `src/`를 생략한다 (루트 설정 파일이 가리키는 경로만 `src/`를 명시). `public/`, 설정 파일, `CLAUDE.md`·`AGENTS.md`·`README.md`는 루트에 있고, 상세 문서는 `docs/`에 있다.

의존 방향은 아래에서 위로만 간다. 상위 계층만 하위 계층을 import 한다.

`config/site.ts`, `stores/`, `hooks/`, `lib/utils.ts` → `components/ui` → `components/common` → `components/layout` → `components/providers` → `app/**/layout.tsx` → `app/**/page.tsx`

`components/docs/`, `components/examples/`는 문서·예제 페이지 전용이다. 기본 계층 밖의 데모 코드이므로 `app/` 하위의 docs·examples 페이지에서만 import 한다.

### 라우트 그룹 2개

- `app/(marketing)/` — `SiteHeader` + `SiteFooter` 레이아웃. 랜딩, `/login`, `/signup`, `/docs/*`, `/examples/*`가 여기에 속한다. `docs/layout.tsx`는 좌측 내비게이션과 이전/다음 링크가 추가된 중첩 레이아웃이다.
- `app/(app-shell)/examples/sidebar-layout/` — `SidebarProvider` + `AppSidebar` + `ShellHeader` 앱형 레이아웃. 마케팅 레이아웃과 별개로 동작한다.

`/examples/*` URL은 두 그룹에 걸쳐 있다. 목록(`/examples`)과 `components`·`forms`·`hooks`·`layouts`는 marketing, `/examples/sidebar-layout`만 app-shell이다.

### `config/site.ts`가 네비게이션의 단일 출처

`mainNav`, `docsNav`, `examplesNav`, `shellNav`, `routeLabels`가 모두 여기에 있다. 페이지를 추가하거나 지우면 이 파일을 함께 수정해야 한다.
- `docsNav`의 순서가 곧 `DocPager`의 이전/다음 문서 순서다 (`docsPages`로 평탄화됨).
- `Breadcrumbs`는 경로 세그먼트를 `routeLabels`로 변환한다. 라벨이 없으면 세그먼트 원문이 노출된다.

### shadcn/ui는 Base UI 기반 (`base-nova`)

Radix가 아니므로 `asChild`가 없다. 대신 `render` prop을 쓴다. 링크 버튼은 `<Button render={<Link href="..." />} nativeButton={false}>` 형태다. `DialogTrigger`, `BreadcrumbLink` 등 트리거·링크 계열 컴포넌트도 같은 방식이다. `components/ui`는 CLI로 추가한 원본이므로 직접 수정을 최소화한다.

### 클래스 병합과 경로

- `cn`은 `@/lib/utils`가 아니라 `cn` 패키지에서 import 한다: `import { cn } from "cn"`. `components.json`의 utils 별칭은 `@/lib/utils`이므로, CLI로 컴포넌트를 추가한 뒤 생성된 파일의 `cn` import를 확인한다.
- 경로 별칭은 `@/*` (`src/`). `components.json`의 `tailwind.css`는 `src/app/globals.css`다.

### 스타일링

- 색상은 시맨틱 토큰(`text-muted-foreground`, `bg-muted`, `border` 등)만 쓰고 하드코딩 색을 쓰지 않는다. 다크 모드가 토큰으로 처리된다.
- 페이지 콘텐츠 폭은 `Container`(`components/common`)로 통일한다.

### 클라이언트/서버 경계

- 서버 컴포넌트가 기본이며 `"use client"`는 말단에만 쓴다. 현재 경로가 필요한 컴포넌트(`MainNav`, `DocsNav`, `DocPager`, `Breadcrumbs`, `AppSidebar`)는 `usePathname`을 쓰는 클라이언트 컴포넌트다.
- zustand 스토어(`stores/`)는 클라이언트 컴포넌트에서만 import 한다.
- `usehooks-ts`의 `useLocalStorage`, `useMediaQuery` 등은 hydration 불일치를 막기 위해 `initializeWithValue: false`를 쓴다 (`hooks/use-mobile.ts`, `settings-form.tsx` 참고).
- `ThemeProvider`(next-themes, class 방식), `TooltipProvider`, `Toaster`(sonner)는 `app/layout.tsx`에 한 번만 둔다. 하위에서 중복 선언하지 않는다. `<html>`에는 `suppressHydrationWarning`이 필요하고, 다크 변형은 `globals.css`의 `@custom-variant dark`와 연결된다.

### 폼, 타입, 메타데이터

- 폼은 react-hook-form + `zodResolver`(zod v4) + shadcn `Field` 조합이다. 기준 예제는 `app/(marketing)/login/login-form.tsx`(간단한 카드 폼)와 `components/examples/signup-form.tsx`(모든 입력 유형 데모). `/signup` 전용 폼은 `app/(marketing)/signup/signup-form.tsx`로, 이름이 같은 `SignupForm`이 두 곳에 있으니 import 경로에 주의한다.
- 레이아웃의 props 타입은 전역 헬퍼 `LayoutProps<"/경로">`를 쓴다 (`app/layout.tsx` 참고).
- 페이지의 `metadata`는 `title`만 지정한다. 루트 `layout.tsx`의 title template이 `%s | 사이트명`으로 완성한다.

## 환경 변수

`NEXT_PUBLIC_SITE_URL`만 사용한다 (`config/site.ts`의 `siteConfig.url`, `metadataBase`의 기준). 없으면 `http://localhost:3000`이다. 예시는 `.env.example`에 있다.

## 코드 리뷰

코드 구현(기능 추가·수정·리팩토링)을 마치면 응답을 끝내기 전에 `code-reviewer` 서브에이전트를 실행해 변경사항을 리뷰하고, 지적 사항을 사용자에게 보고한다. 문서·설정만 바뀐 경우는 생략한다.

## Git

`.playwright-mcp/`(Playwright MCP 산출물)는 gitignore 대상이다.
