# Invoice Web 고도화 로드맵

발행자가 관리자 화면에서 견적서 목록을 보고, 클라이언트에게 보낼 링크를 바로 복사할 수 있게 합니다.

**📅 최종 업데이트**: 2026-10-26
**📊 진행 상황**: Phase 5~10 ✅ 완료 (11/11 Tasks 완료, 100%). 배포 환경에서 F020~F023 동작 확인. Task 111의 노션 데이터 확인 3건(새 견적서 반영, 휴지통 제외, 발행일 정렬)은 사용자 결정으로 하지 않기로 해 미검증
**📝 문서 버전**: v2.1 (고도화)

> 이 문서는 [`docs/roadmaps/ROADMAP_V1.md`](./roadmaps/ROADMAP_V1.md)(MVP, Phase 1~4·Task 001~013 완료)의 후속 문서입니다. V1의 확정 결정 D1~D12, 완료 기록, 실측값은 V1 문서가 기준이며 여기서는 다시 적지 않습니다. Phase는 5부터, Task는 101부터 번호를 매깁니다.

## 개요

Invoice Web은 견적서를 발행하는 프리랜서·소규모 기업(발행자)과 견적서를 받는 클라이언트를 위한 서비스입니다. MVP는 노션 DB의 견적서를 `/invoice/[notionPageId]` 공개 URL로 보여 주고 PDF로 저장하게 했고, Vercel(`https://invoice-web-ashy.vercel.app`)에 배포했습니다. 이번 고도화에서는 발행자용 기능을 더합니다.

- **관리자 견적서 목록 (F020)**: 관리자 레이아웃에서 노션 Invoices DB의 견적서 목록(번호, 클라이언트명, 발행일, 유효기간, 상태, 총 금액)을 본다
- **견적서 링크 복사 (F021)**: 목록의 각 견적서에서 클라이언트에게 보낼 `/invoice/<ID>` 링크를 복사한다(복사 버튼 + 토스트)
- **관리자 접근 보호 (F022)**: 목록은 모든 견적서의 클라이언트명·금액을 한 번에 보여 주므로 환경 변수 비밀번호로 관리자만 접근하게 한다
- **다크 모드 보완 (F023)**: 다크 모드(next-themes)는 이미 있다. 새로 만드는 관리자 화면에 테마 전환을 둔다

기능 ID는 PRD(F001~F012)와 겹치지 않게 F020부터 매겼습니다. 기준 문서: `docs/PRD.md`("MVP 이후 기능"의 관리자 대시보드, "향후 개선 방향 Phase 2: 관리 기능"), `docs/roadmaps/ROADMAP_V1.md`, `docs/architecture.md`, `docs/notion-setup.md`, `CLAUDE.md`

## 현재 상태 (V1 완료 시점, 코드 확인 결과)

- MVP 전체(F001~F003, F010~F012)와 Vercel 배포 완료. 상세는 V1 문서
- 노션 계층(`src/lib/notion/`, 모두 `server-only`): `env.ts`, `client.ts`, `mappers.ts`(속성 읽기 함수와 `mapInvoice`), `properties.ts`(속성명 매핑), `invoices.ts`(`getInvoice` 단건 조회, `getCachedInvoice` 60초 캐시)
- 데이터 소스: SDK `@notionhq/client` 5.28.0, 기본 `Notion-Version` 2025-09-03. `NOTION_DATABASE_ID`는 데이터베이스 ID이고 쿼리는 `dataSources.query`(데이터 소스 ID 필요)로 한다. 현재 코드는 견적서 페이지의 `parent.data_source_id`로 Invoices 데이터 소스를 알아내므로, **데이터베이스 ID → 데이터 소스 ID 변환 코드는 아직 없다**(SDK `databases.retrieve` 응답의 `data_sources` 배열을 쓸 수 있음)
- `src/proxy.ts`: `matcher`는 `/invoice/:path*` 하나. `guide`와 형식이 맞는 ID만 통과, 그 외는 `/invoice/invalid-id`로 404 rewrite(D12)
- 서버 로거 `src/lib/logger.ts`, PDF API 호출 제한 `src/lib/pdf/rate-limit.ts`(`getClientKey`·`checkPdfRateLimit` export, `x-forwarded-for`는 Vercel 전제)
- 링크 기준값 `siteConfig.url`(`src/config/site.ts`, `NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`). V1에서 Vercel의 `NEXT_PUBLIC_SITE_URL` 설정은 확인되지 않았다
- 견적서 링크는 지금 노션 `견적서 URL` 수식이 만들고(D5), 앱은 이 속성을 읽지 않는다(`docs/notion-setup.md` 3절)
- shadcn ui(`base-nova`) 설치분: alert, badge, button, card, dropdown-menu, empty, input, label, navigation-menu, separator, sheet, skeleton, sonner, spinner, table, tooltip
- 인증·세션 코드와 인증 라이브러리는 없다
- 테스트 러너 없음. 검증은 `npm run check-all`, `npm run build`, 개발·프로덕션 서버 + Playwright MCP

### 다크 모드 현재 상태 (코드로 확인)

| 항목 | 상태 | 근거 |
| --- | --- | --- |
| 테마 엔진 | 있음 | `src/app/layout.tsx`의 `ThemeProvider`(next-themes, `attribute="class"`, `defaultTheme="system"`, `enableSystem`) |
| 다크 토큰 | 있음 | `src/app/globals.css`의 `.dark` 토큰 전체와 `@custom-variant dark`. 화면 코드에 하드코딩 색 없음(PDF 고정 색만 있음) |
| 테마 전환 UI | 마케팅 영역에만 있음 | `ThemeToggle`(`src/components/common/theme-toggle.tsx`)은 `SiteHeader`에서만 쓴다 |
| 견적서 화면 | OS·저장된 설정을 따름 | 헤더 없는 독립 레이아웃(D10). V1 Task 012-3에서 다크 대비 확인 |
| 토스트 | 테마 연동됨 | `src/components/ui/sonner.tsx`가 `useTheme()` 값을 씀 |
| PDF | 항상 라이트(의도) | 인쇄용 문서. 앱 안 PDF 미리보기는 없음 |

결론: 다크 모드는 이미 동작한다. 이번에는 관리자 상단바·로그인 화면에 `ThemeToggle`을 두는 것(Task 104)만 한다. 견적서 화면에는 추가하지 않는다(D20).

아직 없는 것: `.env.example`의 노션 변수 항목(V1부터 사용자 반영 대기)과 이번 관리자 변수 항목. 에이전트는 `.env*` 파일을 읽거나 고칠 수 없으므로 사용자가 직접 수정한다.

## 범위

- **포함**: F020 관리자 견적서 목록, F021 링크 복사, F022 관리자 접근 보호, F023 관리자 화면 테마 전환, 이를 위한 배포 반영
- **범위 밖(비목표)**:
  - 견적서 생성·수정·삭제 UI, 상태 변경·승인/거절 추적(D4 유지), 이메일 발송, 만료 알림, 다중 관리자 계정, 회원가입, 비밀번호 재설정, 외부 OAuth, 관리자용 견적서 상세·PDF, 템플릿·다국어·전자 서명·버전 관리
  - 참고용 예시 로드맵에 있던 검색·필터·정렬·페이지네이션, QR·짧은 URL, 메신저·이메일 공유, 조회수 통계, 감사 로그·역할 기반 접근 제어, 차트는 이번 고도화 요구사항에 없으므로 제외한다 (목록은 고정 정렬 1가지만 제공)
  - 정상 견적서 페이지의 `noindex` 추가는 제안만 한다(현재 404 화면에만 있음)
- 견적서 페이지의 공개 URL 모델(인증 없음)은 그대로 둔다. 인증은 `/admin` 아래에만 적용한다

## 작업 크기와 일정 표기

날짜 없이 크기와 순서로만 표현합니다.

- **S**: 단일 관심사, 파일 1~3개 수준, 외부 의존 없음
- **M**: 여러 모듈에 걸침, 외부 API 연동 또는 보안 로직 포함

## 고도화 결정 (D13~D21, 확정)

Task 101에서 확정했습니다. 결정을 바꿀 때는 이 표를 먼저 고친 뒤 영향받는 Task를 갱신합니다.

| ID | 항목 | 결정 | 근거 (대안) | 영향 Task |
| --- | --- | --- | --- | --- |
| D13 | 관리자 라우트·레이아웃 | `src/app/admin/`(`/admin`). `layout.tsx`(공통, `noindex` 메타데이터), `(dashboard)/layout.tsx`(관리자 상단바 + `className`으로 넓힌 `Container`), `(dashboard)/page.tsx`(`/admin` = 목록), `login/page.tsx`(`/admin/login`, 상단바 없음). 관리자 전용 컴포넌트는 `(dashboard)/_components/`. 메뉴가 1개라 상단바만 두고 shadcn `sidebar`는 쓰지 않는다 | V1 `invoice/` 독립 레이아웃(D10)과 같은 구조. 라우트 그룹으로 로그인 화면에서 상단바를 뺀다 (대안: `sidebar`는 메뉴가 늘면 도입) | 102, 104, 105 |
| D14 | 관리자 인증 방식 | 환경 변수 비밀번호 + 서명 쿠키 세션. `/admin/login` 폼 → Server Action이 비밀번호를 상수 시간 비교 → 만료 시각을 담은 토큰을 HMAC-SHA256으로 서명해 쿠키 발급. 계정 1개, 세션 8시간. Web Crypto로 서명하고 `jose` 등 새 라이브러리는 도입하지 않는다(구현이 안 되면 그때 사용자에게 다시 묻는다). 로그인 시도 제한은 IP당 60초 5회 | 관리자 1명 규모에서 Next.js 문서(`02-guides/authentication.md`)가 권하는 구조를 가장 작게 따른다 (대안: Basic Auth는 로그아웃 불가, Vercel 비밀번호 보호는 공개 견적서까지 막음, 외부 인증은 과함) | 107, 108, 109 |
| D15 | 인증 검사 위치·실패 동작·`noindex` | (1) `src/proxy.ts`의 `matcher`를 `["/invoice/:path*", "/admin/:path*"]`로 넓히고 경로별로 분기. `/admin/login`을 뺀 관리자 경로는 쿠키 토큰의 서명·만료만 검사(조회 없음)하고 실패 시 `/admin/login?next=<원래 경로>`로 307. `/invoice/*` 분기는 그대로 (2) 목록을 읽기 직전 서버에서 `verifyAdminSession()`(DAL)으로 다시 검사. `cookies()`를 쓰므로 Suspense 안 컴포넌트에서만 호출 (3) Server Action도 안에서 다시 검사 (4) `next`는 `/admin`으로 시작하고 `//`가 아닌 경로만 허용 (5) 쿠키는 `HttpOnly`·`Secure`(프로덕션)·`SameSite=Lax`·`Path=/admin`·`Max-Age` 8시간 (6) `src/app/admin/layout.tsx`의 `metadata.robots = { index: false, follow: false }`와 proxy의 `X-Robots-Tag: noindex` | 문서상 proxy는 낙관적 검사용이며 유일한 방어선이 되면 안 되고, 레이아웃은 이동 시 다시 렌더링되지 않는다 (대안: `unauthorized()`는 실험 옵션 `authInterrupts`가 필요해 쓰지 않음) | 102, 107, 108 |
| D16 | 목록 조회 계층·쿼리 | 신규 `src/lib/notion/invoice-list.ts`의 `listInvoices()`. `databases.retrieve`의 `data_sources`로 Invoices 데이터 소스 ID를 얻어 모듈 메모리에 보관(1개가 아니면 오류). `dataSources.query`를 `page_size: 100`·`start_cursor`로 반복, 정렬 `발행일` 내림차순 → `created_time` 내림차순, `filter_properties`로 목록 속성만 받고 `항목` relation·Items는 조회하지 않는다. 총 금액은 `총 금액` 값만(D6). 행 상한 500건(초과 시 잘림 안내), 페이지 번호 UI 없음. 매핑은 `mappers.ts`의 읽기 함수를 재사용하는 `mapInvoiceListItem` | 단건 캐시 코드와 분리. 노션 호출은 첫 조회 1 + ⌈N/100⌉회, 이후 ⌈N/100⌉회 (대안: 항목 개수 열은 relation이 25개에서 잘려 추가 호출이 필요해 제외) | 103, 106 |
| D17 | 목록 캐시·최신성 | 요청 간 캐시를 두지 않는다(`React.cache`로 같은 요청 안 중복만 합침) | 노션에서 견적서를 만든 직후 링크를 복사하므로 최신성이 중요하고, 사용자가 1명이라 호출이 적다 (대안: D8의 60초 캐시는 새 견적서가 최대 60초 늦게 보임) | 106, 108 |
| D18 | 복사 링크의 기준 도메인 | `siteConfig.url` + `/invoice/` + 하이픈 없는 32자리 소문자 ID로 앱이 서버에서 만든다. 순수 함수 `buildInvoiceUrl`(신규 `src/lib/invoice-url.ts`, 끝 `/` 정리) 하나만 쓴다. 프로덕션에서 기준 URL이 localhost면 관리자 화면에 경고 표시. Vercel에 `NEXT_PUBLIC_SITE_URL=https://invoice-web-ashy.vercel.app` 설정 후 재배포(빌드 때 인라인됨)는 사용자 작업(Task 109) | 사이트 정보는 `site.ts` 한 곳(D7 원칙) (대안: 노션 `견적서 URL` 수식은 환경별 도메인이 어긋날 수 있고 속성 이름에 의존) | 103, 108, 109 |
| D19 | 클립보드·피드백·접근성 | 클릭 핸들러에서 `navigator.clipboard.writeText`. 성공 시 sonner `toast.success("링크를 복사했습니다")`와 약 2초간 체크 아이콘. 실패(비보안 컨텍스트, 권한 거부, API 없음) 시 `toast.error`와 함께 읽기 전용 입력란에 링크를 보여 주고 전체 선택. 버튼 `aria-label`은 `견적서 <번호> 링크 복사`, 결과는 시각적으로 숨긴 `aria-live="polite"` 영역에도 알림 | Clipboard API는 HTTPS·localhost에서만 동작 (대안: `execCommand("copy")`는 폐기 예정이라 제외) | 105, 108 |
| D20 | 다크 모드 범위 | 관리자 상단바와 로그인 화면에 기존 `ThemeToggle`을 둔다. 견적서 화면에는 추가하지 않는다 | 테마 엔진·토큰은 이미 모든 화면에 적용됨. 견적서는 문서형 화면(D10) | 104 |
| D21 | 공통 컴포넌트 배치 | `invoice-status-badge.tsx`를 `src/app/invoice/[notionPageId]/_components/`에서 `src/components/common/`으로 옮겨 견적서 화면·목록이 같이 쓴다. 관리자 상단바는 `src/components/layout/admin-header.tsx`. `Logo`에 `href` prop 추가(기본값 `siteConfig.guidePath` 유지) | `docs/architecture.md` 계층 규칙. 상태 변형(D4)을 한 곳에 둔다 | 104, 105 |

### V1 결정과의 충돌 점검

수정·주의가 필요한 항목만 적습니다. 나머지 V1 결정(D1~D4, D6, D7, D9, D11)은 그대로 유지합니다.

| V1 결정 | 처리 |
| --- | --- |
| D5 URL 생성 주체(노션 수식) | **수정**: 관리자 목록의 링크 복사(D18)를 기본 경로로 추가한다. 노션 수식은 노션에서 직접 복사할 때를 위해 남겨 두며 도메인을 같은 값으로 맞춘다 |
| D8 견적서 화면 60초 캐시 | 유지. 목록만 예외(D17, 캐시 없음). 주의: 막 만든 견적서 ID가 직전 60초 안에 404로 캐시됐다면 링크를 열어도 잠시 404가 보일 수 있다 |
| D10 견적서 독립 레이아웃 | 유지. 관리자도 같은 방식의 독립 레이아웃(D13)이며 견적서 화면에 테마 전환을 넣지 않는다(D20) |
| D12 404 처리·`proxy.ts` | **수정**(matcher·분기만). `/invoice/*`의 ID 검사·rewrite 동작은 바뀌면 안 되므로 Task 107 완료 기준에 회귀 확인을 넣는다 |
| V1 범위 "PRD에 없는 인증·권한 기능은 만들지 않는다", 공개 URL 모델 | **수정**: 인증은 `/admin` 아래 관리자 1명에만 적용한다. 견적서 페이지는 계속 공개 |
| V1 012-2·012-6 PDF 호출 제한 | 유지. 로그인 시도 제한은 별도 모듈(`src/lib/auth/login-rate-limit.ts`)로 만들고 PDF 쪽 코드는 건드리지 않는다 |

### 노션 DB 속성 명세 (D3, D4, V1과 동일)

`src/lib/notion/properties.ts`와 `docs/notion-setup.md` 2절이 "`docs/ROADMAP.md`의 노션 DB 속성 명세"를 가리키므로 같은 표를 둡니다. 이번에 바뀐 속성은 없습니다.

**견적서 DB (Invoices)** — `NOTION_DATABASE_ID`가 가리키는 DB

| 속성명 | 노션 타입 | 도메인 필드 | 목록(F020) |
| --- | --- | --- | --- |
| 견적서 번호 | Title | `invoiceNumber` | 사용 |
| 클라이언트명 | Text (rich_text) | `clientName` | 사용 |
| 발행일 | Date | `issueDate` | 사용(정렬 기준) |
| 유효기간 | Date | `validUntil` | 사용 |
| 상태 | Status (매퍼는 Select도 허용) | `status` | 사용(`대기`·`승인`·`거절` 배지) |
| 총 금액 | Number | `totalAmount` | 사용 |
| 항목 | Relation → Items | `items` | 사용 안 함 |
| 견적서 URL | Formula | (앱이 읽지 않음) | 사용 안 함 |

**항목 DB (Items)**: 항목명(Title), 수량(Number), 단가(Number), 금액(Formula), Invoices(역방향 Relation). 목록에서는 조회하지 않습니다.

### 새 환경 변수 (이름과 용도만)

| 이름 | 용도 |
| --- | --- |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호. 서버 전용(`NEXT_PUBLIC_` 금지), 충분히 긴 무작위 값 |
| `ADMIN_SESSION_SECRET` | 세션 쿠키 HMAC 서명 키. 서버 전용, 32자 이상 무작위 값. 바꾸면 모든 세션이 무효화되므로 비밀번호를 바꿀 때 함께 바꾼다 |

- 값은 이 문서·코드·로그 어디에도 쓰지 않는다. `.env.local`, `.env.example`(이름만), Vercel 환경 변수는 사용자가 직접 설정한다
- 노션 변수처럼 첫 사용 시점에 zod로 지연 검증해, 변수가 없어도 `npm run build`는 통과한다. 변수가 없으면 관리자 화면에 들어갈 수 없고 오류 메시지에는 변수 이름만 남긴다

### 위험 요약

- **`cacheComponents` + 인증 쿠키**: `cookies()`를 Suspense 밖에서 읽으면 빌드 오류이고, 레이아웃 최상단에서 세션을 `await`하면 `{children}` 전체가 기다린다(`02-guides/authentication-with-cache-components.md`). 그래서 차단은 proxy가 하고, 서버 재검사는 목록을 그리는 Suspense 안 컴포넌트에서만 하며, 관리자 상단바는 세션을 읽지 않는 정적 마크업으로 둔다
- **`partialPrefetching`**: 관리자 화면 `<Link>`의 프리페치 요청도 proxy를 지난다. 쿠키가 없으면 로그인으로 리디렉트되는 것이 정상인지 Task 107에서 확인한다
- **브랜치 작업**: `main`은 Git 연동으로 자동 배포된다. Task 102부터 Task 107(인증)까지는 `feat/admin` 브랜치에서 작업하고, Task 107 완료 후 `main`에 병합한다. 브랜치 생성·커밋·병합은 사용자가 요청할 때만 한다
- **링크 도메인**: `NEXT_PUBLIC_SITE_URL` 설정과 재배포 전에는 localhost 링크가 복사된다(D18 경고로 드러남)
- **비밀번호 무차별 대입**: 로그인 시도 제한이 인메모리라 서버리스 인스턴스끼리 공유되지 않는다(V1 012-2와 같은 한계). 긴 무작위 비밀번호가 실질적인 방어다

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스와 이 문서의 "현재 상태"를 확인하고 착수할 Task를 고릅니다.
   - 새 작업이 생기면 이 `ROADMAP.md`에 추가하고, 우선순위 작업은 마지막 완료 작업 다음에 넣습니다.

2. **작업 구현**
   - Phase마다 상단에 적힌 전문 에이전트 하나에 Phase의 Task를 통째로 맡깁니다.
   - Next.js 작업은 `node_modules/next/dist/docs/`의 해당 가이드를, 노션 작업은 context7 MCP로 `@notionhq/client` 문서를 먼저 확인합니다.
   - API·비즈니스 로직 Task(106, 107, 108)는 Task의 "테스트 체크리스트"(Playwright MCP 시나리오)를 수행합니다.
   - 각 Task 완료 시 CLAUDE.md의 "작업 완료 체크리스트"를 따릅니다(`npm run check-all`, 라우트·캐시·proxy를 바꿨으면 `npm run build`, 코드 변경 후 `code-reviewer` 리뷰). 검증·리뷰만 하는 별도 Task는 두지 않습니다.
   - 각 단계 완료 후 중단하고 다음 지시를 기다립니다.

3. **로드맵 업데이트**
   - 완료된 Task와 세부 구현 사항을 ✅로 표시하고, 모든 Task가 끝난 Phase 제목에 ✅를 붙입니다. 진행 상황 줄과 최종 업데이트 날짜를 갱신합니다.

## 상태 표시 규칙

- Phase 제목 + ✅: 완료된 Phase
- Task `✅ - 완료`: 완료된 작업 / `- 우선순위`: 즉시 시작할 작업 / 표시 없음: 대기
- 세부 구현 사항 `✅`: 완료 / `-`: 미완료

## 개발 단계

### Phase 5: 관리자 영역 골격 구축 ✅

담당 에이전트: `nextjs-app-router-developer`

- **Task 101: 고도화 결정 사항 확정** ✅ - 완료
  - 크기: S / 의존: 없음 / 코드 변경 없음
  - ✅ D13~D21 확정(2026-10-25, 참고용 예시 로드맵을 기준으로 사용자 결정): 환경 변수 비밀번호 + Web Crypto 서명 쿠키 세션(8시간, `jose` 미도입), 로그인 시도 IP당 60초 5회, 목록 행 상한 500건·페이지 번호 UI 없음, 링크는 앱이 `siteConfig.url`로 생성, 복사 버튼 + 토스트, 다크 모드는 next-themes 기반으로 관리자 화면에만 전환 UI 추가(견적서 화면 제외)
  - ✅ 작업 브랜치: Task 107 완료 전까지 `feat/admin`에서 작업, 완료 후 `main` 병합
  - ✅ 범위 밖 정리: 예시 로드맵의 검색·필터·정렬·페이지네이션, QR·짧은 URL, 공유, 통계, 감사 로그·역할 기반 접근 제어, 차트 제외

- **Task 102: 관리자 라우트와 loading·error 골격 생성** ✅ - 완료
  - 크기: S / 의존: Task 101(D13, D15)
  - ✅ 사전 확인: `01-getting-started/03-layouts-and-pages.md`, `03-file-conventions/route-groups.md`·`loading.md`·`error.md`, `04-functions/generate-metadata.md`(`robots`), `02-guides/authentication-with-cache-components.md`
  - ✅ `src/app/admin/layout.tsx` (신규): `metadata.robots = { index: false, follow: false }`(CLAUDE.md의 "metadata는 title만" 규칙은 페이지 대상이므로 이 레이아웃은 robots만 예외로 둔다), 래퍼 마크업만
  - ✅ `src/app/admin/(dashboard)/layout.tsx` (신규): `LayoutProps`, 상단바 자리(Task 104에서 채움), 넓은 `Container`
  - ✅ `src/app/admin/(dashboard)/page.tsx` (신규, `/admin`): `metadata.title = "견적서 목록"`, 본문은 `<Suspense>` 안 자리표시
  - ✅ `src/app/admin/(dashboard)/loading.tsx`, `error.tsx` (신규): 골격만(`"use client"`, `retry` prop)
  - ✅ `src/app/admin/login/page.tsx` (신규, `/admin/login`): `metadata.title = "관리자 로그인"`, 골격만
  - ✅ `src/config/site.ts` (수정): `adminPath: "/admin"`, `adminLoginPath: "/admin/login"` 추가
  - ✅ 인증 검사는 넣지 않는다(Task 107)
  - ✅ 완료 기준: `/admin`, `/admin/login`이 골격을 표시하고 마케팅 헤더·푸터가 없음, 두 화면 HTML에 robots `noindex, nofollow` 메타, `npm run build` 통과(두 라우트의 빌드 표시 기록), `/invoice/*`·`/invoice/guide` 동작 변화 없음
  - ✅ 위험: 라우트 그룹 `(dashboard)`와 `login`이 의도대로 나뉘는지(로그인 화면에 상단바가 보이면 구조 오류)

- **Task 103: 목록 타입·링크 유틸·더미 데이터 정의** ✅ - 완료
  - 크기: S / 의존: Task 101(D16, D18)
  - ✅ `src/types/invoices.ts` (수정): `InvoiceListItem`(`Invoice`에서 `items` 제외)과 `InvoiceListResult = { invoices: InvoiceListItem[]; truncated: boolean }`. 컴포넌트 `InvoiceSummary`와 겹치지 않게 타입 이름에 `Summary`를 쓰지 않는다
  - ✅ `src/lib/invoice-url.ts` (신규, 서버·클라이언트 공용 순수 함수): `buildInvoiceUrl(invoiceId, baseUrl = siteConfig.url)` — `notionPageIdSchema`로 ID 정규화, `baseUrl` 끝 `/` 제거, 형식이 틀리면 `null`
  - ✅ `src/lib/dummy-invoice-list.ts` (신규, 임시. Task 108에서 삭제): 0건·1건·30건, 상태 없음, 긴 클라이언트명, 큰 금액, 날짜 없음 케이스. ID는 형식만 맞는 가짜 값
  - ✅ 완료 기준: `npm run check-all` 통과, 더미 데이터가 타입을 만족, `buildInvoiceUrl`이 하이픈 포함·대문자 ID와 끝에 `/`가 있는 기준 URL에서 같은 결과(scratchpad 스크립트로 확인, 테스트 파일을 남기지 않음)

### Phase 6: 관리자 UI 완성 (더미 데이터 활용) ✅

담당 에이전트: `ui-markup-specialist` (Phase 7과 병렬 진행 가능. 링크 복사·로그인의 실제 동작은 Phase 8)

- **Task 104: 관리자 레이아웃 셸과 로그인 화면 UI 구현 (F022, F023)** ✅ - 완료
  - 크기: M / 의존: Task 102, Task 101(D13, D20, D21)
  - ✅ 사전 확인: shadcn MCP로 `@base-nova`의 `input`과 레이블용 `label` 또는 `field` 제공 여부. 추가 후 생성 파일의 `cn` import가 `cn` 패키지인지 확인
  - ✅ `src/components/common/invoice-status-badge.tsx` (신규, D21): 기존 `src/app/invoice/[notionPageId]/_components/invoice-status-badge.tsx`를 옮김(삭제). `invoice-header.tsx`(수정)의 import 경로 변경
  - ✅ `src/components/common/logo.tsx` (수정): `href` prop 추가(기본값 유지)
  - ✅ `src/components/layout/admin-header.tsx` (신규): 로고(`href=siteConfig.adminPath`), "견적서 목록", 오른쪽에 `ThemeToggle`과 로그아웃 버튼 자리(`<form>` 마크업만). 세션을 읽지 않는 정적 서버 컴포넌트
  - ✅ `src/app/admin/(dashboard)/layout.tsx` (수정): `AdminHeader` + `Container className="max-w-6xl"`(값은 착수 시 결정)
  - ✅ 로그인 화면: `src/app/admin/login/page.tsx` (수정), `src/app/admin/login/_components/login-form.tsx` (신규, 마크업만): `h1`, 비밀번호 입력(`type="password"`, `autoComplete="current-password"`, 레이블 연결), 제출 버튼(제출 중 `spinner` 자리), 오류 문구 영역(`role="alert"`), `ThemeToggle`
  - ✅ 관리자 `error.tsx` 문구 완성(내부 오류 미노출, `다시 시도`)
  - ✅ 완료 기준: 375px/768px/1280px 가로 넘침 없음, 라이트·다크 정상, 테마 전환 가능, 견적서 화면의 상태 배지 표시 동일(`INV-2026-001`), 마케팅 헤더 로고 동작 동일, `npm run check-all` 통과

- **Task 105: 견적서 목록 화면 UI 구현 (F020, F021)** ✅ - 완료
  - 크기: M / 의존: Task 103, 104, Task 101(D19)
  - ✅ `src/app/admin/(dashboard)/_components/` (신규 폴더)
    - ✅ `invoice-list.tsx`: 목록 조합(데이터를 props로 받는 서버 컴포넌트)
    - ✅ `invoice-list-table.tsx`: `md` 이상 표(shadcn `table`). 열: 견적서 번호, 클라이언트명, 발행일, 유효기간, 상태(`InvoiceStatusBadge`), 총 금액(오른쪽 정렬), 동작. 머리글 `scope="col"`
    - ✅ `invoice-list-cards.tsx`: `md` 미만 카드 목록
    - ✅ `invoice-list-skeleton.tsx`: 표·카드 형태 스켈레톤(`sr-only` 로딩 문구), `loading.tsx`와 Suspense fallback 공용
    - ✅ `invoice-list-empty.tsx`: 0건 빈 상태(`empty`)
    - ✅ `copy-invoice-link-button.tsx`: `"use client"` 버튼 마크업(D19의 아이콘·`aria-label`·live 영역·실패 시 읽기 전용 입력란 자리). 클립보드 동작은 Task 108
    - ✅ "열기" 링크: `/invoice/<id>`를 새 탭으로(`target="_blank"`, `rel="noopener noreferrer"`)
  - ✅ 잘림 안내(`truncated`)와 기준 URL 경고(D18) 영역 마크업
  - ✅ 금액·날짜는 `src/lib/format.ts` 재사용
  - ✅ `src/app/admin/(dashboard)/page.tsx`·`loading.tsx` (수정): 더미 데이터로 목록 표시
  - ✅ 완료 기준: 더미 0건·1건·30건 표시, 긴 값에서 375px/768px/1280px 가로 넘침 없음, 라이트·다크 정상, 키보드로 모든 복사·열기 버튼 도달과 포커스 표시, `npm run check-all` 통과
  - 위험: 표와 카드를 둘 다 렌더링하므로 `hidden md:block` 등 `display: none`으로 숨겨 스크린 리더 중복을 막는다

### Phase 7: 견적서 목록 조회 ✅

담당 에이전트: `notion-api-database-expert` (Phase 6과 병렬 진행 가능)

- **Task 106: 노션 견적서 목록 쿼리 구현 (F020)** ✅ - 완료
  - 크기: M / 의존: Task 103, Task 101(D16, D17)
  - ✅ 구현(2026-10-25): `src/lib/notion/invoice-list.ts`(`getInvoicesDataSourceId`, `listInvoices`, 상한 `INVOICE_LIST_MAX_ROWS = 500` export), `src/lib/notion/errors.ts`(`NotionRequestError`·`toRequestError(error, event)`를 `invoices.ts`에서 옮겨 공유, 동작 불변), `mappers.ts`의 `mapInvoiceListItem`(`mapInvoice`는 이를 재사용)
  - ✅ 사전 확인 결과: `filter_properties`는 속성 이름도 받아 스키마 조회가 늘지 않는다. `in_trash`는 쿼리 파라미터로 보내면 `validation_error 400`이라 보내지 않고, 기본 동작(보관 제외)에 더해 코드에서 `in_trash`·`archived`·`is_archived` 페이지를 한 번 더 거른다. Invoices DB의 데이터 소스는 1개
  - ✅ 실측: 2건, 발행일이 같아 `created_time` 내림차순으로 INV-2026-002 → 001. 노션 호출은 첫 조회 2회(retrieve 1 + query 1), 이후 1회. 응답 크기는 `filter_properties` 적용으로 4,141B → 3,385B(약 18% 감소)
  - ✅ 오류 확인: 잘못된 API 키 `unauthorized/401`, 데이터 소스 ID `object_not_found/404`, 견적서 페이지 ID·다른 DB ID `validation_error/400`. 로그에 키·응답 본문 없음. 0건은 빈 배열, 상한을 낮추면 `truncated: true`(500으로 원복)
  - 미확인: 보관·휴지통 견적서 제외는 노션 데이터를 바꿔야 해서 실데이터로 확인하지 못했다. Task 108 검증 때 견적서 1건을 휴지통에 넣어 확인한다. 정렬도 발행일이 다른 견적서를 추가해 한 번 더 본다
  - 사전 확인: context7 MCP로 `@notionhq/client` 5.28.0의 `databases.retrieve`(`data_sources`), `dataSources.query`(`sorts`, `filter_properties`, `in_trash`, `request_status`). `filter_properties`가 속성 이름을 받는지 ID만 받는지, 실제 Invoices DB의 데이터 소스 수
  - `src/lib/notion/invoice-list.ts` (신규, `server-only`)
    - `getInvoicesDataSourceId()`: `databases.retrieve` → `data_sources`가 1개면 그 ID(모듈 메모리 보관), 아니면 코드만 담은 오류
    - `listInvoices(): Promise<InvoiceListResult>`: D16 쿼리, 보관·휴지통 제외, `request_status.type === "incomplete"`면 오류, 500건 도달 시 중단하고 `truncated: true`. `React.cache`만 쓰고 요청 간 캐시 없음(D17)
    - 인증 검사는 여기서 하지 않는다. 호출부는 Task 108의 인증된 진입점 하나뿐이어야 한다(주석으로 명시)
  - `src/lib/notion/mappers.ts` (수정): `mapInvoiceListItem(page)` 추가
  - 오류 처리: `invoices.ts`의 `NotionRequestError`·`toRequestError`를 공유할지(신규 `src/lib/notion/errors.ts`로 이동, 동작 불변) 착수 시 결정. 로그 이벤트 `notion.invoice_list_failed {code, status}`
  - 완료 기준: 실제 노션 DB로 건수·순서·값이 노션 화면과 일치(임시 Route Handler 또는 scratchpad 스크립트로 확인 후 삭제), 노션 호출 수(첫 조회·이후)와 `filter_properties` 적용 전후 응답 크기 기록
  - 테스트 체크리스트:
    - 목록 건수·정렬·값이 노션과 일치, 보관·휴지통 견적서 제외
    - 0건이면 빈 배열, 행 상한을 임시로 낮췄을 때 `truncated: true`(확인 후 원복)
    - 잘못된 API 키, `NOTION_DATABASE_ID`에 데이터 소스 ID나 다른 DB ID → 코드·상태만 담은 오류, 로그에 키·응답 본문 없음
    - 빈 속성(클라이언트명·상태·날짜 없음)이 빈 값으로 매핑됨
  - 위험: `filter_properties`가 속성 ID만 받으면 데이터 소스 스키마 조회가 1회 늘 수 있다. 100건당 노션 호출이 1회(약 0.2~0.5초) 늘어난다

### Phase 8: 관리자 인증·실데이터 연동 ✅

담당 에이전트: `nextjs-app-router-developer` (링크 복사 클라이언트 동작 포함)

- **Task 107: 관리자 인증 구현 (F022)** ✅ - 완료
  - 크기: M / 의존: Task 102, 104, Task 101(D14, D15)
  - ✅ 사전 확인: `02-guides/authentication.md`("Stateless Sessions", "Optimistic checks with Proxy", "Layouts and auth checks"), `02-guides/authentication-with-cache-components.md`, `03-file-conventions/proxy.md`, `04-functions/cookies.md`, `02-guides/forms.md`, `02-guides/server-actions.md`. proxy 번들에서 `server-only` import와 Web Crypto 사용 가능 여부, 개발 서버(`http://localhost`)에서 `Secure` 쿠키 동작, 세션을 읽는 라우트에 `export const instant = false`가 필요한지
  - ✅ `src/lib/auth/env.ts` (신규, `server-only`): `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` 지연 검증(zod, 오류 메시지에 변수 이름만)
  - ✅ `src/lib/auth/session-token.ts` (신규): 만료 시각 토큰의 HMAC 서명·검증 순수 함수(Web Crypto). proxy와 DAL이 함께 쓰므로 `next/headers`를 쓰지 않고 비밀 키는 인자로 받는다
  - ✅ `src/lib/auth/session.ts` (신규, `server-only`): 쿠키 이름·옵션 상수(D15), `createAdminSession()`, `deleteAdminSession()`
  - ✅ `src/lib/auth/dal.ts` (신규, `server-only`): `verifyAdminSession()` — `cookies()`로 읽어 검증, 실패 시 `redirect(siteConfig.adminLoginPath)`. `React.cache`
  - ✅ `src/lib/auth/login-rate-limit.ts` (신규, `server-only`): IP당 60초 5회. `src/lib/pdf/rate-limit.ts`의 `getClientKey`만 재사용
  - ✅ `src/app/admin/login/actions.ts` (신규): `login(prevState, formData)` — 시도 제한 → 비밀번호를 SHA-256 다이제스트 후 `crypto.timingSafeEqual` 비교 → 성공 시 세션 발급과 `next` 검증 후 리디렉트, 실패 시 일반 문구
  - ✅ `src/app/admin/(dashboard)/actions.ts` (신규): `logout()` — 쿠키 삭제 후 로그인으로
  - ✅ `login-form.tsx`(수정, `useActionState` 연결, 제출 중 비활성화), `admin-header.tsx`(수정, 로그아웃 폼 연결)
  - ✅ `src/proxy.ts` (수정, D15): matcher 확장과 경로별 분기, 관리자 응답 `X-Robots-Tag: noindex`, `ADMIN_SESSION_SECRET`이 없으면 항상 로그인으로. 로그인 상태의 `/admin/login` 접근 처리는 착수 시 결정
  - ✅ 로그 이벤트: `admin.login_succeeded`, `admin.login_failed`, `admin.login_rate_limited`(IP·비밀번호·토큰 미포함)
  - ✅ 완료 기준: 아래 테스트 통과, `npm run build` 통과(`/invoice/[notionPageId]` ◐ 유지 기록), `.next/static`에서 `ADMIN_PASSWORD`·`ADMIN_SESSION_SECRET` 이름과 값 검색 0건. 완료 후 `feat/admin`을 `main`에 병합(사용자 요청 시)
  - ✅ 구현 결과(2026-10-25): proxy는 Node.js 런타임이라 Web Crypto와 `server-only` import가 모두 동작한다. 프로덕션 빌드에서 `/admin`은 ○, `/admin/login`·`/invoice/[notionPageId]`는 ◐다. 세션을 읽는 컴포넌트를 Suspense 안에 두면 `instant = false`가 필요 없다(임시 호출로 빌드 확인). 로그인된 상태의 `/admin/login` GET·HEAD는 `next`(검증 후) 또는 `/admin`으로 307하고 POST(Server Action)는 통과시킨다. `AdminHeader`는 계층 규칙상 `app/`을 import할 수 없어 `logoutAction` prop으로 액션을 받는다
  - 테스트 체크리스트 (Playwright MCP, 개발·프로덕션 서버):
    - ✅ 쿠키 없이 `/admin` → `/admin/login?next=%2Fadmin` 307, `noindex` 메타와 `X-Robots-Tag` 헤더
    - ✅ 틀린 비밀번호 → 오류 문구, 쿠키 미발급 / 맞는 비밀번호 → `/admin`, 쿠키 속성(`HttpOnly`, `SameSite=Lax`, `Path=/admin`, 프로덕션 `Secure`)
    - ✅ 로그아웃 → 쿠키 삭제, `/admin` 재접근 시 로그인으로
    - ✅ 위조·만료 토큰 → 로그인으로
    - ✅ `next=//evil.example`, `next=https://evil.example`, `next=/invoice/...` → 모두 `/admin`으로 이동
    - ✅ 6번째 로그인 시도 → 제한 문구, 서버 로그 `admin.login_rate_limited` 1줄
    - ✅ 관리자 링크 프리페치가 쿠키 유무에 따라 정상 동작
    - ✅ 회귀: `/invoice/abc` HTTP 404, 실제 견적서(`INV-2026-001`) 200, 없는 ID 404 화면 + `noindex`, `/invoice/guide` 200, `/` → `/invoice/guide` 307, PDF 다운로드 정상
  - 위험: Server Action이 `/admin/login`으로 POST되므로 proxy가 로그인 경로의 POST를 막지 않아야 한다

- **Task 108: 견적서 목록 실데이터 연동과 링크 복사 구현 (F020, F021)** ✅ - 완료
  - 크기: M / 의존: Task 105, 106, 107, Task 101(D17, D18, D19)
  - ✅ 사전 확인: `01-getting-started/06-fetching-data.md`, `02-guides/streaming.md`("Push dynamic access down"), `02-guides/data-security.md`. sonner 토스트가 스크린 리더에 읽히는지
  - ✅ `src/lib/admin/invoices.ts` (신규, `server-only`, DAL): `getAdminInvoiceList()` — `await verifyAdminSession()` 후 `listInvoices()`, 각 항목에 `url: buildInvoiceUrl(id)`를 붙인 화면용 DTO 반환. 화면 코드가 `listInvoices`를 직접 부르지 않는다
  - ✅ `src/app/admin/(dashboard)/page.tsx` (수정): `<Suspense fallback={<InvoiceListSkeleton />}>` 안 async 컴포넌트가 `getAdminInvoiceList()` 호출. 오류는 관리자 `error.tsx`로
  - ✅ 더미 제거: `src/lib/dummy-invoice-list.ts` 삭제
  - ✅ `copy-invoice-link-button.tsx` (수정, D19): `window.isSecureContext`·`navigator.clipboard` 확인 → `writeText` → 성공·실패 처리
  - ✅ 프로덕션에서 `siteConfig.url`이 localhost면 `alert`로 `NEXT_PUBLIC_SITE_URL` 설정 안내, `truncated`면 "최근 500건만 표시합니다" 안내
  - ✅ 완료 기준: 실제 노션 데이터로 목록 표시, 복사한 링크를 새 탭에서 열면 해당 견적서 표시, `npm run build` 통과, 목록 화면 노션 호출 수 실측
  - 테스트 체크리스트 (Playwright MCP, 프로덕션 서버):
    - 로그인 후 `/admin`: 스켈레톤 → 목록, 건수·순서·값이 노션과 일치
    - 링크 복사: 클립보드 값이 `<siteConfig.url>/invoice/<32자리 소문자 ID>`, 성공 토스트, live 영역 문구
    - 클립보드 실패 강제 → 오류 토스트와 읽기 전용 입력란에 같은 URL
    - "열기" 링크가 새 탭에서 견적서 표시
    - 노션에서 새 견적서를 만든 직후 목록 새로고침 시 바로 보임(D17, 사용자 데이터를 만들어야 하므로 사용자에게 알린 뒤 진행)
    - 잘못된 API 키 → 관리자 에러 화면, 내부 메시지 미노출, `다시 시도`
    - 로그아웃 상태에서 `/admin` 응답(HTML·RSC)에 견적서 데이터 없음
    - 375px/768px/1280px, 라이트·다크 가로 넘침 없음, 콘솔 에러 없음
  - ✅ 구현(2026-10-25): DTO는 `url`과 `showBaseUrlWarning`(프로덕션 + localhost)을 서버에서 계산. 잘림 문구는 "최근 N건"으로 구분. `url === null`이면 버튼 `title`과 `sr-only` 사유 제공. 표·카드가 행마다 복사 버튼을 2개 하이드레이션하는 문제는 유지(복사 상태를 공유하려면 목록 전체를 클라이언트로 옮겨야 해 JS가 더 늘고, 최대 500행·1명 사용이라 비용이 작음). `src/lib/auth/dal.ts`에 `await connection()` 추가(프리페치의 런타임 프리렌더에서 `Date.now()` 오류 방지). Task 107 리뷰 반영: 로그인 IP 키(`x-vercel-forwarded-for`·`x-real-ip` 우선), 성공 시 카운터 리셋, proxy 분기 명시
  - ✅ 실측: 프로덕션 빌드·서버, 목록 2건(INV-2026-002 → 001), 복사 값 `http://localhost:3000/invoice/<32자리>`, 노션 호출은 서버 시작 후 첫 목록 2회(retrieve + query), 이후 목록 로드당 1회(query)
  - ✅ 확인: 성공 토스트·live 영역·체크 아이콘 2초, 실패 강제(거부·API 없음) 시 오류 토스트와 전체 선택된 입력란, "열기" 새 탭, 잘못된 API 키 → 에러 화면(내부 메시지 미노출, 로그에는 code·status만), 로그아웃 상태 HTML·RSC에 견적서 데이터 없음, 375/768/1280px 라이트·다크 가로 넘침 없음, 콘솔 에러 없음, 로그인 성공 후 카운터 리셋, `/invoice/*` 회귀, `.next/static`에 관리자 변수 이름 0건
  - 미확인(노션 데이터 변경 필요, 사용자 확인): 새 견적서 생성 직후 목록 반영(D17), 휴지통·보관 견적서 제외(Task 106 미확인과 동일), 발행일이 다른 견적서의 정렬. 실제 HTTPS 환경의 클립보드 동작은 Task 109 배포 확인에서 본다
  - 보류(코드 리뷰 지적, 2026-10-25 사용자가 이번에는 수정하지 않기로 함. 2026-10-26 Task 111에서 코드 부분 반영):
    - `NEXT_PUBLIC_SITE_URL`이 빈 문자열이면 `siteConfig.url`이 `""`이 되어 `buildInvoiceUrl`이 `/invoice/<ID>` 상대 경로를 돌려주고(`null`이 아님) 복사 버튼이 활성인 채로 상대 경로가 복사된다. 프로덕션에서는 localhost 경고가 뜨지만 원인 문구가 틀리다. Task 109에서 Vercel 변수를 설정할 때 값이 비지 않게 한다. 코드 수정안은 `site.ts`의 `??`를 `||`로 바꾸거나 `buildInvoiceUrl`에서 `new URL(baseUrl)` 검증 실패 시 `null`을 반환하는 것
    - 복사 버튼 연속 클릭 시 토스트가 중복되고, 실패 상태에서 다시 실패하면 입력란 전체 선택과 live 영역 문구가 갱신되지 않는다(토스트 고정 id, 실패 처리에서 `select()` 직접 호출로 해결)
    - 로그인 제한 키가 `"unknown"`(헤더 없음)이면 성공 시 리셋이 다른 사용자의 실패 누적까지 지운다(`"unknown"`이면 리셋 건너뛰기). Vercel에서는 헤더가 항상 있어 해당 없음
    - 낮음: 목록 제목 `h1` 중복(`loading.tsx`·`page.tsx`), 언마운트 중 `writeText` 대기 후 타이머 등록, 좁은 화면 복사 버튼 `title`, 표·카드 중복 렌더로 인한 RSC 페이로드, 경고 판정의 `VERCEL_ENV` 고려, `listInvoices` import 제한 ESLint 규칙
  - 위험: 세션 검사와 노션 조회를 같은 Suspense 경계 안에 두지 않으면 빌드 오류. 목록이 커지면 스트리밍 전 대기 시간이 늘어난다

### Phase 9: 후속 보완 ✅

담당 에이전트: `nextjs-app-router-developer`

- **Task 110: 로그인 설정 오류 진단 개선과 `/invoices` 리디렉트** ✅ - 완료
  - 크기: S / 의존: Task 107
  - ✅ `src/app/admin/login/actions.ts` (수정): `ADMIN_PASSWORD`·`ADMIN_SESSION_SECRET`을 따로 검사해 어떤 변수가 문제인지 구분. 로그 `admin.login_failed`(reason `misconfigured`)에 변수 이름만 `variables` 필드로 남김(값·길이 비기록). `NODE_ENV !== "production"`일 때만 액션 반환값에 `hint`를 담고, 프로덕션은 `hint` 키 자체를 싣지 않음
  - ✅ `login-form.tsx` (수정): `hint`를 오류 영역(`role="alert"`)에 보조 문구로 표시
  - ✅ `next.config.ts` (수정): `redirects()`에 `/invoices` → `siteConfig.adminPath`(`/admin`) 307 추가. 쿠키 `Path=/admin`·proxy matcher는 변경 없음
  - ✅ 완료 기준: 아래 테스트 통과, `npm run check-all`(기존 포맷 경고 4건 제외)·`npm run build` 통과
  - ✅ 결과(2026-10-26): 8자 이하 시크릿에서 개발 서버는 "ADMIN_SESSION_SECRET은 32자 이상이어야 합니다" 힌트를 표시하고 로그에는 변수 이름만 남음. 프로덕션 서버 응답에는 힌트 문구·`hint` 키·변수 이름이 없음
  - 테스트 체크리스트 (Playwright MCP):
    - ✅ 짧은 시크릿 → 개발 힌트 표시, 로그 `{"reason":"misconfigured","variables":"ADMIN_SESSION_SECRET"}`
    - ✅ 32자 이상 시크릿 + 맞는 비밀번호 → `/admin` 목록
    - ✅ `/invoices` → 307 `/admin` → 쿠키 없으면 `/admin/login?next=%2Fadmin`, 로그인 후 `/invoices`가 `/admin` 목록
    - ✅ 프로덕션 빌드·서버에서 힌트 문구가 응답에 없음, `.next/static`에서 `ADMIN_` 이름·테스트 값 0건

- **Task 111: Task 108 보류 지적 반영** ✅ - 완료
  - 크기: M / 의존: Task 108
  - ✅ `copy-invoice-link-button.tsx` (수정): 토스트 고정 id(`copy-invoice-link-<번호>`)로 연속 클릭 중복 방지, 실패 카운터 state를 effect 의존성으로 두어 연속 실패에도 입력란 전체 선택 복원(클릭 때 상태를 먼저 비워 live 문구도 다시 읽힘), `await writeText` 중 언마운트되면 상태·타이머를 만들지 않는 가드, 기본 `title`(= `aria-label`)
  - ✅ `login-rate-limit.ts` (수정): 클라이언트 키가 `"unknown"`이면 `resetLoginRateLimit`이 아무것도 지우지 않음(여러 요청이 한 버킷을 공유하므로 다른 요청의 실패 누적을 지우지 않기 위함)
  - ✅ `src/lib/invoice-url.ts` (수정): `parseBaseUrl` 추가(http(s) 절대 URL만 허용), `buildInvoiceUrl`이 기준 URL이 올바르지 않으면 `null`. `src/lib/admin/invoices.ts`: 경고 판정을 "localhost이거나 올바르지 않은 URL"로 하고 `[::1]`·`::1`을 모두 localhost로 인식, 경고 문구 수정. 정상 URL 동작(끝 `/` 제거, 하이픈·대문자 ID 정규화) 유지
  - ✅ `(dashboard)/_components/invoice-list-heading.tsx` (신규): `loading.tsx`와 `page.tsx`의 중복 `h1`을 공용 컴포넌트로 통합
  - ✅ 제안만(미구현): 경고 판정에 `VERCEL_ENV` 반영, `listInvoices` import를 `src/lib/admin/**`로 제한하는 ESLint `no-restricted-imports` 규칙
  - ✅ 검증: 연속 3회 클릭에서 토스트 1개, 클립보드 실패 강제 후 선택을 해제하고 재클릭하면 입력란 전체 선택 복원, 빈 값·`not a url` 기준 URL 프로덕션 서버에서 복사 버튼 비활성+경고 문구, `https://` 값에서 복사 값 정상·경고 없음, `http://[::1]:3000/`는 경고, 로그인 제한 리셋 회귀(IP 키가 있을 때 4번 실패 후 성공 → 이후 5번 허용 → 6번째 제한), `"unknown"` 키는 리셋 건너뜀(스크립트로 확인)
  - ✅ 2차 리뷰 반영(2026-10-26):
    - `copy-invoice-link-button.tsx`: "idle로 비웠다 채우기"를 없애고 결과 카운터(`resultSeq`)를 live 영역 안쪽 span의 `key`로 사용. 입력란은 `status === "failed"`로 유지하고 선택 effect는 `[status, resultSeq]`에 의존. 성공도 상태를 비우지 않고 타이머만 재설정해 아이콘이 깜빡이지 않음
    - `buildInvoiceUrl`: 검증한 `URL` 객체로 조립(`origin` + 정리한 경로). query·hash(빈 `?`·`#` 포함)·계정 정보·`//` 없는 형태(`http:foo`)·앞뒤 공백은 `null`(공백은 설정 실수를 조용히 고치지 않고 경고로 드러내려고 trim 대신 거부), 경로 prefix는 유지하고 끝 `/`만 정리
    - 빈 기준 URL 방어 분기 주석 정리: 빈 값은 `next build`가 먼저 실패시키므로 주된 경로는 빌드를 통과한 localhost·비정상 URL. 경고 문구는 "열 수 없을 수 있습니다"로 완화. 방어 로직은 유지, `site.ts`의 `??`는 변경 없음
    - `UNKNOWN_CLIENT_KEY`를 `src/lib/pdf/rate-limit.ts`에서 export(PDF 동작 변경 없음)하고 `login-rate-limit.ts`가 import. 헤더 없는 환경에서는 한 버킷을 공유해 5회 실패로 관리자도 60초 잠길 수 있다는 한계를 주석으로 기록(Vercel 해당 없음)
    - 실측: 복사 성공·비동기 거부·동기 실패(clipboard 제거) 각 3회 반복 클릭에서 live 문구 노드가 매번 새로 생성되고 입력란은 재마운트되지 않으며(최초 1회만 추가) 매번 전체 선택, 토스트 1개 유지. 복사 값 `https://.../invoice/<ID>` 형식 유지. 임시 스크립트로 `http:foo`·`?x=1`·앞 공백·`user:pw@`·`//` 경로는 `null`/정리 결과 확인(테스트 파일 미보관). 로그인 제한(4번 실패 후 성공 → 5번 허용 → 6번째 제한), `/invoice/abc` 404, 실제 견적서 ID 200, `/invoice/guide` 200, `/` → 307, `/invoices` → 307 `/admin`, PDF 200 확인. `npm run check-all`(기존 포맷 경고 4건 제외)·`npm run build` 통과
  - ✅ 3차 리뷰 반영(2026-10-26): 기준 URL 거부 규칙을 `normalizeBaseUrl`(`src/lib/invoice-url.ts`) 한곳에 모아 `buildInvoiceUrl`과 관리자 화면 경고 판정(`isUnusableBaseUrl`)이 함께 쓰도록 통일(공백·query·계정 정보 등으로 모든 복사 버튼이 비활성인데 경고가 안 뜨던 불일치 해소). 값 중간의 공백·탭·개행은 거부, 연속된 `/`(`https://a.com//app`)는 `/app`으로 정리. `parseBaseUrl`은 내부 함수로 전환. 임시 스크립트로 19개 값 확인, `tsc`·`eslint`·`prettier` 통과(`build`는 생략)
  - 보류(3차 리뷰 낮음): 입력란 `select()` 포커스 동작과 live 영역·토스트 이중 낭독은 Safari·Firefox·스크린 리더 수동 확인이 필요해 미반영
  - 생략(2026-10-26 사용자 결정, 노션에서 직접 데이터를 만들고 지워야 해 번거로워 진행하지 않음): 노션 데이터 확인 3건(새 견적서 생성 직후 목록 반영(D17), 휴지통 견적서 제외, 발행일이 다른 견적서의 정렬). 코드는 단위 확인과 실제 노션 DB 2건 조회로 검증했고, 이 3건은 미검증 상태로 남는다. 필요해지면 Task 108의 테스트 체크리스트로 확인한다
  - 완료 기준: 위 코드 항목 통과 (노션 데이터 확인 3건은 사용자 결정으로 제외)
  - 주의: `NEXT_PUBLIC_SITE_URL`이 빈 값이거나 올바른 URL이 아니면 `src/app/layout.tsx`의 `new URL(siteConfig.url)`(`metadataBase`)이 던져 `next build`가 실패한다. 그래서 프로덕션에서 이 경고가 실제로 보이려면 빌드를 통과하는 값(localhost 등)이어야 한다. 위 검증은 `layout.tsx`를 임시로 고정값으로 바꿔 수행했고 즉시 복원함. `site.ts`의 `??` → `||`와 URL 검증은 범위 밖이라 제안으로 남김

### Phase 10: 문서 반영과 배포 ✅

담당 에이전트: `nextjs-app-router-developer` (사용자 작업 포함)

- **Task 109: 환경 변수·문서 반영과 배포** ✅ - 완료
  - 크기: S / 의존: Task 107, 108, 110, 111
  - 사용자 작업(에이전트 수정 불가):
    - ✅ 재배포(2026-10-26 사용자 보고)
    - ✅ `.env.local`의 `ADMIN_SESSION_SECRET`은 32자 이상이어야 함(짧으면 로그인이 실패하고 개발 서버가 힌트를 표시)
    - ✅ `.env.example`에 변수 **이름만**(값 없이) 추가: `ADMIN_PASSWORD=`, `ADMIN_SESSION_SECRET=` 두 줄(사용자 완료). 앱이 읽는 노션 변수(`NOTION_API_KEY`, `NOTION_DATABASE_ID`)와 `NEXT_PUBLIC_SITE_URL`도 같은 방식으로 이름만 추가(MVP부터 남아 있던 항목, 사용자가 "Task 109 수행"으로 보고. 에이전트는 `.env*`를 읽을 수 없어 파일 내용은 확인하지 못함) 다른 사람이 프로젝트를 받았을 때 어떤 변수를 채워야 하는지 알려 주는 용도이고 실제 값은 `.env.local`과 Vercel에만 둔다
    - ✅ Vercel 환경 변수 `ADMIN_PASSWORD`·`ADMIN_SESSION_SECRET`·`NEXT_PUBLIC_SITE_URL=https://invoice-web-ashy.vercel.app` 설정과 재배포(사용자 확인, 배포 환경에서 로그인·목록 동작)
  - 문서 갱신(에이전트):
    - ✅ `docs/architecture.md`: 관리자 라우트(`/admin`, `/admin/login`, `(dashboard)`), `src/lib/auth/`, `src/lib/admin/`, `invoice-list.ts`·`errors.ts`, `invoice-url.ts`, `proxy.ts` 관리자 분기, `/invoices` 리디렉트
    - ✅ `CLAUDE.md`: "라우트 그룹"에 `app/admin/`과 `/invoices` 리디렉트, "환경 변수"에 `ADMIN_PASSWORD`·`ADMIN_SESSION_SECRET`(이름과 용도만), `proxy.ts` 설명에 관리자 분기
    - ✅ `docs/notion-setup.md` 3절: 관리자 목록 링크 복사가 기본, 노션 수식은 선택, 수식 도메인과 `NEXT_PUBLIC_SITE_URL` 일치
  - 배포 URL 스모크 확인(사용자 재배포 후, 2026-10-26): 전 시나리오 회귀는 로컬에서 끝냈으므로 반복하지 않는다
    - ✅ 비로그인으로 확인한 항목(`https://invoice-web-ashy.vercel.app`): `/` → 307 `/invoice/guide`, `/invoice/guide` 200, `/invoices` → 307 `/admin`, `/admin` → 307 `/admin/login?next=%2Fadmin`(응답 헤더 `X-Robots-Tag: noindex`), `/admin/login` 200과 `<meta name="robots" content="noindex, nofollow">`, `/invoice/abc` 404, 실제 견적서 200, PDF 다운로드(`POST /api/generate-pdf`) 200 `application/pdf`(`%PDF-`)
    - ✅ 비밀번호가 필요한 항목은 사용자가 직접 확인(2026-10-26 "배포 완료되었고 잘 작동" 보고): 배포 사이트에서 로그인, `/admin` 목록 표시, 링크 복사·열기. 복사 값의 정확한 문자열은 사용자 보고에 포함되지 않아 에이전트가 직접 대조하지 못함
  - 완료 기준: 배포 환경에서 F020~F023 동작, 로드맵 진행 상황 갱신
  - 참고: `shrimp-rules.md`의 "PRD 범위 밖 기능 금지"·D1~D12 문구는 V2와 충돌하므로 사용자 판단으로 갱신이 필요하다(에이전트는 수정하지 않음)

## 기능 ID ↔ Task 매핑

| 기능 ID | 기능명 | 관련 Task |
| --- | --- | --- |
| F020 | 관리자 견적서 목록 | 101, 102, 103, 105, 106, 108, 111 |
| F021 | 견적서 링크 복사 | 101, 103, 105, 108, 111, 109 |
| F022 | 관리자 접근 보호 | 101, 102, 104, 107, 110, 111, 109 |
| F023 | 다크 모드 보완 | 101, 104 |

## 진행 순서 요약

```text
101 결정 확정 ✅
 ├─ [골격] Phase 5: 102 관리자 라우트 · 103 타입·링크 유틸·더미   ← nextjs-app-router-developer
 │      ├─ [UI]   Phase 6: 104 셸·로그인 UI · 105 목록 UI        ← ui-markup-specialist
 │      └─ [노션] Phase 7: 106 목록 쿼리 (Phase 6과 병렬)         ← notion-api-database-expert
 │             └─ [통합] Phase 8: 107 인증 ─ 108 실데이터·링크 복사  ← nextjs-app-router-developer
 │                    └─ [보완] Phase 9: 110 로그인 진단·/invoices 리디렉트 ─ 111 108 보류 지적 반영
 │                           └─ [배포] Phase 10: 109 환경 변수·문서·배포 스모크
```
