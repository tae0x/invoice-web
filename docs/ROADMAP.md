# Invoice Web 개발 로드맵

노션에서 작성한 견적서를 고유 링크 하나로 웹에서 확인하고 PDF로 저장하게 하는 MVP를 완성합니다.

**📅 최종 업데이트**: 2026-10-25
**📊 진행 상황**: Phase 4 완료, 모든 Phase 완료 (13/13 Tasks 완료, 100%. Task 014는 범위에서 제외). Task 009의 일부 확인(노션 값 수정 후 반영, 항목 0개·빈 속성·26개 이상·긴 값 실데이터)은 해당 견적서를 노션에 만든 뒤 진행

## 개요

Invoice Web은 견적서를 발행하는 프리랜서·소규모 기업과 견적서를 받는 클라이언트를 위한 서비스입니다. 별도 관리자 화면 없이 노션 데이터베이스를 데이터 원천으로 쓰며, 다음 기능을 제공합니다.

- **노션 데이터베이스 연동 (F001)**: Notion API로 견적서와 견적 항목 데이터를 서버에서 조회
- **견적서 조회 (F002)**: `/invoice/[notionPageId]` 고유 URL로 견적서 내용 표시
- **PDF 다운로드 (F003)**: 버튼 클릭 시 견적서를 PDF로 생성해 다운로드
- **견적서 URL 생성 (F010)**: 노션 페이지 ID 기반 고유 URL 제공
- **견적서 유효성 검증 (F011)**: 존재하지 않거나 잘못된 견적서 접근 시 404 안내
- **반응형 레이아웃 (F012)**: 모바일·태블릿·데스크톱 대응

기준 문서: `docs/PRD.md` (v1.0 MVP), `docs/architecture.md`, `CLAUDE.md`

## 현재 상태 (Phase 3 완료 시점)

이미 구현되어 있으므로 이 로드맵에서 다시 계획하지 않는 항목입니다.

- Next.js 16.4.3 / React 19.3 / TypeScript 5 / Tailwind v4 / shadcn(Base UI, `base-nova`) 기반 프로젝트 구성
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`
- 루트 레이아웃(`src/app/layout.tsx`): ThemeProvider(next-themes, 다크 모드), TooltipProvider, Toaster(sonner)
- `(marketing)` 레이아웃: `SiteHeader`(테마 토글 포함) + `SiteFooter`, 서비스 안내(`/invoice/guide`, `/`는 여기로 리디렉트)
- 전역 `loading.tsx`, `error.tsx`(`retry` prop), `global-error.tsx`, `not-found.tsx`
- 공통 컴포넌트: `Container`, `Logo`, `PageHeader`, `ThemeToggle`
- shadcn ui: alert, badge, button, card, dropdown-menu, empty, navigation-menu, separator, sheet, skeleton, sonner, spinner, table, tooltip

프로젝트 초기설정·환경설정으로 완료된 것:

- 노션 Integration 생성과 `.env.local`의 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 설정
- 노션에 견적서 DB(Invoices)와 관계형 항목 DB(Items) 구성 (속성 명세는 "선행 결정"의 "노션 DB 속성 명세")

Phase 1(Task 002~003)에서 완료된 것:

- 견적서 라우트 골격 (Task 002): `src/app/invoice/layout.tsx`(독립 레이아웃, 마케팅 헤더·푸터 없음), `src/app/invoice/[notionPageId]/`의 `page.tsx`·`loading.tsx`·`error.tsx`·`not-found.tsx`, `_components/invoice-skeleton.tsx`. 빌드에서 `/invoice/[notionPageId]`는 Partial Prerender(◐)
- 견적서 전용 컴포넌트 위치: 라우트 내 비공개 폴더 `_components/` (Task 004 결정 사항의 선례)
- 공용 타입 (Task 003): `src/types/invoices.ts`, `notion.ts`(`@notionhq/client` SDK 타입 재사용), `pdf.ts`
- 공용 상수·유틸 (Task 003): `src/lib/constants.ts`, `format.ts`(KRW·날짜 포맷, 잘못된 날짜는 `-`), `invoice-schema.ts`(페이지 ID zod 스키마, 하이픈 없는 소문자로 정규화), `dummy-invoices.ts`(가짜 ID의 더미 데이터. Phase 3 통합에서 사용처가 없어져 삭제함)
- 노션 속성명 매핑 (Task 003): 서버 전용 `src/lib/notion/properties.ts`
- `@notionhq/client` 5.x(`^5.28.0`) 설치 (Task 003에서 타입 재사용을 위해 먼저 설치)

Phase 2(Task 004~006)에서 완료된 것:

- 견적서 화면 (Task 004): `_components/`의 `invoice-view.tsx`가 `invoice-header`·`invoice-status-badge`·`invoice-client`·`invoice-items-table`·`invoice-summary`를 조합. `page.tsx`는 `getInvoice`로 노션 실데이터를 조회 (Task 009). 발행자 정보는 `siteConfig.issuer`
- 상태 화면 (Task 005): 견적서 형태의 `invoice-skeleton.tsx`, 404·에러 화면(`h1` 제목, `retry` 버튼)
- PDF (Task 006): `@react-pdf/renderer` 설치, Noto Sans KR 정적 TTF(`src/lib/pdf/fonts/`)와 등록(`src/lib/pdf/fonts.ts`), A4 문서 `src/lib/pdf/invoice-document.tsx`, 다운로드 버튼 `download-pdf-button.tsx`

Phase 3 트랙 A(Task 007~008, 노션 API)에서 완료된 것:

- Next.js 16.4.3 보안 업데이트 (`next`·`eslint-config-next` 16.4.3 고정, `npm audit --omit=dev` 0건)
- 환경·클라이언트 (Task 007): `src/lib/notion/env.ts`(zod, 첫 호출 시 지연 검증, 오류 메시지에 변수 이름만), `client.ts`(`server-only` 싱글턴, 타임아웃 10초·SDK 재시도, 로그는 코드만). `server-only` 패키지 설치
- 조회 로직 (Task 008): `src/lib/notion/mappers.ts`(속성 존재·`type`을 런타임에 확인), `invoices.ts`의 `getInvoice(pageId): Promise<Invoice | null>`(`React.cache`, 요청 간 캐시 없음)
- 화면용 60초 캐시 (Task 012-4, D8 수정): `invoices.ts`의 `getCachedInvoice`(`use cache` + `cacheLife`)를 견적서 페이지·`generateMetadata`가 쓰고, PDF API는 캐시 없는 `getInvoice`를 쓴다. 서버 로거 `src/lib/logger.ts`(012-5), PDF API 호출 빈도 제한 `src/lib/pdf/rate-limit.ts`(012-2, 012-6 보강)
- 노션 요청 수(실측): 정상 견적서는 서버 기동 후 첫 조회 3회(페이지·Invoices 데이터 소스 스키마·항목 쿼리), 이후 2회(스키마의 Items 데이터 소스 ID를 모듈 메모리에 재사용). 항목 0개면 1회, 형식이 틀린 ID는 0회
- `src/proxy.ts`(D12): 형식이 틀린 ID는 정적 404 라우트 `src/app/invoice/invalid-id/`로 `status: 404`와 함께 rewrite (개발·프로덕션 모두 HTTP 404, URL 유지). `guide`, 형식이 맞는 ID는 통과 (더미용 `test-N` 예외는 Task 009에서 제거해 `/invoice/test-1`은 HTTP 404)
- 견적서 404 화면의 탭 제목(`metadata` + React `<title>`)과 `noindex`(Next.js 자동 주입)
- 견적서 페이지 연동 (Task 009): `page.tsx`가 `getInvoice`를 Suspense 안에서 호출(null은 `notFound()`, throw는 `error.tsx`). `generateMetadata`로 탭 제목 `견적서 <번호>` 적용(`React.cache`로 페이지와 중복 조회 없음, 빌드 ◐ 유지)

Phase 3 트랙 B·통합(Task 010)에서 완료된 것:

- PDF API (Task 010): `/api/generate-pdf`는 견적서 ID만 받아 `getInvoice`로 노션을 재조회한다(더미 폴백 제거). PDF 렌더링·헤더 모듈(`src/lib/pdf/render-invoice-pdf.tsx`, `response-headers.ts`)과 `generatePdfRequestSchema`, `outputFileTracingIncludes` 설정은 트랙 B에서 만들었다

Phase 3 Task 011에서 완료된 것:

- 노션 Invoices DB에 `견적서 URL` 수식 속성(`"http://localhost:3000/invoice/" + id()`)을 추가하고, 값이 `http://localhost:3000/invoice/<하이픈 없는 32자리 ID>`로 나오는 것과 그 URL을 그대로 열면 견적서가 표시되는 것을 확인했다. 설정 방법은 `docs/notion-setup.md`

아직 없는 것:

- Task 009의 노션 데이터가 필요한 확인(값 수정 후 반영, 항목 0개·빈 속성·26개 이상·긴 항목명 실데이터)
- `.env.example`의 노션 변수 항목은 도구 권한상 직접 수정하지 못해 사용자 반영 대기 (`NOTION_API_KEY=`, `NOTION_DATABASE_ID=`)
- 테스트 러너 없음 (검증은 `npx tsc --noEmit`, `npm run lint`, `npm run build`, Playwright MCP 시나리오로 수행)
- `/tasks` 디렉토리 없음

## 범위

- **포함**: PRD MVP 기능 F001, F002, F003, F010, F011, F012와 이를 위한 배포(Vercel)
- **범위 밖** (로드맵에 포함하지 않음): PRD의 "MVP 이후 기능"과 "향후 개선 방향" 전체 — 관리자 대시보드, 견적서 상태 관리(승인/거절 추적), 검색·필터, 이메일 자동 발송, 만료일 설정·알림, 템플릿 커스터마이징, 다국어, 전자 서명, 버전 관리
- PRD에 없는 인증·권한 기능은 만들지 않습니다. 견적서 페이지는 PRD대로 공개 URL(인증 불필요)입니다.

## 작업 크기와 일정 표기

날짜는 정하지 않고 크기와 순서로만 표현합니다.

- **S**: 단일 관심사, 파일 1~3개 수준, 외부 의존 없음
- **M**: 여러 모듈에 걸침, 외부 API 또는 라이브러리 도입 포함
- **L**: 외부 제약(배포 환경, 바이너리, 폰트 등) 검증이 필요한 작업 (현재 L 작업 없음. D1을 `@react-pdf/renderer`로 확정해 Task 006·010는 M)

## 선행 결정 (확정)

PRD에서 정해지지 않았거나 서로 맞지 않던 항목을 프로젝트 분석 결과를 바탕으로 확정했습니다. 결정을 바꿀 때는 이 표를 먼저 고친 뒤 영향받는 Task를 갱신합니다.

| ID | 항목 | 결정 | 근거 | 영향 Task |
| --- | --- | --- | --- | --- |
| D1 | PDF 생성 방식 | `@react-pdf/renderer`. 웹 화면과 별도의 PDF 전용 레이아웃을 작성하고 한글 폰트를 등록한다 | Vercel 서버리스에서 Chromium 용량·실행 시간 제약을 피한다. `serverExternalPackages` 기본 목록에 포함되어 별도 설정이 필요 없다 | 006, 010, 013 |
| D2 | PDF API 입력 방식 | 견적서 ID만 받고 서버가 노션을 재조회한다 | 클라이언트가 금액을 바꿔 보낼 수 없다. 입력 검증은 ID 형식(zod)만 필요하고 `getInvoice`를 재사용한다 | 010 |
| D3 | 노션 DB 속성 이름·타입 | 한글 속성명으로 통일한다(아래 "노션 DB 속성 명세"). 코드는 매핑 상수 한 곳으로만 속성명을 참조한다. 날짜는 시간 없는 `YYYY-MM-DD`로 읽고 표시는 `Asia/Seoul` 기준이다 | 노션 DB를 PRD 구조 예시(한글)대로 구성했다. 문자열 하드코딩을 막아 속성명 변경 영향을 한 곳으로 모은다 | 003, 008 |
| D4 | 상태(Select) | 읽어서 배지로 표시한다(읽기 전용). 옵션은 `대기`·`승인`·`거절`이다. 상태 변경·추적은 범위 밖이다. 빈 값이나 알 수 없는 값은 배지를 숨긴다 | PRD 데이터 모델에 `status`가 있고 표시 비용이 작다. 승인/거절 추적 기능은 MVP 이후다 | 003, 004 |
| D5 | F010 URL 생성 주체 | 노션 수식 속성이 만든다: `"<사이트 URL>/invoice/" + id()`. 앱은 URL 형식(하이픈 포함·미포함 ID)만 처리하고 별도 생성 기능을 만들지 않는다 | PRD가 관련 페이지를 "노션 (외부 시스템)"으로 정의한다 | 011 |
| D6 | 총 금액·통화·VAT | 노션 `총 금액` Number 값을 그대로 표시한다. 통화는 원(KRW)이고 VAT는 별도 표기하지 않는다(입력 값이 최종 금액). 항목의 `금액`은 항목 행 표시용이다 | PRD 데이터 모델의 출처를 따른다. 합계 불일치 검증은 MVP 범위 밖이며 발행자가 노션에서 관리한다 | 003, 004, 008 |
| D7 | 발행자(회사) 정보 | `src/config/site.ts`에 상수로 두고 화면과 PDF가 공통으로 쓴다. 상호·이메일만 `siteConfig.issuer`에 둔다 | `site.ts`가 사이트 정보의 단일 출처다. 노션 DB에 속성을 추가하지 않는다 | 004, 006 |
| D8 | 데이터 캐싱 | 견적서 화면(페이지 본문·`generateMetadata`)의 노션 조회는 `use cache` + `cacheLife({ stale: 30, revalidate: 60, expire: 61 })`로 60초 캐싱한다(`getCachedInvoice`). 노션 수정은 화면에 최대 60초 늦게 반영된다. PDF API는 D2 때문에 캐시 없는 `getInvoice`를 계속 써서 항상 최신이며, 그 결과 노션 수정 뒤 최대 60초 동안 화면과 PDF의 값이 다를 수 있다. 동적 `params`와 조회는 Suspense 경계 안에 둔다. 오류(throw)는 캐시되지 않고, 없는 견적서(null)는 값으로 60초 저장된다 | PRD의 "실시간 조회"는 "요청 시점에 노션에서 읽는다"(정적 생성 아님)로 해석하고, 사용자가 허용한 최대 지연을 60초로 정했다(012-4). 같은 링크가 반복 열릴 때 노션 호출(견적서 1건 2~3회)과 응답 시간(0.6~1.0초)을 줄이고, 노션 제한(평균 초당 3회)에 대한 여유를 늘린다. 한계: 기본 인메모리 캐시라 서버리스(Vercel)에서는 인스턴스마다 따로이며 재사용이 보장되지 않는다. 보장이 필요하면 `use cache: remote`를 사용자 결정으로 검토한다 | 008, 009, 012 |
| D9 | 접근 범위 검증 | 조회한 페이지의 부모 DB가 `NOTION_DATABASE_ID`와 일치할 때만 표시한다. 항목 DB ID 환경 변수는 추가하지 않는다(Items 데이터 소스 ID는 Invoices 데이터 소스 스키마의 `항목` Relation 설정에서 읽는다). 페이지 부모는 `{ type: "data_source_id", data_source_id, database_id }` 형태이며 `parent.database_id`를 비교한다(Task 007·008에서 확인) | Integration에 공유된 다른 노션 페이지가 URL 추측으로 노출되는 것을 막는다 | 007, 008 |
| D10 | 라우트 위치·세그먼트명 | `src/app/invoice/[notionPageId]/`에 두고 `(marketing)` 그룹 밖의 독립 레이아웃(`src/app/invoice/layout.tsx`, 마케팅 헤더·푸터 없음)을 쓴다 | 클라이언트가 링크로 여는 문서형 화면이라 서비스 내비게이션이 필요 없다. URL 파라미터 이름을 PRD의 `notionPageId`와 맞춘다 | 002 |
| D11 | 노션 페이지 본문(블록) | 사용하지 않는다(`blocks.children.list` 호출 없음) | 데이터 모델이 속성과 Relation만 쓴다. 요청 수도 줄어든다 | 008 |
| D12 | 404 처리 방식 | 같은 URL에서 404 안내 화면을 렌더링한다(리디렉션하지 않음). ID 형식이 잘못된 요청은 `src/proxy.ts`가 스트리밍 전에 검사해 HTTP 404를 돌려준다. 형식은 맞지만 없는 견적서는 페이지에서 `notFound()`로 처리한다(이 경우 상태 코드는 200 + `noindex`) | PRD의 "자동 리디렉션"은 별도 경로 이동이 아니라 404 화면 자동 표시로 해석한다. `loading.tsx`가 있으면 스트리밍이 먼저 시작되어 이후 `notFound()`는 상태 코드를 404로 바꾸지 못한다(Next.js `loading.md` "Status codes"). 존재 여부 확인은 노션 조회가 필요해 proxy에서 하지 않는다(proxy는 빠른 검사만) | 002, 005, 008 |

### 노션 DB 속성 명세 (D3, D4)

노션 DB는 이미 아래 구성으로 만들어 두었고, DB 이름은 `Invoices`와 `Items`로 확인했습니다. 각 DB의 속성명과 타입은 Task 003 착수 시 실제 DB와 대조해 확인합니다. 속성명을 바꾸면 매핑 상수만 수정합니다.

**견적서 DB (Invoices)** — `NOTION_DATABASE_ID`가 가리키는 DB

| 속성명 | 노션 타입 | 도메인 필드 | 비고 |
| --- | --- | --- | --- |
| 견적서 번호 | Title | `invoiceNumber` | DB의 필수 Title 속성 |
| 클라이언트명 | Text (rich_text) | `clientName` | |
| 발행일 | Date | `issueDate` | 시간 없음 |
| 유효기간 | Date | `validUntil` | 시간 없음 |
| 상태 | Status | `status` | `대기` / `승인` / `거절`. 실제 DB는 Status 타입(Task 008에서 확인). 매퍼는 Select도 허용 |
| 총 금액 | Number | `totalAmount` | 원 단위 정수 |
| 항목 | Relation → Items | `items` | 양방향 관계 |

**항목 DB (Items)**

| 속성명 | 노션 타입 | 도메인 필드 | 비고 |
| --- | --- | --- | --- |
| 항목명 | Title | `description` | |
| 수량 | Number | `quantity` | |
| 단가 | Number | `unitPrice` | 원 단위 정수 |
| 금액 | Formula (`수량 × 단가`) | `amount` | |
| Invoices | Relation → Invoices | 항목 조회 필터용 | 양방향 관계의 역방향. 값은 읽지 않고 `dataSources.query` 필터에만 쓴다 |

추가로 확인이 필요한 기술 사항 (사용자 결정이 아니라 작업 중 문서 확인 대상):

- `@notionhq/client` 최신 메이저 버전과 Notion API 버전 변경 사항 (데이터베이스/데이터 소스 API 구분 등). 구현 전에 context7 MCP로 공식 문서를 확인합니다.
- Next.js 16 API는 학습 데이터와 다릅니다. 라우트·캐싱·에러 처리·Route Handler 작업 전에 `node_modules/next/dist/docs/`의 해당 문서를 읽습니다. 예: `middleware`는 `proxy`로 이름이 바뀜, 에러 바운더리 복구 prop은 `retry`, `cacheComponents`가 켜져 있어 동적 `params` 접근은 Suspense 경계가 필요, `@react-pdf/renderer`·`puppeteer`는 `serverExternalPackages` 기본 목록에 포함됨.

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스와 이 문서의 "현재 상태"를 확인하고 착수할 Task를 고릅니다.
   - 새 작업이 생기면 이 `ROADMAP.md`에 추가하고, 우선순위 작업은 마지막 완료 작업 다음에 넣습니다.
   - 작업이 의존하는 결정(D1~D12)이 확정되지 않았다면 착수하지 않습니다.

2. **작업 생성**
   - 현재 `/tasks` 디렉토리는 없습니다. Task별 상세 명세 파일을 쓰기로 하면 첫 작업 착수 시 디렉토리와 형식을 함께 정합니다. 그 전까지는 이 문서의 Task 체크리스트가 명세 역할을 합니다.
   - 작업 명세에는 관련 파일, 구현 단계, 수락 기준을 포함하고, API·비즈니스 로직 작업은 "테스트 체크리스트"(Playwright MCP 시나리오)를 반드시 포함합니다.

3. **작업 구현**
   - Next.js 관련 작업은 `node_modules/next/dist/docs/`의 해당 가이드를 먼저 읽습니다.
   - 각 Task 완료 시 `npx tsc --noEmit`, `npm run lint`를 통과시키고, 라우트·캐싱이 바뀌면 `npm run build`로 `cacheComponents` prerender 오류가 없는지 확인합니다.
   - API 연동·비즈니스 로직은 개발 서버(`npm run dev`) + Playwright MCP 시나리오로 검증합니다.
   - 각 Task 구현을 마치면 그 Task 안에서 `code-reviewer` 서브에이전트로 변경사항을 리뷰하고 지적 사항을 반영 또는 보고합니다. 검증·리뷰만 하는 별도 Task는 두지 않습니다.
   - 각 단계 완료 후 중단하고 다음 지시를 기다립니다.

4. **로드맵 업데이트**
   - 완료된 Task와 세부 구현 사항을 ✅로 표시하고, 모든 Task가 끝난 Phase 제목에 ✅를 붙입니다.

## 상태 표시 규칙

- Phase 제목 + ✅: 완료된 Phase
- Task `✅ - 완료`: 완료된 작업 / `- 우선순위`: 즉시 시작할 작업 / 표시 없음: 대기
- 세부 구현 사항 `✅`: 완료 / `-`: 미완료

## 개발 단계

### Phase 1: 애플리케이션 골격 구축 ✅

- **Task 001: MVP 선행 결정 사항 확정** ✅ - 완료
  - 크기: S / 의존: 없음 / 코드 변경 없음
  - ✅ D1~D12를 프로젝트 분석 결과로 확정하고 "선행 결정 (확정)" 표에 기록
  - ✅ 노션 DB 속성 명세(D3, D4) 기록. 실제 DB와의 대조는 Task 003에서 수행
  - ✅ 노션 Integration과 `.env.local`(`NOTION_API_KEY`, `NOTION_DATABASE_ID`) 설정, 노션 견적서·항목 DB 구성 완료 (프로젝트 초기설정·환경설정)

- **Task 002: 견적서 라우트와 loading·error·404 골격 생성** ✅ - 완료
  - 크기: S / 의존: Task 001(D10, D12) ✅
  - 사전 확인: `node_modules/next/dist/docs/`의 `dynamic-routes.md`, `page.md`, `not-found.md`, `loading.md`, `error.md`(`03-file-conventions/`), `01-getting-started/08-caching.md`
  - ✅ D10에 따라 `src/app/invoice/layout.tsx` 독립 레이아웃 생성 (`LayoutProps<"/invoice">`, 콘텐츠 폭은 `Container`, 마케팅 헤더·푸터 없음)
  - ✅ `src/app/invoice/[notionPageId]/page.tsx` 골격 생성 (`params`는 Promise, `cacheComponents` 환경이므로 `params` 접근을 Suspense 경계 안에 배치)
  - ✅ 견적서 전용 `loading.tsx`, `not-found.tsx`, `error.tsx` 골격 생성 (전역 파일과 별도로 견적서 문구를 쓰기 위함, `error.tsx`는 `"use client"`와 `retry` prop 사용)
  - ✅ 페이지 `metadata`는 `title`만 지정 (루트 title template 사용)
  - ✅ 화면의 문구·스타일 완성은 Task 005에서 하고, 여기서는 라우팅 구조와 파일 배치만 만든다
  - ✅ PDF API(`src/app/api/generate-pdf/route.tsx`) 골격은 이 Task에서 제외하고 Task 010에서 만든다
  - ✅ 스켈레톤은 `src/app/invoice/[notionPageId]/_components/invoice-skeleton.tsx`에 둠. 견적서 전용 컴포넌트 위치를 라우트 내 비공개 폴더 `_components/`로 정함 (Task 004 결정 사항의 선례)
  - ✅ 수락 기준: `/invoice/아무값` 접근 시 골격 화면 표시, 404·loading·error 골격이 각각 렌더링됨(임시 확인용 호출은 남기지 않음), `npm run build` 통과 (`/invoice/[notionPageId]`는 Partial Prerender ◐)
  - ✅ Playwright MCP 확인: 골격 표시, 마케팅 헤더·푸터 없음, 콘솔 에러 없음, 375px 폭에서 가로 넘침 없음

- **Task 003: 견적서 타입 정의와 데이터 모델 상수 생성** ✅ - 완료
  - 크기: S / 의존: Task 001(D3, D4, D6)
  - ✅ `Invoice`, `InvoiceItem` 타입 정의 (D4: 상태 타입 `InvoiceStatus = "대기" | "승인" | "거절"`을 포함하고 빈 값을 허용, D6: `totalAmount`는 노션 `총 금액` 값)
  - ✅ 노션 속성명 ↔ 도메인 필드 매핑 상수 정의 (D3의 "노션 DB 속성 명세"를 기준으로 하고, 착수 시 실제 노션 DB 스키마와 대조해 확인, 코드 곳곳에 문자열 하드코딩 금지)
  - ✅ 상태 옵션 상수와 표시용 라벨 상수 정의
  - ✅ 노션 페이지 ID 형식 검증 zod 스키마 (32자리 16진수, 하이픈 포함·미포함 형식 모두 허용 여부 포함). 앞뒤 공백은 거부하고, 하이픈 없는 소문자로 정규화
  - ✅ 금액(KRW) 및 날짜(`YYYY-MM-DD`, `Asia/Seoul`) 포맷 유틸 (`Intl.NumberFormat`, `Intl.DateTimeFormat`, D3·D6 기준). `formatDate`는 잘못된 날짜를 `-`로 표시
  - ✅ UI 개발용 더미 데이터 작성 (항목 0개, 1개, 다수, 긴 항목명 케이스 포함). 더미 데이터의 ID는 가짜 값
  - ✅ 파일 위치: 공용 타입은 `src/types/`(`invoices.ts`, `notion.ts`, `pdf.ts`), 공용 상수·유틸은 `src/lib/` 직하위, 노션 속성명 매핑은 서버 전용 `src/lib/notion/properties.ts` (공용 타입·상수·포맷 유틸은 클라이언트 컴포넌트에서도 import 가능해야 함)
  - ✅ 노션 타입: `src/types/notion.ts`는 `@notionhq/client` SDK 타입(`PageObjectResponse` 속성 union)을 재사용하고, 속성명 키는 `src/lib/notion/properties.ts`에서 파생한다 (`@notionhq/client` `^5.28.0`을 이 Task에서 먼저 설치)
  - ✅ 실제 DB 대조 결과(CSV·사용자 확인): Invoices 7개 속성은 명세와 같음. Items 역방향 Relation 이름은 `견적서`가 아니라 `Invoices`라서 명세를 수정함. `금액`은 Formula
  - ✅ 수락 기준: `npx tsc --noEmit` 통과, 더미 데이터가 타입을 만족

### Phase 2: UI/UX 완성 (더미 데이터 활용) ✅

Task 004~006은 Task 003의 타입·더미 데이터만 있으면 Phase 3의 Task 007~008과 병렬로 진행할 수 있습니다.

- **Task 004: 견적서 조회 화면 UI 구현 (F002, F012)** ✅ - 완료
  - 크기: M / 의존: Task 003, Task 001(D4, D6, D7)
  - ✅ 견적서 헤더: 견적서 번호, 발행일, 유효기간, (D4에 따라) 상태 배지, (D7에 따라) 발행자 정보
  - ✅ 클라이언트 정보 영역: 클라이언트명
  - ✅ 견적 항목 표: 항목명, 수량, 단가, 금액 (기존 shadcn `table`, `card`, `separator`, `badge` 활용)
  - ✅ 합계 영역: 총 금액 (D6 표기 규칙)
  - ✅ 반응형: 모바일에서 표가 깨지지 않도록 항목을 카드형 목록 또는 가로 스크롤로 표시, 태블릿·데스크톱은 표 형태
  - ✅ 항목 0개일 때의 빈 상태 표시 (`empty` 컴포넌트)
  - ✅ 시맨틱 색상 토큰만 사용 (다크 모드 대응), 콘텐츠 폭은 `Container` 사용
  - ✅ 서버 컴포넌트로 작성하고 상호작용 요소만 `"use client"` 말단 컴포넌트로 분리
  - ✅ 컴포넌트 위치는 `docs/architecture.md` 계층 규칙을 따르며, 견적서 전용 컴포넌트를 둘 위치(라우트 폴더 내 비공개 폴더 또는 `src/components` 하위 신규 폴더)를 착수 시 정함 (라우트 내 `_components/`로 결정, `docs/architecture.md`에 반영됨)
  - ✅ 수락 기준: 더미 데이터로 모든 필드가 표시되고 375px/768px/1280px 폭에서 가로 넘침 없음

- **Task 005: 견적서 404·로딩·에러 상태 UI 구현 (F011, F012)** ✅ - 완료
  - 크기: S / 의존: Task 002, Task 001(D12) / Task 002의 골격 파일을 완성하는 작업
  - ✅ 견적서 전용 404 화면: "견적서를 찾을 수 없습니다" 안내와 발행자에게 올바른 링크를 요청하라는 가이드 (PRD 문구 기준)
  - ✅ 로딩 상태: 견적서 레이아웃 형태의 `skeleton` (Suspense fallback 겸용)
  - ✅ 노션 API 장애 등 예기치 못한 오류용 에러 화면: Next.js 16의 `retry` prop으로 재시도 버튼 제공 (사전 확인: `03-file-conventions/error.md`)
  - ✅ Task 002 리뷰 제안 반영: 스켈레톤에 `sr-only` 로딩 문구 추가, 에러·404 화면에 `h1` 제목 추가 (404 화면의 탭 제목·`noindex`는 Task 008에서 처리)
  - ✅ 수락 기준: 각 상태 화면이 모바일·데스크톱·다크 모드에서 정상 표시

- **Task 006: PDF 문서 레이아웃과 다운로드 버튼 UI 구현 (F003)** ✅ - 완료
  - 크기: M / 의존: Task 003, Task 001(D1, D7)
  - ✅ D1에 따라 `@react-pdf/renderer` 패키지 설치, PDF 전용 문서 컴포넌트 작성, 한글 폰트 파일 등록(폰트 라이선스 확인), A4 기준 레이아웃, 항목이 많을 때 페이지 넘김 확인
  - ✅ 다운로드 버튼 클라이언트 컴포넌트: 생성 중 `spinner`와 중복 클릭 방지, 실패 시 sonner 토스트, 완료 후 같은 페이지 유지(재다운로드 가능)
  - ✅ 더미 데이터로 PDF 생성 경로 확인: 화면에 연결된 API가 없으므로 scratchpad 스크립트로 더미 5건과 40항목 데이터를 직접 렌더링해 확인했다. 다운로드 버튼은 Task 010 전까지 `/api/generate-pdf`가 404라서 실패 토스트가 정상 동작이다 (실데이터 연동은 Task 010)
  - ✅ 수락 기준: 더미 데이터로 생성한 PDF에서 한글이 깨지지 않고 웹 화면과 같은 정보가 담김

### Phase 3: 핵심 기능 구현 ✅

- **Task 007: Notion 연동 환경과 서버 전용 클라이언트 구성 (F001)** ✅ - 완료
  - 크기: S / 의존: Task 001(D9)
  - ✅ 사전 확인: context7 MCP로 `@notionhq/client` 5.28.0 문서 확인 (기본 `Notion-Version` 2025-09-03, 데이터 소스 API, 페이지 부모 `{ type: "data_source_id", data_source_id, database_id }`)
  - ✅ 선행: Next.js 16.4.3 보안 업데이트 (`next`·`eslint-config-next` 16.4.3 고정, critical 3건 해소, `npm audit --omit=dev` 0건, 빌드 ◐ 유지)
  - ✅ `@notionhq/client` 5.x는 Task 003에서 설치 완료, `server-only` 설치
  - ✅ 환경 변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 `.env.local`에 설정 완료 (D9에 따라 항목 DB ID 변수는 추가하지 않음). `.env.example` 예시 추가는 도구 권한상 직접 수정하지 못해 사용자 반영 대기
  - ✅ `src/lib/notion/env.ts`: zod 검증(`NOTION_DATABASE_ID`는 `notionPageIdSchema`로 정규화), 첫 호출 시 지연 검증(환경 변수 없이도 `npm run build` 통과), 오류 메시지에는 변수 이름만 적고 값은 넣지 않음
  - ✅ `src/lib/notion/client.ts`: `import "server-only"`, `getNotionClient()` 싱글턴 (타임아웃 10초, 재시도 2회, SDK 로그는 코드·시도 횟수만)
  - ✅ 수락 기준: 서버에서 노션 DB 접근 성공, `.next/static`에서 `NOTION_API_KEY`·`ntn_`·`secret_`·`api.notion.com` 검색 0건, 클라이언트 컴포넌트에서 `lib/notion/*`을 import하면 `server-only` 빌드 오류

- **Task 008: 견적서 조회 로직 구현 (F001, F011)** ✅ - 완료
  - 크기: M / 의존: Task 003, 007, Task 001(D3, D6, D8, D9, D11, D12)
  - ✅ 사전 확인: `01-getting-started/06-fetching-data.md`, `08-caching.md`, `10-error-handling.md`, `16-proxy.md`, `03-file-conventions/proxy.md`, `03-file-conventions/loading.md`("Status codes"), `04-functions/not-found.md`, `cacheLife.md`
  - ✅ (D12) `src/proxy.ts`: `matcher`는 `/invoice/:path*`, 첫 세그먼트가 `guide`·`test-N`(Task 009에서 제거)·형식이 맞는 ID면 통과, 그 외는 정적 404 라우트 `src/app/invoice/invalid-id/`(`notFound()`만 호출, ○)로 `status: 404`와 함께 rewrite해 HTTP 404와 견적서 404 화면을 준다(URL 유지). 노션 조회 없음. 견적서 라우트에 `status: 404`만 주는 방식은 개발 서버에서만 404이고 프로덕션에서는 PPR 셸 때문에 200이며, 정적 404 라우트만 쓰면 반대로 개발 서버(루트 `loading.tsx`가 먼저 스트리밍)에서 200이라 둘을 함께 쓴다
  - ✅ `getInvoice(pageId)` (`src/lib/notion/invoices.ts`): ID 형식 검증 → `pages.retrieve` → 보관·휴지통이면 null → (D9) `parent.database_id`와 `NOTION_DATABASE_ID` 비교 → 속성 매핑
  - ✅ 견적 항목 조회(확정안): Items 데이터 소스를 `dataSources.query`로 한 번에 조회한다 (`{ property: "Invoices", relation: { contains: <견적서 ID> } }`, `page_size: 100`, `start_cursor`로 끝까지). Items 데이터 소스 ID는 Invoices 데이터 소스 스키마의 `항목` Relation 설정에서 읽어 모듈 메모리에 둔다. 결과는 견적서 `항목` Relation 순서로 다시 정렬한다. Relation이 25개를 넘으면(`has_more`) `pages.properties.retrieve`로 전체 ID를 이어 받는다. 항목이 0개면 쿼리를 생략한다
  - ✅ 날짜 규칙: `date.start`를 쓰고 시간이 있으면 `Asia/Seoul` 달력 날짜(`YYYY-MM-DD`)로 바꾼다. `end`는 무시
  - ✅ Task 002 리뷰 제안 반영: 견적서 404 화면의 탭 제목(`metadata`와 스트리밍 후 404용 React `<title>`), `noindex`는 Next.js가 자동 주입
  - ✅ (D6) 총 금액은 노션 `총 금액` Number를 그대로 사용, 항목 `금액`은 수식 결과가 number일 때만 값. (D11) 본문 블록은 조회하지 않음
  - ✅ 오류 분류: 잘못된 ID 형식·없는 페이지(`object_not_found`)·페이지가 아닌 ID(`validation_error`)·다른 DB의 페이지·보관/휴지통 페이지 → `null`(호출부에서 `notFound()`). 인증 오류·권한 부족·요청 제한(재시도 소진)·타임아웃·항목 쿼리 실패 → 코드와 HTTP 상태만 담은 오류로 throw (노션 메시지·응답 본문은 화면·로그에 남기지 않음)
  - ✅ 필수 속성 누락 규칙: 오류가 아니라 빈 값 (문자열은 `""`, 날짜·숫자·상태는 `null`). 상태는 알려진 옵션만 쓰고 그 외는 `null`(D4)
  - ✅ (D8) 요청 간 캐시 없음. 같은 요청 안의 중복 호출만 `React.cache`로 합침
  - ✅ 수락 기준: 실제 노션 견적서(INV-2026-001)로 도메인 객체의 번호·클라이언트명·날짜·상태·항목 3개(순서 포함)·총 금액이 노션 값과 일치, 오류 케이스가 의도대로 분류됨 (임시 Route Handler로 확인 후 삭제)
  - 테스트 결과 (페이지가 필요한 항목은 Task 009 체크리스트로 옮김):
    - ✅ 형식이 잘못된 ID(`/invoice/abc`, `/invoice/abc/def`) 접근 시 견적서 404 화면과 404 상태 코드 (개발·프로덕션 서버)
    - ✅ 형식은 맞지만 존재하지 않는 ID 접근 시 404 화면, 탭 제목, `noindex` 메타 태그 (상태 코드는 200, D12)
    - ✅ (D9) Integration에 공유된 다른 DB(Items)의 페이지 ID, Invoices DB·데이터 소스 자체 ID → `getInvoice`가 `null`
    - ✅ 빈 속성·속성 누락·시간 포함 날짜·알 수 없는 상태: 실제 페이지를 복제해 값을 비운 입력으로 매퍼 확인 (노션에 해당 견적서가 없어 실데이터 확인은 Task 009로)
    - ✅ 잘못된 API 키·권한 부족·요청 제한·타임아웃·항목 쿼리 실패: 모의 노션 오류 응답으로 `getInvoice`가 코드·상태만 담은 오류를 던지는지 확인 (에러 화면 확인은 Task 009로)

- **Task 009: 견적서 페이지 실데이터 연동 (F002)** ✅ - 완료 (노션 데이터가 필요한 일부 확인은 아래 미완료 항목으로 남김)
  - 크기: S / 의존: Task 004, 005, 008
  - 더미 데이터를 `getInvoice` 호출로 교체하고 `src/proxy.ts`의 `test-N` 예외, `page.tsx`의 `TEST_ID_PATTERN`, `src/app/api/generate-pdf/route.tsx`의 개발용 더미 폴백을 함께 제거
  - ✅ 더미 제거: `page.tsx`의 `getDummyInvoice`·`TEST_ID_PATTERN`, `src/proxy.ts`의 `test-N` 예외, `route.tsx`의 `NODE_ENV` 더미 폴백과 `dummyInvoices` import를 제거하고 `getInvoice`만 쓴다. `dummy-invoices.ts`는 사용처가 없어 삭제했다
  - ✅ 동적 `params`와 데이터 조회를 Suspense 경계 안에 두어 `cacheComponents` prerender 오류 방지 (`npm run build` 통과, 라우트는 ◐ 유지)
  - ✅ 탭 제목에 견적서 번호 표시: `generateMetadata`(`견적서 INV-2026-001 | Invoice Web`). `getInvoice`가 `React.cache`라 페이지와 중복 조회하지 않음(노션 요청 첫 조회 3회·이후 2회 그대로). 조회 실패 시 제목은 `견적서`로 두고 본문이 `error.tsx`로 처리. 빌드 오류·상태 코드 충돌 없음(없는 견적서는 D12대로 200 + `noindex`)
  - ✅ 수락 기준: `npm run build` 통과, 실제 견적서 URL에서 Phase 2와 같은 화면 표시
  - 테스트 체크리스트 (Playwright MCP):
    - ✅ 실제 견적서 URL 접근 시 로딩 skeleton 후 견적서 표시 (프로덕션 서버 셸에 skeleton과 로딩 문구 포함 확인)
    - ✅ 정상 견적서 ID(INV-2026-001)로 접근 시 노션 CSV 값과 화면 값(번호, 클라이언트명, 날짜, 상태, 항목 3개, 총 금액 ₩5,000,000) 일치. 하이픈 포함·대문자 ID도 같은 견적서. `/invoice/test-1`은 404
    - ✅ (D9) 다른 DB의 페이지 ID(Items 항목 페이지, DB·데이터 소스 ID) 접근 시 404 화면
    - 항목 0개 견적서, 필수 속성이 비어 있는 견적서, (가능하면) 항목 26개 이상 견적서의 실데이터 표시와 항목 순서 확인. 노션에 해당 견적서를 먼저 만들어야 함 (Task 008에서 이동)
    - ✅ 잘못된 API 키(프로세스 환경 변수로 덮어씀)로 실행 시 에러 화면과 `retry` 버튼 표시, 화면·HTML에 내부 오류 메시지 미노출 (프로덕션. 개발 서버의 HTML에는 Next.js가 오류 문자열을 싣는 것을 확인)
    - 노션에서 값 수정 후 재접속 시 D8 정책대로 반영되는지 확인 (미확인: 노션 데이터를 수정하지 않음. 캐시를 쓰지 않는 구조로만 확인)
    - ✅ 375px/768px/1280px 폭에서 가로 넘침 없음 (실데이터가 항목 3개의 짧은 값뿐이라 긴 항목명·큰 금액은 실데이터로 확인하지 못함)

- **Task 010: PDF 생성 API 실데이터 연동 (F003)** ✅ - 완료
  - 크기: M / 의존: Task 006, 008, Task 001(D1, D2)
  - 사전 확인: `01-getting-started/15-route-handlers.md`, `03-file-conventions/route.md`, `05-config/01-next-config-js/serverExternalPackages.md`
  - ✅ 폰트 번들 확인: `src/lib/pdf/fonts/`의 TTF 2종(약 6MB씩)을 `process.cwd()` 기준 경로로 읽으므로, `next.config.ts`의 `outputFileTracingIncludes`(키 `/api/generate-pdf`, 값 `src/lib/pdf/fonts/**`)로 포함을 보장했다. 빌드 결과 `.next/server/app/api/generate-pdf/route.js.nft.json`에 TTF 2종이 들어 있음을 확인했다 (설정 없이도 Turbopack이 추적해 포함하지만 명시해 둔다. Vercel 배포 환경 확인은 Task 013)
  - ✅ PDF 모듈: `src/lib/pdf/render-invoice-pdf.tsx`(`renderInvoicePdf(invoice): Promise<Buffer>`)와 `response-headers.ts`(파일명 정리, `Content-Disposition`·`Content-Type`·`Cache-Control: no-store` 헤더 순수 함수). `fonts.ts`·`invoice-document.tsx`·`render-invoice-pdf.tsx`에 `server-only` 가드 (클라이언트 import 시 빌드 실패 확인)
  - ✅ `src/app/api/generate-pdf/route.tsx` 생성 (Task 002에서 제외한 골격 포함). POST만 구현하고 Node 기본 런타임을 쓴다
  - ✅ D2에 따라 Route Handler는 견적서 ID만 입력으로 받아 zod로 형식을 검증하고(알 수 없는 키는 무시), 서버에서 `getInvoice`를 재사용. 더미 폴백은 Task 009에서 제거했다
  - ✅ PDF 요청 타입(`src/types/pdf.ts`)은 zod 스키마(`generatePdfRequestSchema`, `src/lib/invoice-schema.ts`)에서 파생(`z.input`, `import type`만 사용)해 스키마와 타입을 한 곳으로 맞춘다
  - ✅ 응답 헤더 생성 함수: `Content-Type: application/pdf`, 견적서 번호 기반 파일명의 `Content-Disposition` (한글 파일명 인코딩 처리). Route Handler에서 사용하는 연결은 통합 단계
  - ✅ 오류 응답: 잘못된 JSON·ID 형식 400, 존재하지 않는 견적서 404, 생성 실패 500 (본문은 일반 문장, 내부 메시지 미포함. 버튼은 토스트로 안내)
  - Node.js 런타임에서 동작 확인, PDF 생성 시간과 응답 크기 확인
    - ✅ 더미 5건·40항목 기준 임시 Route Handler(삭제함)로 프로덕션 빌드에서 확인: 생성 7~60ms(첫 호출 포함), 응답 12~23KB (폰트는 사용 글리프만 서브셋 포함). 노션 실데이터(INV-2026-001, 항목 3개) 기준: 프로덕션 서버에서 POST 약 0.6~1.0초(노션 조회 약 0.5초 포함), 응답 14.7KB
  - ✅ 수락 기준: 실제 견적서로 PDF 다운로드 성공, 화면과 PDF의 금액·항목 일치 (PDF를 이미지로 변환해 확인)
  - 테스트 체크리스트 (Playwright MCP):
    - ✅ 다운로드 버튼 클릭 시 다운로드 이벤트 발생, 파일명과 MIME 타입 확인 (더미 `test-1`·`2`·`4`·`5`, 개발 서버)
    - ✅ 생성 중 버튼 비활성화와 스피너 표시, 연속 클릭 시 요청 1회만 발생
    - ✅ 다운로드 후 같은 페이지 유지, 재다운로드 가능
    - ✅ 존재하지 않는 ID로 API 직접 호출 시 404 응답
    - ✅ (D2) 클라이언트가 임의 데이터를 보내도 PDF 내용이 바뀌지 않음 (`pdftotext` 비교)
    - ✅ API 실패를 강제했을 때 오류 토스트 표시 (Playwright 요청 가로채기)
    - ✅ 노션 실데이터 견적서로 위 항목을 다시 확인 (프로덕션 서버: 다운로드 이벤트, `INV-2026-001.pdf`, `application/pdf`, 생성 중 스피너·연속 클릭 시 요청 1회, 같은 페이지 유지·재다운로드, 없는 ID 404, 임의 필드를 보내도 PDF 텍스트 동일)

- **Task 011: 견적서 URL 생성 지원 (F010)** ✅ - 완료
  - 크기: S / 의존: Task 009, Task 001(D5)
  - ✅ D5가 노션 쪽 생성이면: 노션 수식 속성 설정 방법(사이트 URL + 페이지 ID)을 `docs/notion-setup.md`에 문서화하고, 앱이 하이픈 포함·미포함·대문자 ID와 끝의 `/`·쿼리가 붙은 URL을 같은 견적서로 여는지 확인했다 (개발·프로덕션 모두 200, 같은 화면·같은 탭 제목)
  - D5가 앱 기능이면: 확정된 범위로 별도 작업 명세를 만든 뒤 진행 (PRD에 화면 정의 없음)
  - ✅ 노션 Invoices DB에 `견적서 URL` 수식 속성을 추가했다(`"http://localhost:3000/invoice/" + id()`). `id()`는 하이픈 없는 32자리를 돌려준다. `NEXT_PUBLIC_SITE_URL`(기본 `http://localhost:3000`)과 수식의 사이트 URL이 같음을 확인했고, 배포 도메인이 정해지면 수식과 환경 변수를 함께 바꾼다(Task 013)
  - ✅ 수락 기준: 노션에서 얻은 URL을 그대로 클릭하면 해당 견적서가 열림
  - 테스트 체크리스트 (Playwright MCP):
    - ✅ 노션 수식이 만든 URL(`http://localhost:3000/invoice/4044512d22df80c899b5ffca83602b91`)로 이동 시 정상 표시 (탭 제목 `견적서 INV-2026-001`, 항목 3개)
    - ✅ 같은 견적서의 하이픈 포함·미포함 ID URL 모두 같은 견적서 표시 (D5·Task 003 결정 기준)

### Phase 4: 최적화 및 배포 ✅

- **Task 012: 성능·접근성 점검 및 개선** ✅ - 완료
  - 크기: S / 의존: Task 009~011
  - ✅ 012-1 노션 요청 수·중복 조회 점검 (2026-10-25, 프로덕션 빌드 서버에서 `NODE_OPTIONS --require`로 `fetch`를 감싸 `api.notion.com` 호출을 셌다. 프로젝트 소스는 수정하지 않았고 계측 스크립트는 scratchpad에만 있다)
    - 실측(견적서 INV-2026-001, 항목 3개): 페이지 첫 접속 3회(`pages.retrieve`, Invoices 데이터 소스 스키마, Items 쿼리), 같은 서버의 두 번째 접속 2회(스키마의 Items 데이터 소스 ID를 모듈 메모리에서 재사용). 노션 호출 하나당 약 0.2~0.5초, 페이지 응답 0.6~1.0초
    - 페이지 본문과 `generateMetadata`는 `React.cache`로 합쳐져 추가 호출이 없다(첫 접속 3회에 메타데이터 호출이 포함됨)
    - PDF API(`POST /api/generate-pdf`)는 D2에 따라 페이지와 별도로 재조회한다: 호출당 2회(`pages.retrieve` + Items 쿼리). 페이지 접속 뒤 PDF를 받으면 노션을 총 2회 더 부른다. 이는 의도한 동작이다(클라이언트 값을 신뢰하지 않음)
    - 참고: 스키마(Items 데이터 소스 ID) 메모리는 라우트 번들마다 따로 만들어져, 서버 기동 뒤 PDF API의 첫 호출은 페이지와 별개로 3회다(이후 2회). 서버리스에서는 인스턴스가 새로 뜰 때마다 같다
    - 결론: 불필요한 중복 조회는 없어 `getInvoice`를 수정하지 않았다. 항목이 있는 견적서 1건을 보고 PDF를 받는 흐름의 노션 요청은 3~6회로, 노션 제한(평균 초당 3회)에 여유가 있다
    - D8 재검토 제안(구현하지 않음): 현재 규모(견적서 1건 = 2~3회)에서는 캐시가 필요하지 않다. 같은 링크가 짧은 시간에 반복 열리는 경우를 줄이려면 `getInvoice`에 `use cache` + `cacheLife({ revalidate: 30 })` 같은 짧은 캐시를 둘 수 있지만, 노션 수정이 최대 그 시간만큼 늦게 보이고 PDF API(D2, 최신 금액 보장)는 캐시를 쓰지 않게 분리해야 한다. 노션 429가 실제로 관찰되거나 트래픽이 늘면 사용자가 결정한다 → 사용자 요청으로 012-4에서 60초 캐시를 적용했다(D8 수정)
  - ✅ 012-2 PDF API 보호와 성능 기록 (2026-10-25)
    - 결정: 인메모리 호출 빈도 제한을 추가했다(`src/lib/pdf/rate-limit.ts`, 고정 윈도우). 이유: API가 인증 없는 공개 엔드포인트이고 호출 1번이 노션 2~3회 요청과 PDF 렌더링 CPU를 쓴다. 반복 호출이 노션 제한(평균 초당 3회)을 소진하면 견적서 조회까지 실패한다
    - 규칙: 클라이언트 IP(`x-forwarded-for` 첫 값 → `x-real-ip` → 없으면 `unknown` 공용 버킷)당 60초에 10회(`x-forwarded-for`는 Vercel이 직접 설정하는 값이라 신뢰한다. 다른 호스팅으로 옮기면 신뢰할 프록시 기준으로 `getClientKey`를 바꿔야 하고, 그렇지 않으면 클라이언트가 헤더를 위조해 제한을 피할 수 있다). 초과 시 `429` + `Retry-After`(남은 초) + `GeneratePdfErrorResponse` 일반 문장. 본문 읽기·노션 조회 전에 검사한다. 정상 사용(생성 중 재클릭은 버튼이 막음)으로는 닿기 어려운 값이다
    - 한계: 외부 저장소를 쓰지 않아 서버리스 인스턴스끼리 카운터를 공유하지 않는다(인스턴스가 여럿이면 실제 허용량은 인스턴스 수 × 10회, 콜드 스타트 때 초기화). 분산 공격을 막는 장치가 아니라 단일 클라이언트의 반복 호출을 줄이는 최소 방어다. 더 필요하면 Vercel Firewall 속도 제한이나 외부 저장소(Upstash 등)를 사용자 결정으로 검토한다. IP 헤더가 없는 환경(로컬)은 모두 한 버킷이다
    - proxy `matcher`는 넓히지 않았다(Route Handler 안에서 검사). 그래서 `/invoice/:path*`의 ID 검사에 영향이 없다
    - 버튼: 429를 받으면 "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." 토스트를 보여 준다(그 밖의 실패는 기존 문구)
    - 확인(프로덕션 서버): 연속 11회 호출에서 1~10번째 200, 11번째 429(`retry-after: 54`, 본문 일반 문장, `cache-control: no-store`). 제한 상태에서 다운로드 버튼 클릭 시 토스트 표시와 콘솔의 429 리소스 로그만 확인, 페이지 표시는 유지
    - 측정(INV-2026-001, 항목 3개, 프로덕션 서버, 로컬→노션): PDF API 응답 0.5~1.0초(첫 호출 약 1.0초, 이후 0.5~0.65초), 응답 14,671B. 노션 호출 합계(2~3회)가 0.5~0.85초이므로 PDF 렌더링은 약 20~150ms(첫 호출에 폰트 파일 읽기 포함). 더미 40항목은 Task 010에서 7~60ms
    - 폰트: `src/lib/pdf/fonts/` TTF 2종 6,222,712B + 6,224,868B = 12,447,580B(약 12.4MB). PDF에는 사용한 글리프만 서브셋으로 들어가 결과 파일은 수십 KB다. 서버리스 함수 번들 용량(250MB 비압축 한도 등)에는 여유가 있으나 Vercel 배포 시 함수 크기는 Task 013에서 확인한다
    - 노션 재시도 포함 최악 응답 시간(코드 분석, 실측 아님): 요청 1회 타임아웃 10초. 타임아웃은 SDK가 재시도하지 않고, 429·529는 모든 메서드에서, 500·503은 GET에서만 최대 2회 재시도하며 재시도 대기는 최대 5초다. 한 호출이 `429` 응답 두 번(대기 각 5초) 뒤 타임아웃되면 약 20초이고, 호출은 순차(페이지 → 스키마 → 항목 쿼리)이므로 PDF API·견적서 페이지 모두 최악 약 40초(스키마 호출이 있는 첫 조회는 약 60초), 항목 100개 초과 시 페이지당 추가. 통상은 1초 안팎이다. 배포 함수 최대 실행 시간 확인은 Task 013에서 한다
  - ✅ 012-3 접근성 점검 및 개선 (2026-10-25, 프로덕션 빌드 서버 + Playwright MCP, 실측)
    - 점검 결과: 표 머리글 `th`에 `scope`가 없었음(암묵적 `columnheader` 역할은 있음) → 수정 / 버튼 레이블 이상 없음(`PDF 다운로드`, `다시 시도`, `테마 변경`, 생성 중 `aria-busy`, 아이콘 `aria-hidden`) / 색 대비는 라이트에서 `총 금액` 레이블(`text-muted-foreground` on `bg-muted`)만 4.35:1로 기준(4.5:1) 미달 → 수정, 나머지 최저 4.74:1 / 다크 최저 7.66:1 / 키보드: 견적서 화면의 탭 정지점은 다운로드 버튼 1개(다음 Tab은 페이지 밖), 포커스 표시(`focus-visible` 링)는 나타남 / 에러 화면은 `다시 시도`로 포커스가 가고 Enter로 재시도(노션 재조회, 잘못된 키라 같은 에러 화면 유지), 화면·HTML에 내부 오류 문자열 없음
    - 수정: `invoice-items-table.tsx`의 `TableHead` 4개에 `scope="col"`, `invoice-summary.tsx`의 `총 금액` 레이블을 본문색(`text-foreground` 기본값)으로 변경(대비 14.5:1 이상). `components/ui`와 토큰은 수정하지 않음
    - 다크 모드: 견적서 화면에는 테마 토글이 없어(D10) 안내 페이지(`/invoice/guide`) 헤더에서 토글을 클릭해 다크로 바꾼 뒤 견적서 화면으로 이동해 확인(`next-themes`가 저장한 값 사용, 확인 뒤 저장값 삭제)
    - 미수정 제안: ① `--ring`(라이트 `oklch(0.708 0 0)`)의 포커스 링은 흰 배경 대비 약 2.8:1로 비텍스트 대비 3:1(WCAG 1.4.11)에 약간 못 미침. 전역 토큰이라 영향 범위가 커서 사용자 결정으로 남김 ② 에러 화면에서 `다시 시도` 후 컴포넌트가 다시 마운트되어 포커스가 `body`로 돌아감(키보드 사용자는 다시 Tab 필요)
  - ✅ 012-4 노션 조회 60초 캐싱 (2026-10-25, D8 수정)
    - 구현: `getCachedInvoice(pageId)`(`src/lib/notion/invoices.ts`)가 ID를 캐시 밖에서 zod로 정규화한 뒤 `'use cache'` 함수 `readInvoiceWithCache(정규화된 ID)`를 부르고, 안에서 기존 `getInvoice`를 재사용한다(조회 로직 중복 없음). 바깥은 `React.cache`라 페이지 본문과 `generateMetadata`의 같은 요청 내 중복 호출도 합친다. 페이지·`generateMetadata`만 이 함수를 쓰고 PDF API(`route.tsx`)는 D2에 따라 캐시 없는 `getInvoice`를 그대로 쓴다
    - 문서 확인 결과: (a) 인자는 직렬화 가능한 값이면 되고 캐시 키가 `빌드 ID + 함수 ID + 인자`라 정규화된 ID 문자열 하나만 넘긴다(하이픈·대문자만 다른 URL이 같은 항목을 쓴다). (b) `use cache` 안의 throw는 캐시에 저장되지 않는다(실측: 잘못된 키로 3번 접속하면 노션을 3번 호출, 에러 화면 유지). (c) 반환값 `null`은 값이라 같은 시간 동안 저장된다(실측: 없는 ID 2번째 접속에서 노션 호출 0회, 404 화면). (d) 동적 `params` 접근과 조회는 그대로 `<Suspense>` 안이라 빌드에서 `/invoice/[notionPageId]` ◐ 유지, prerender 오류 없음. (e) `cacheLife`의 `revalidate`는 그 시간이 지난 뒤 첫 요청에 오래된 값을 주고 뒤에서 갱신하며, `expire` 기본값은 "만료 없음"이다. 그래서 `expire`를 `revalidate`(60)보다 큰 최소값 61로 두어 61초 뒤부터는 새로 조회해 기다리게 했다
    - 프로필: `{ stale: 30, revalidate: 60, expire: 61 }`(`INVOICE_CACHE_LIFE`). `stale`은 브라우저 라우터 캐시 시간으로 기본 5분이 클라이언트 이동에서 값을 더 묵히므로 Next.js 최소값 30초로 줄였다. `expire`가 5분 미만이라 이 캐시는 정적 셸이 아니라 요청 시점에 채워지는 영역이다(원래 동적 `params`라 정적 셸에 들어갈 수 없었음)
    - 캐시 내용: 도메인 객체(`Invoice`) 또는 `null`뿐이다. API 키·노션 응답 원본은 들어가지 않는다
    - 실측(프로덕션 서버, `NODE_OPTIONS --require`로 `fetch`를 감싼 scratchpad 스크립트, 프로젝트 소스 수정 없음, 노션 데이터 수정 없음): 서버 기동 후 첫 접속 노션 3회 → 이어진 재접속 0회(하이픈 포함·대문자 ID 포함 3번 모두 0회, 응답 약 10ms) → PDF API 첫 호출 3회·두 번째 2회(캐시 미사용 확인) → 62초 뒤 재접속 2회(동기 재조회, 응답 0.59초) → 곧바로 재접속 0회. 없는 ID: 첫 접속 1회, 재접속 0회
    - 영향: 노션 수정은 화면에 최대 60초 늦게 반영된다. PDF는 항상 최신이라 수정 직후 최대 60초 동안 화면과 PDF가 다를 수 있다. PRD의 "실시간 조회"는 "요청 시점에 노션에서 읽는다"로 해석하고 허용 지연을 60초로 했다(D8). 안내는 `docs/notion-setup.md` 4절
    - 한계: 기본 인메모리 캐시라 Vercel 서버리스에서는 인스턴스마다 캐시가 따로이고 요청 간 재사용이 보장되지 않는다(문서 "Runtime caching considerations"). 이 경우에도 반영 지연은 60초를 넘지 않고 호출 수 절감만 줄어든다. 재사용을 보장하려면 `use cache: remote`(플랫폼 캐시 핸들러, 비용·지연 있음)를 사용자 결정으로 검토한다. 이 점은 Task 013 배포 환경에서 실측한다
    - 아직 못 한 확인: 노션 값을 실제로 수정해 반영 지연을 보는 것(사용자 데이터라 수정하지 않았고 호출 수 측정으로 대체)
  - ✅ 012-5 서버 로깅 (2026-10-25)
    - `src/lib/logger.ts`(`server-only`, 외부 의존 없음): `logger.info/warn/error(event, fields)`가 `{...fields, level, event}`를 JSON 한 줄로 `console.info/warn/error`에 출력한다. `fields` 값은 `string | number | boolean | undefined`만 받는다(객체·에러 인스턴스는 타입 오류, `undefined`는 출력에서 빠짐). 시각은 넣지 않는다(로그 수집 쪽이 찍음). `describeError(error)`는 에러에서 이름·문자열/숫자 `code`·숫자 `status`만 뽑는다(메시지·스택 제외)
    - 교체한 서버 로그: `notion.invoice_fetch_failed {code, status}`(노션 조회 실패, `invoices.ts`), `notion.database_id_looks_like_data_source_id {hint}`(설정 오류 안내), `notion.sdk_log {sdkLevel, code, attempt, requestId}`(SDK 재시도·경고, `client.ts`. SDK 메시지 문자열은 버림), `pdf.generate_failed {errorName, errorCode, errorStatus}`(`route.tsx`), `pdf.rate_limited {retryAfterSeconds}`(429, 클라이언트 IP 제외)
    - 그대로 둔 것: 클라이언트 컴포넌트의 `console.error`(`src/app/error.tsx`, 견적서 `error.tsx`, `download-pdf-button.tsx`)와 Next.js가 `error.tsx` 렌더 때 서버 로그에 남기는 오류+digest 출력
    - 확인(프로덕션 서버, 잘못된 API 키를 프로세스 환경 변수로 덮어씀, 429까지 유발): 위 이벤트가 JSON 한 줄로 찍히고, 서버 로그 전체에서 API 키 문자열·테스트용 `x-forwarded-for` IP 검색 0건. 클라이언트 컴포넌트(`download-pdf-button.tsx`)에 임시로 `logger`를 import하면 `server-only` 때문에 `next build`가 실패함을 확인하고 원복했다
    - 참고(범위 밖, 변경 없음): Next.js 자체 오류 출력(`⨯ Error [NotionRequestError] ...`)에는 우리 오류 메시지(코드·상태만)와 digest가 남는다
  - ✅ 012-6 Rate limiting 점검과 보강 (2026-10-25)
    - 점검: 012-2의 고정 윈도우 방식(IP당 60초 10회, 429 + `Retry-After`)은 유지한다. 임계값은 정상 사용(버튼 클릭, 생성 중 재클릭 차단)에 닿지 않고 PDF 1건당 노션 2~3회 호출을 고려하면 IP당 분당 최대 약 30회 이내로 노션 제한(평균 초당 3회)을 혼자 소진하지 못하는 값이라 바꾸지 않았다. 헤더는 `Retry-After`(초, 올림, 최소 1)와 `Cache-Control: no-store`로 충분해 `RateLimit-*` 헤더는 더하지 않았다
    - 문제 발견·수정: 만료 항목 정리가 "버킷 500개 이상일 때만" 실행돼, 그보다 적게 쌓인 만료 항목은 남았고 정리 시점에 모든 항목이 유효하면(헤더를 바꿔 IP를 계속 바꿔 보내는 경우 등) 상한이 없었다. 이제 윈도우(60초)마다 한 번, 또는 버킷이 상한 5,000개에 닿으면 즉시 만료 항목을 지우고, 그래도 상한이면 먼저 들어온 버킷부터 지운다(`sweepBuckets`)
    - 429 로그 연결: `pdf.rate_limited`(012-5 logger, IP 없음)
    - 확인(프로덕션 서버, 노션을 부르지 못하는 잘못된 키 환경): 같은 IP로 연속 11회 호출에서 1~10번째는 처리(키가 잘못돼 500), 11번째 429, 서버 로그에 `pdf.rate_limited {retryAfterSeconds:54}` 1줄. 정상 키 환경의 200 → 429 흐름은 012-2에서 확인했다. 정리 로직(`sweepBuckets`)은 단위 테스트 러너가 없어 코드 검토로만 확인했고, 5,000개 상한 동작은 실행해 보지 않았다
    - 한계와 대안(기록): 인메모리라 서버리스 인스턴스끼리 카운터를 공유하지 않고 콜드 스타트 때 초기화되어 실제 허용량은 인스턴스 수 × 10회다. 대안은 Vercel Firewall(WAF)의 속도 제한 규칙(대시보드 설정, 인스턴스 공유, 코드 변경 없음, 요금제별 제공 범위 확인 필요)이며 외부 저장소(Upstash 등)는 MVP에서 도입하지 않는다. 배포 후 필요하면 Task 013에서 Firewall 규칙(`/api/generate-pdf` POST)을 사용자 결정으로 설정한다
    - 견적서 조회 페이지에는 별도 제한을 두지 않는다: 60초 캐시(012-4)로 같은 견적서를 반복해 열어도 캐시 적중 시 노션을 부르지 않고, 인스턴스마다 캐시가 따로여도 호출은 인스턴스·견적서당 분당 약 1회로 줄어든다. 견적서 ID는 추측할 수 없는 32자리 값이며 존재하지 않는 ID도 `null`이 캐시된다. 형식이 틀린 ID는 `proxy.ts`가 노션을 부르기 전에 거른다. 응답이 빠르고 인증 없는 공개 페이지라 제한이 오히려 정상 접속을 막을 위험이 더 크다
  - ✅ 012-7 웹폰트 최적화 (2026-10-25, 프로덕션 빌드 서버 + Playwright, 새 브라우저 컨텍스트로 캐시 없이 실측)
    - Geist_Mono 정리: 제거하지 않았다. `font-mono`를 견적서 번호(`invoice-header.tsx`)와 안내 페이지 코드 블록(`guide/page.tsx`)이 쓴다(라틴 글자 전용)
    - 결정: 한글 글리프용으로 Noto Sans KR(`next/font/google`)을 도입했다. `--font-sans`는 `var(--font-geist-sans), var(--font-noto-sans-kr)`로 라틴은 Geist, 한글만 Noto Sans KR이 맡는다. 가변 폰트 하나(굵기 100~900)로 쓰는 굵기(medium·semibold·bold)를 모두 처리하고 `display: "swap"`, `preload: false`(라틴은 Geist가 맡아 미리 받을 이유가 없음). 한글 조각(unicode-range, 약 120개)은 화면에 쓰인 글자가 속한 것만 내려받는다. 라이선스는 SIL OFL 1.1이며 폰트 파일을 저장소에 두지 않고 빌드 때 Google Fonts에서 받아 자체 호스팅한다(브라우저는 Google에 요청하지 않음)
    - 비교(견적서 INV-2026-001 화면, 1280px, 캐시 없음):

      | 안 | 폰트 요청 | 폰트 전송량 | CSS 전송량 | 저장소 변경 | 비고 |
      | --- | --- | --- | --- | --- | --- |
      | 현재(한글은 시스템 폰트) | 3개 | 68.9KB | 12.3KB | - | OS마다 한글 모양이 다름 |
      | Noto Sans KR (선택) | 10개 | 179.1KB (+110KB) | 38.6KB (+26KB) | 2파일 수정 | 한글 조각 7개(조각당 약 14~16KB) |
      | Pretendard 가변 동적 서브셋 self-host | 10개 | 250.2KB (+181KB) | 26.4KB (+14KB) | `public/`에 woff2 92개 3.0MB + CSS + 라이선스 | 조각당 약 21~38KB, 파일 관리 부담 |

      안내 페이지(`/invoice/guide`): 현재 2개 52.4KB → Noto 10개 178.9KB. 모두 첫 방문 기준이며 이후는 브라우저 캐시(해시 파일명, immutable)를 쓴다
    - 선택 이유: 같은 한글 화면에서 Noto가 Pretendard보다 전송량이 약 40% 적고, `next/font`가 자체 호스팅·`size-adjust` 대체 폰트를 처리하며 저장소에 파일을 늘리지 않는다. 추가 비용(약 136KB, 7요청)이 수백 KB에 못 미치고 OS별 한글 글꼴 차이를 없애 견적서의 일관성이 올라 도입했다. 비용이 아깝다면 되돌려도 기능에는 영향이 없다
    - 확인: 한글이 Noto Sans KR로 렌더링됨(라이트·다크 스크린샷 확인, `document.fonts`에서 Noto 조각 loaded 8~9개). CLS: 견적서 0, 안내 페이지 0.0003(기준 0.1 이하). 지연 네트워크(지연 300ms, 200KB/s)에서도 견적서 CLS 0. 한계: 외부 요청이 `next build`에 필요하다(오프라인 빌드 불가, Vercel은 문제 없음). CSS는 `@font-face` 약 120개로 +26KB(압축 후)
    - 되돌리는 방법: `src/app/layout.tsx`에서 `Noto_Sans_KR` import·`notoSansKr` 선언·`html`의 `${notoSansKr.variable}`을 지우고, `src/app/globals.css`의 `--font-sans`를 `var(--font-geist-sans);`로 되돌린다(커밋한 뒤에는 `git revert`나 직접 편집으로 되돌린다). 참고: Turbopack 캐시 때문에 `globals.css`만 바꾼 빌드는 이전 CSS를 낼 수 있어 `rm -rf .next` 후 빌드해야 한다
  - ✅ 012-8 Suspense 경계 분리 검토와 영역별 스켈레톤 (2026-10-25, 프로덕션 서버)
    - 실측(`NODE_OPTIONS --require`로 `fetch` 시작·완료 시각 기록, 소스 수정 없음, 캐시 미적중 요청): 서버 기동 뒤 첫 접속은 `pages.retrieve` 완료 +0.35~0.42초, 스키마 +0.60~0.70초, 항목 쿼리 +0.91~1.02초(3회 모두 비슷). 스키마가 메모리에 있는 이후 미적중은 `pages.retrieve` +0.39~0.44초, 항목 쿼리 +0.68~0.74초. 캐시 적중(60초 안, D8)은 약 10ms. 스켈레톤을 담은 정적 셸은 첫 바이트(TTFB 약 5~45ms)에 바로 온다
    - 결정: 구조를 유지하고 헤더·항목을 별도 Suspense로 나누지 않았다. 이유: (1) 나누면 헤더가 항목보다 먼저 보이는 이득은 캐시 미적중일 때 약 0.3초(첫 접속 약 0.6초)뿐이고 적중 시에는 차이가 없다. (2) 나누려면 `getInvoice`를 메타·항목 단계로 쪼개고 `getCachedInvoice`도 두 캐시 함수(항목 쪽 키에 relation ID 목록)로 늘려야 해 캐시·D9·D12·PDF API 공유 경로가 복잡해지며 얻는 것은 0.3초다. (3) 항목 조회가 헤더 표시 뒤에 실패하면 `error.tsx`가 화면 전체를 바꿔 이미 보인 헤더가 사라지는 어색한 동작이 생긴다. (4) 화면이 두 단계로 바뀌어 레이아웃이 두 번 움직인다. 노션 요청 수와 404·에러 동작은 바뀌지 않는다
    - 구현(스켈레톤만 정리): `invoice-skeleton.tsx`를 영역 컴포넌트 `InvoiceHeaderSkeleton`·`InvoiceClientSkeleton`·`InvoiceItemsSkeleton`·`InvoiceSummarySkeleton`으로 나누고 `InvoiceSkeleton`이 `InvoiceView`와 같은 순서·간격으로 조합한다. `loading.tsx`와 페이지 Suspense fallback은 계속 `InvoiceSkeleton` 하나를 쓴다. 나중에 영역별 Suspense로 나눌 때 영역 컴포넌트를 fallback으로 바로 쓸 수 있다
    - CLS 방지(높이 일치): 로딩 직전 골격과 실제 화면의 높이를 비교해 어긋난 곳을 고쳤다(헤더 줄 높이 20px·발행자 이메일 줄 추가, 클라이언트 `space-y-1`·`h-7`, `견적 항목` 제목 `h-7`, 모바일 카드 제목 24px·줄 20px, 총 금액 모바일 `h-15`·`sm:h-16`). 수정 전 1280px은 골격 612px 대 실제 649px이었다. 수정 후 골격 대 실제 높이는 1280px·768px 648 대 649px(표 안쪽 1px 차이), 375px 1116 대 1116px로 맞는다. 측정 중 CLS 0
    - 확인: 스트리밍 순서(골격이 먼저 나오고 약 0.9초 뒤 `article`로 교체), 형식 오류 ID `abc`·`test-1` HTTP 404, 없는 ID(`000…0`) 404 화면 + 200 + `noindex`, 잘못된 API 키로 에러 화면과 `다시 시도`(재시도 후에도 같은 화면, 화면·HTML에 키·내부 오류 문자열 없음. `unauthorized`는 Next.js 내부 필드명), 375px 가로 넘침 없음, 노션 요청 수(첫 접속 3회, 재접속 0회) 불변, 빌드 `/invoice/[notionPageId]` ◐ 유지·`/api/generate-pdf` ƒ
  - ✅ 통합 회귀 테스트(배포 전) (2026-10-25, 프로덕션 빌드 서버 + Playwright): 실제 견적서 값·탭 제목·URL 변형 5종 동일 표시, PDF 다운로드(파일명·MIME·스피너·연속 클릭 1회·화면과 PDF 내용 일치), 404 3종·안내 `/`→307, 에러 화면·`다시 시도`(잘못된 키), 429(11번째)와 서버 로그 키·IP 없음, 캐시(재접속 0회, PDF 호출당 2회), 375/768/1280px 가로 넘침 없음(라이트·다크), 콘솔 에러 없음(HTTP 404 문서의 `Failed to load resource` 로그만 있음) 모두 통과. 참고: 없는 ID의 탭 제목이 페이지 이동 직후 읽으면 드물게 `견적서`로 보이는 경우가 있었으나(404용 React `<title>` 반영 전 시점) 렌더링이 끝난 뒤에는 6회 모두 `견적서를 찾을 수 없습니다`였다
  - ✅ 수락 기준: 점검 결과와 개선 내역 기록, `npm run build` 통과(`/invoice/[notionPageId]` ◐ 유지, `/api/generate-pdf` ƒ). 012-4~6 후에도 동일

- **Task 013: Vercel 배포 및 운영 환경 검증** ✅ - 완료
  - 크기: S / 의존: Task 009~011
  - 사전 확인: `01-getting-started/17-deploying.md`
  - Vercel 프로젝트 환경 변수 설정: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_SITE_URL` (D9에 따른 추가 변수 포함)
  - PDF Route Handler의 함수 실행 시간·용량 제한 확인
  - 배포 URL 대상 Playwright MCP 스모크 테스트(간단히 4가지): 노션 수식 URL로 견적서 조회, PDF 다운로드, 없는 ID 404 화면, 형식 오류 ID의 HTTP 404. 전 시나리오 회귀·반응형·다크 모드는 로컬 통합 테스트에서 끝냈으므로 배포 환경에서 반복하지 않는다
  - 배포 도메인이 정해지면 `NEXT_PUBLIC_SITE_URL`과 노션 `견적서 URL` 수식 도메인을 같은 값으로 바꾸고 재배포
  - 배포 전 `code-reviewer` 서브에이전트로 Phase 4 코드 변경사항(Task 012, 배포 설정) 리뷰, 지적 사항 반영 또는 보고
    - ✅ 013-1 리뷰 결과(2026-10-25): 심각도 높음 없음, 승인. 반영: 없는 견적서의 탭 제목이 `견적서`로 잠깐 보이던 현상은 `generateMetadata`의 null 제목을 404 화면과 같은 `INVOICE_NOT_FOUND_TITLE`(`src/config/site.ts`)로 맞춰 해결, `x-forwarded-for` 신뢰 전제(Vercel 전용)를 012-2 기록에 명시, 폰트 되돌리기 안내의 `git checkout` 문구 수정. 보고만 한 것: 429 로그에 IP가 없어 차단 대상을 알 수 없음(개인정보를 위해 유지), `sweepBuckets` 상한 도달 시 요청마다 순회(비용 미미), 영역별 스켈레톤 4종의 불필요한 export(정리는 선택). 로컬 `typecheck`·`lint` 통과, `build` 통과(◐ 유지), `format:check`는 기존 파일 6건 경고만 남음
    - 배포 체크리스트(013-2 전): 환경 변수 3개 `NOTION_API_KEY`·`NOTION_DATABASE_ID`·`NEXT_PUBLIC_SITE_URL`(키 값은 Vercel 화면에 직접 입력), `NEXT_PUBLIC_SITE_URL`과 노션 `견적서 URL` 수식의 도메인을 같은 값으로, 빌드가 Google Fonts(Noto Sans KR)에 접속해야 함, 배포 후 확인할 것: 함수 크기(폰트 TTF 약 12.4MB 포함 여부)·PDF 함수 실행 시간 한도(최악 약 40~60초이므로 플랜별 한도 확인)·인메모리 `use cache` 재사용 여부·`x-forwarded-for` 동작·로그에서 `pdf.rate_limited` 확인
  - 수락 기준: 배포 환경에서 MVP 성공 기준 5개 항목 충족
  - ✅ 배포 결과(2026-10-25, `https://invoice-web-ashy.vercel.app`, Git 연동): 스모크 테스트 4가지를 `curl`로 확인했다. 실제 견적서(INV-2026-001) 200·탭 제목 `견적서 INV-2026-001 | Invoice Web`·응답 약 2.1초(콜드), 없는 ID는 404 화면 + 200 + `noindex`, 형식 오류 ID(`/invoice/abc`)는 HTTP 404, `/`는 `/invoice/guide`로 307. PDF API는 200·`application/pdf`·`INV-2026-001.pdf`·14,807B·약 2.7초이며 한글 폰트 TTF가 서버리스 함수에 포함돼 정상 렌더링됨(폰트 누락이면 500)
  - ✅ 노션 `견적서 URL` 수식의 도메인을 `https://invoice-web-ashy.vercel.app/invoice/` + `id()`로 변경했다(데이터 소스 속성 갱신 API 응답 정상, 수식 출력 값은 다시 읽어 확인하지 않음. 같은 `id()` 식은 Task 011에서 확인)
  - 미확인(운영하면서 필요하면 확인): Vercel 대시보드의 함수 크기·실행 시간 한도(PDF는 2.7초에 응답), 인메모리 `use cache`의 인스턴스 간 재사용, 로그의 `pdf.rate_limited` 이벤트. `NEXT_PUBLIC_SITE_URL`은 메타데이터 기준 도메인으로만 쓰이므로 Vercel 환경 변수에 배포 주소를 넣고 싶다면 사용자가 직접 설정한다

> Task 014(프로젝트 문서 갱신)는 범위에서 제외했다(2026-10-25 사용자 결정). `docs/architecture.md`·`CLAUDE.md`는 Phase 3 시점에 갱신했고, Phase 4에서 생긴 `logger.ts`·`getCachedInvoice`·`rate-limit.ts`와 README 보강은 필요할 때 따로 한다.

## 기능 ID ↔ Task 매핑

| 기능 ID | 기능명 | 관련 Task |
| --- | --- | --- |
| F001 | 노션 데이터베이스 연동 | 007, 008, 012 |
| F002 | 견적서 조회 | 002, 004, 009 |
| F003 | PDF 다운로드 | 006, 010 |
| F010 | 견적서 URL 생성 | 003(ID 형식), 011 |
| F011 | 견적서 유효성 검증 | 003(ID 검증), 005, 008 |
| F012 | 반응형 레이아웃 | 004, 005 |

## 진행 순서 요약

```
001 결정 확정 ✅ (환경설정 완료)
 ├─ 002 라우트·loading·error·404 골격 ✅
 └─ 003 타입·상수·더미 ✅
        ├─ [UI]   004 화면 · 005 상태 화면 · 006 PDF 레이아웃 ✅
        └─ [로직] 007 노션 환경 ✅ ─ 008 조회 로직 ✅
                                     └─ 009 페이지 연동 ✅ · 010 PDF API ✅ · 011 URL
                                                              └─ 012 최적화 ✅ · 013 배포
```
