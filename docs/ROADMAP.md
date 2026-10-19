# Invoice Web 개발 로드맵

노션에서 작성한 견적서를 고유 링크 하나로 웹에서 확인하고 PDF로 저장하게 하는 MVP를 완성합니다.

## 개요

Invoice Web은 견적서를 발행하는 프리랜서·소규모 기업과 견적서를 받는 클라이언트를 위한 서비스입니다. 별도 관리자 화면 없이 노션 데이터베이스를 데이터 원천으로 쓰며, 다음 기능을 제공합니다.

- **노션 데이터베이스 연동 (F001)**: Notion API로 견적서와 견적 항목 데이터를 서버에서 조회
- **견적서 조회 (F002)**: `/invoice/[notionPageId]` 고유 URL로 견적서 내용 표시
- **PDF 다운로드 (F003)**: 버튼 클릭 시 견적서를 PDF로 생성해 다운로드
- **견적서 URL 생성 (F010)**: 노션 페이지 ID 기반 고유 URL 제공
- **견적서 유효성 검증 (F011)**: 존재하지 않거나 잘못된 견적서 접근 시 404 안내
- **반응형 레이아웃 (F012)**: 모바일·태블릿·데스크톱 대응

기준 문서: `docs/PRD.md` (v1.0 MVP), `docs/architecture.md`, `CLAUDE.md`

## 현재 상태 (로드맵 작성 시점)

이미 구현되어 있으므로 이 로드맵에서 다시 계획하지 않는 항목입니다.

- Next.js 16.4 / React 19.3 / TypeScript 5 / Tailwind v4 / shadcn(Base UI, `base-nova`) 기반 프로젝트 구성
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`
- 루트 레이아웃(`src/app/layout.tsx`): ThemeProvider(next-themes, 다크 모드), TooltipProvider, Toaster(sonner)
- `(marketing)` 레이아웃: `SiteHeader`(테마 토글 포함) + `SiteFooter`, 서비스 안내 홈(`/`)
- 전역 `loading.tsx`, `error.tsx`(`retry` prop), `global-error.tsx`, `not-found.tsx`
- 공통 컴포넌트: `Container`, `Logo`, `PageHeader`, `ThemeToggle`
- shadcn ui: alert, badge, button, card, dropdown-menu, empty, navigation-menu, separator, sheet, skeleton, sonner, spinner, table, tooltip

아직 없는 것:

- `@notionhq/client`, `@react-pdf/renderer`(또는 Puppeteer) 미설치
- `/invoice/*` 라우트, PDF Route Handler, `src/lib/notion/` 모듈 없음
- 환경 변수는 `NEXT_PUBLIC_SITE_URL`만 사용 중 (`NOTION_API_KEY`, `NOTION_DATABASE_ID` 미도입)
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
- **L**: 외부 제약(배포 환경, 바이너리, 폰트 등) 검증이 필요한 작업 (현재 L 작업 없음, D1 결정에 따라 Task 007·012가 L로 커질 수 있음)

## 선행 결정/확인 필요 항목

PRD에서 정해지지 않았거나 서로 맞지 않는 부분입니다. 임의로 정하지 않고 Task 001에서 사용자가 확정합니다. 각 결정이 막고 있는 작업을 함께 적었습니다.

| ID | 항목 | PRD 근거와 문제 | 선택지 | 막는 작업 |
| --- | --- | --- | --- | --- |
| D1 | PDF 생성 방식 | 기술 스택에 "@react-pdf/renderer 또는 Puppeteer"로 둘 다 적혀 있음 | (a) `@react-pdf/renderer`: 별도 PDF 전용 레이아웃 필요, 한글 폰트 등록 필수 (b) Puppeteer: 웹 화면과 동일한 출력, Vercel 함수 용량·Chromium 패키지 제약 | 007, 012 |
| D2 | PDF API 입력 방식 | PRD 예시는 클라이언트가 `invoiceData`를 POST로 보내 그대로 렌더링 → 클라이언트가 금액을 바꿔 보낼 수 있음 | (a) 견적서 ID만 받아 서버에서 노션 재조회 (b) PRD 예시대로 데이터 전달 | 012 |
| D3 | 노션 DB 속성 이름·타입 확정 | 데이터 모델은 영문 snake_case(`invoice_number`, `client_name` …), 구조 예시는 한글 속성명(`견적서 번호`, `클라이언트명` …). 항목 DB는 모델의 `description`과 예시의 `항목명 (Title)`이 다름. 실제 노션 DB의 속성 이름·타입이 기준이 되어야 함 | 실제 노션 DB를 확인해 속성명·타입(title, rich_text, date, number, formula, relation, select) 목록 확정. 날짜 표기 형식·시간대도 함께 확정 | 003, 010 |
| D4 | 상태(Select) 값과 MVP 노출 여부 | 데이터 모델에 `status`(Select)가 있고 구조 예시는 "대기/승인/거절", MVP 이후 기능에는 "승인/거절/대기" 상태 관리가 제외 항목으로 나옴. 값 목록·표기 언어와 MVP 화면 노출 여부가 불명확 | (a) 조회 화면에 상태 배지 표시 (b) MVP에서는 읽지도 표시하지도 않음. 표시한다면 실제 Select 옵션 값 확정 | 003, 005 |
| D5 | F010 URL 생성 주체 | 관련 페이지가 "노션 (외부 시스템)"이고 여정에는 "자동으로 고유 URL 생성"이라고만 적힘. 앱에서 할 일인지 불명확 | (a) 노션 수식 속성(사이트 URL + 페이지 ID)으로 노션 쪽에서 생성, 앱은 URL 형식만 보장 (b) 앱에 별도 기능 필요 (PRD에 화면 없음) | 013 |
| D6 | 총 금액 출처와 금액 표기 | `total_amount`는 Number(수동 입력)이고 항목 `amount`는 Formula. 두 값이 어긋날 수 있음. 통화·부가세(VAT) 표기도 정의 없음 | (a) 노션 `총 금액` 값을 그대로 표시 (b) 항목 금액 합계를 계산해 표시 (c) 둘 다 읽고 불일치 시 처리 규칙 정의. 통화(원) 및 VAT 포함 여부 확정 | 003, 005, 010 |
| D7 | 발행자(회사) 정보 출처 | 페이지 명세에 "회사정보" 표시가 있으나 데이터 모델에 해당 필드가 없음 | (a) `src/config/site.ts` 등 앱 설정 상수 (b) 노션 DB에 속성 추가 (c) MVP에서 제외 | 005, 007 |
| D8 | 데이터 캐싱 정책 | "노션 API를 통한 실시간 조회"라고 되어 있으나 `cacheComponents`가 켜져 있음. Notion API 요청 제한(평균 초당 3회)도 고려 필요 | (a) 캐시 없이 매 요청 조회 (Suspense 경계로 동적 렌더링) (b) `use cache` + 짧은 `cacheLife` (노션 수정 반영 지연 허용 범위 확정) | 010, 011 |
| D9 | 접근 범위 검증과 `NOTION_DATABASE_ID` 용도 | 페이지 ID로 `pages.retrieve`만 하면 Integration에 공유된 다른 노션 페이지도 조회될 수 있음. PRD 환경 변수에 항목 DB ID는 없음 | (a) 조회한 페이지의 부모 DB가 `NOTION_DATABASE_ID`와 일치할 때만 표시 (b) 검증 없음. 항목 DB ID 환경 변수 추가 여부 확정 | 009, 010 |
| D10 | 라우트 위치와 세그먼트 이름 | URL은 `/invoice/[notionPageId]`, PRD 코드와 `docs/architecture.md`는 `src/app/invoice/[id]/`. 어느 라우트 그룹(헤더·푸터가 있는 `(marketing)` 또는 독립 레이아웃)에 둘지 정의 없음 | 세그먼트명(`[id]` 또는 `[notionPageId]`, URL은 동일)과 레이아웃 소속 확정 | 002 |
| D11 | 노션 페이지 본문(블록) 사용 여부 | PRD 예시 코드는 `blocks.children.list`로 본문 블록을 가져오지만, 데이터 모델은 본문을 쓰지 않고 항목을 Relation으로 가져옴 | (a) 본문 미사용 (b) 본문을 비고·특이사항으로 표시 (표시 가능한 블록 타입 범위 확정) | 010 |
| D12 | 404 처리 방식 | 404 페이지의 접근 방식이 "자동 리디렉션"으로 적혀 있음 | (a) 같은 URL에서 `notFound()`로 404 상태와 안내 화면 렌더링 (b) 별도 경로로 리디렉션 | 006, 010 |

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
   - Phase 끝의 리뷰 Task에서 `code-reviewer` 서브에이전트로 변경사항을 리뷰하고 지적 사항을 반영 또는 보고합니다.
   - 각 단계 완료 후 중단하고 다음 지시를 기다립니다.

4. **로드맵 업데이트**
   - 완료된 Task와 세부 구현 사항을 ✅로 표시하고, 모든 Task가 끝난 Phase 제목에 ✅를 붙입니다.

## 상태 표시 규칙

- Phase 제목 + ✅: 완료된 Phase
- Task `✅ - 완료`: 완료된 작업 / `- 우선순위`: 즉시 시작할 작업 / 표시 없음: 대기
- 세부 구현 사항 `✅`: 완료 / `-`: 미완료

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- **Task 001: MVP 선행 결정 사항 확정** - 우선순위
  - 크기: S / 의존: 없음 / 코드 변경 없음
  - 실제 노션 견적서 DB와 항목 DB의 속성 이름·타입·Select 옵션을 확인해 D3, D4 확정
  - PDF 생성 방식(D1)과 PDF API 입력 방식(D2) 확정
  - F010 URL 생성 주체(D5), 총 금액·통화·VAT(D6), 발행자 정보 출처(D7) 확정
  - 캐싱 정책(D8), 접근 범위 검증(D9), 라우트 위치·세그먼트명(D10), 본문 블록 사용(D11), 404 처리 방식(D12) 확정
  - 확정 결과를 이 문서의 결정 표에 반영 (필요 시 `docs/PRD.md` 수정 여부는 사용자가 판단)
  - 수락 기준: D1~D12 모두 선택지가 확정되어 표에 기록됨

- **Task 002: 견적서 라우트와 PDF API 골격 생성**
  - 크기: S / 의존: Task 001(D10, D12)
  - 사전 확인: `node_modules/next/dist/docs/`의 `dynamic-routes.md`, `page.md`, `not-found.md`, `loading.md`, `route.md`, `01-getting-started/08-caching.md`
  - D10에 따라 `src/app/.../invoice/[세그먼트]/page.tsx` 생성 (`params`는 Promise, `cacheComponents` 환경이므로 `params` 접근을 Suspense 경계 안에 배치)
  - 견적서 전용 `not-found.tsx`, `loading.tsx` 빈 껍데기 생성 (전역 파일과 별도로 견적서 문구를 쓰기 위함)
  - `src/app/api/generate-pdf/route.tsx` 골격 생성 (아직 미구현 응답 반환)
  - 페이지 `metadata`는 `title`만 지정 (루트 title template 사용)
  - 수락 기준: `/invoice/아무값` 접근 시 골격 화면 표시, `npm run build` 통과

- **Task 003: 견적서 도메인 타입과 데이터 매핑 명세 정의**
  - 크기: S / 의존: Task 001(D3, D4, D6)
  - `Invoice`, `InvoiceItem` 타입 정의 (D4에 따라 상태 타입 포함 여부 결정, D6에 따라 총액 필드 정의)
  - 노션 속성명 ↔ 도메인 필드 매핑 상수 정의 (D3에서 확정한 실제 속성명 사용, 코드 곳곳에 문자열 하드코딩 금지)
  - 노션 페이지 ID 형식 검증 zod 스키마 (32자리 16진수, 하이픈 포함·미포함 형식 모두 허용 여부 포함)
  - 금액(통화) 및 날짜 포맷 유틸 (`Intl.NumberFormat`, `Intl.DateTimeFormat`, D3·D6 기준)
  - UI 개발용 더미 데이터 작성 (항목 0개, 1개, 다수, 긴 항목명 케이스 포함)
  - 파일 위치는 `src/lib/` 하위로 하되 서버 전용 노션 코드(`src/lib/notion/`)와 분리 (공용 타입·포맷 유틸은 클라이언트 컴포넌트에서도 import 가능해야 함)
  - 수락 기준: `npx tsc --noEmit` 통과, 더미 데이터가 타입을 만족

- **Task 004: Phase 1 검증 및 코드 리뷰**
  - 크기: S / 의존: Task 002, 003
  - `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과 확인
  - Playwright MCP: `/invoice/[임의 ID]` 이동 시 골격 화면 렌더링, 콘솔 에러 없음 확인
  - `code-reviewer` 서브에이전트로 Phase 1 변경사항 리뷰, 지적 사항 반영 또는 보고

### Phase 2: UI/UX 완성 (더미 데이터 활용)

Task 005~007은 Task 003의 타입·더미 데이터만 있으면 Phase 3의 Task 009~010과 병렬로 진행할 수 있습니다.

- **Task 005: 견적서 조회 화면 UI 구현 (F002, F012)**
  - 크기: M / 의존: Task 003, Task 001(D4, D6, D7)
  - 견적서 헤더: 견적서 번호, 발행일, 유효기간, (D4에 따라) 상태 배지, (D7에 따라) 발행자 정보
  - 클라이언트 정보 영역: 클라이언트명
  - 견적 항목 표: 항목명, 수량, 단가, 금액 (기존 shadcn `table`, `card`, `separator`, `badge` 활용)
  - 합계 영역: 총 금액 (D6 표기 규칙)
  - 반응형: 모바일에서 표가 깨지지 않도록 항목을 카드형 목록 또는 가로 스크롤로 표시, 태블릿·데스크톱은 표 형태
  - 항목 0개일 때의 빈 상태 표시 (`empty` 컴포넌트)
  - 시맨틱 색상 토큰만 사용 (다크 모드 대응), 콘텐츠 폭은 `Container` 사용
  - 서버 컴포넌트로 작성하고 상호작용 요소만 `"use client"` 말단 컴포넌트로 분리
  - 컴포넌트 위치는 `docs/architecture.md` 계층 규칙을 따르며, 견적서 전용 컴포넌트를 둘 위치(라우트 폴더 내 비공개 폴더 또는 `src/components` 하위 신규 폴더)를 착수 시 정하고 Task 017에서 문서에 반영
  - 수락 기준: 더미 데이터로 모든 필드가 표시되고 375px/768px/1280px 폭에서 가로 넘침 없음

- **Task 006: 견적서 404·로딩·에러 상태 UI 구현 (F011, F012)**
  - 크기: S / 의존: Task 002, Task 001(D12)
  - 견적서 전용 404 화면: "견적서를 찾을 수 없습니다" 안내와 발행자에게 올바른 링크를 요청하라는 가이드 (PRD 문구 기준)
  - 로딩 상태: 견적서 레이아웃 형태의 `skeleton` (Suspense fallback 겸용)
  - 노션 API 장애 등 예기치 못한 오류용 에러 화면: Next.js 16의 `retry` prop으로 재시도 버튼 제공 (사전 확인: `03-file-conventions/error.md`)
  - 수락 기준: 각 상태 화면이 모바일·데스크톱·다크 모드에서 정상 표시

- **Task 007: PDF 문서 레이아웃과 다운로드 버튼 UI 구현 (F003)**
  - 크기: M (D1이 Puppeteer면 L) / 의존: Task 003, Task 001(D1, D7)
  - D1이 `@react-pdf/renderer`인 경우: 패키지 설치, PDF 전용 문서 컴포넌트 작성, 한글 폰트 파일 등록(폰트 라이선스 확인), A4 기준 레이아웃, 항목이 많을 때 페이지 넘김 확인
  - D1이 Puppeteer인 경우: 웹 화면을 PDF로 인쇄할 때 쓸 인쇄용 스타일 정의, Vercel에서 동작하는 Chromium 패키지 선정
  - 다운로드 버튼 클라이언트 컴포넌트: 생성 중 `spinner`와 중복 클릭 방지, 실패 시 sonner 토스트, 완료 후 같은 페이지 유지(재다운로드 가능)
  - 더미 데이터로 PDF 생성 경로를 확인할 수 있게 연결 (실데이터 연동은 Task 012)
  - 수락 기준: 더미 데이터로 생성한 PDF에서 한글이 깨지지 않고 웹 화면과 같은 정보가 담김

- **Task 008: Phase 2 검증 및 코드 리뷰**
  - 크기: S / 의존: Task 005~007
  - `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과 확인
  - Playwright MCP: `browser_resize`로 375px/768px/1280px 각각 스냅샷, 가로 스크롤 없음 확인
  - Playwright MCP: 다크 모드 전환 후 가독성 확인, 키보드 Tab 순서로 다운로드 버튼 접근 가능 확인
  - `code-reviewer` 서브에이전트로 Phase 2 변경사항 리뷰, 지적 사항 반영 또는 보고

### Phase 3: 핵심 기능 구현

- **Task 009: Notion 연동 환경과 서버 전용 클라이언트 구성 (F001)**
  - 크기: S / 의존: Task 001(D9)
  - 사전 확인: context7 MCP로 `@notionhq/client` 최신 버전과 Notion API 버전 변경 사항 확인
  - `@notionhq/client` 설치
  - 환경 변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 도입 (D9에 따라 항목 DB ID 추가 여부 반영), `.env.example`에 예시 추가
  - 환경 변수 누락 시 명확한 오류를 내는 검증 로직 (zod)
  - `src/lib/notion/` 클라이언트 모듈 작성, 클라이언트 번들에 포함되지 않도록 서버 전용으로 제한 (`NEXT_PUBLIC_` 접두사 사용 금지)
  - 수락 기준: 서버에서 노션 DB 접근 성공, API 키가 클라이언트 번들에 노출되지 않음

- **Task 010: 견적서 조회 로직 구현 (F001, F011)**
  - 크기: M / 의존: Task 003, 009, Task 001(D3, D6, D8, D9, D11, D12)
  - 사전 확인: `01-getting-started/06-fetching-data.md`, `08-caching.md`, `10-error-handling.md`, `04-functions/not-found.md`, `cacheLife.md`
  - `getInvoice(pageId)` 구현: ID 형식 검증 → 노션 페이지 조회 → (D9) 부모 DB 일치 검증 → 속성 매핑
  - 견적 항목 조회: Relation으로 연결된 항목 페이지들을 조회해 매핑 (Relation 값이 많을 때의 페이지네이션 처리 포함, 요청 수 최소화)
  - (D6) 총 금액 처리 규칙 적용, (D11) 본문 블록 처리
  - 오류 분류: 잘못된 ID 형식·존재하지 않는 페이지·다른 DB의 페이지 → `notFound()`, 인증 오류·요청 제한·네트워크 오류 → 예외로 에러 바운더리에 전달 (내부 오류 메시지를 화면에 노출하지 않음)
  - 필수 속성 누락 시 처리 규칙 (빈 값 표시 또는 오류)
  - (D8) 캐싱 정책 적용
  - 수락 기준: 실제 노션 견적서로 도메인 객체가 정확히 생성되고 오류 케이스가 의도대로 분류됨
  - 테스트 체크리스트 (Playwright MCP, 개발 서버):
    - 정상 견적서 ID로 접근 시 노션 값과 화면 값(번호, 클라이언트명, 날짜, 항목, 금액) 일치
    - 형식이 잘못된 ID(`/invoice/abc`) 접근 시 404 화면과 404 상태 코드
    - 형식은 맞지만 존재하지 않는 ID 접근 시 404 화면
    - (D9 적용 시) Integration에 공유된 다른 DB의 페이지 ID 접근 시 404 화면
    - 항목 0개 견적서, 필수 속성이 비어 있는 견적서 표시 확인
    - 잘못된 API 키로 실행 시 에러 화면과 `retry` 버튼 표시, 내부 오류 메시지 미노출

- **Task 011: 견적서 페이지 실데이터 연동 (F002)**
  - 크기: S / 의존: Task 005, 006, 010
  - 더미 데이터를 `getInvoice` 호출로 교체
  - 동적 `params`와 데이터 조회를 Suspense 경계 안에 두어 `cacheComponents` prerender 오류 방지
  - 브라우저 탭 제목에 견적서 번호 표시가 필요하면 `generateMetadata` 사용 (사전 확인: `04-functions/generate-metadata.md`, 데이터 중복 조회 방지)
  - 수락 기준: `npm run build` 통과, 실제 견적서 URL에서 Phase 2와 같은 화면 표시
  - 테스트 체크리스트 (Playwright MCP):
    - 실제 견적서 URL 접근 시 로딩 skeleton 후 견적서 표시
    - 노션에서 값 수정 후 재접속 시 D8 정책대로 반영되는지 확인
    - 375px/1280px 폭에서 실데이터(긴 항목명, 큰 금액) 레이아웃 확인

- **Task 012: PDF 생성 API 실데이터 연동 (F003)**
  - 크기: M (D1이 Puppeteer면 L) / 의존: Task 007, 010, Task 001(D1, D2)
  - 사전 확인: `01-getting-started/15-route-handlers.md`, `03-file-conventions/route.md`, `05-config/01-next-config-js/serverExternalPackages.md`
  - D2에 따라 Route Handler 입력 정의 (ID 기반이면 서버에서 `getInvoice` 재사용, 데이터 기반이면 zod로 입력 검증)
  - 응답 헤더: `Content-Type: application/pdf`, 견적서 번호 기반 파일명의 `Content-Disposition` (한글 파일명 인코딩 처리)
  - 오류 응답: 존재하지 않는 견적서 404, 생성 실패 500 (버튼은 토스트로 안내)
  - Node.js 런타임에서 동작 확인, PDF 생성 시간과 응답 크기 확인
  - 수락 기준: 실제 견적서로 PDF 다운로드 성공, 화면과 PDF의 금액·항목 일치
  - 테스트 체크리스트 (Playwright MCP):
    - 다운로드 버튼 클릭 시 다운로드 이벤트 발생, 파일명과 MIME 타입 확인
    - 생성 중 버튼 비활성화와 스피너 표시, 연속 클릭 시 요청 1회만 발생
    - 다운로드 후 같은 페이지 유지, 재다운로드 가능
    - 존재하지 않는 ID로 API 직접 호출 시 404 응답
    - (D2가 ID 기반이면) 클라이언트가 임의 데이터를 보내도 PDF 내용이 바뀌지 않음
    - API 실패를 강제했을 때 오류 토스트 표시

- **Task 013: 견적서 URL 생성 지원 (F010)**
  - 크기: S / 의존: Task 011, Task 001(D5)
  - D5가 노션 쪽 생성이면: 노션 수식 속성 설정 방법(사이트 URL + 페이지 ID)을 문서화하고, 앱은 하이픈 포함·미포함 페이지 ID URL을 모두 처리하는지 확인
  - D5가 앱 기능이면: 확정된 범위로 별도 작업 명세를 만든 뒤 진행 (PRD에 화면 정의 없음)
  - `NEXT_PUBLIC_SITE_URL`(배포 도메인)과 노션에 들어가는 URL 기준이 일치하는지 확인
  - 수락 기준: 노션에서 얻은 URL을 그대로 클릭하면 해당 견적서가 열림
  - 테스트 체크리스트 (Playwright MCP):
    - 노션에서 복사한 URL로 이동 시 정상 표시
    - 같은 견적서의 하이픈 포함·미포함 ID URL 모두 같은 견적서 표시 (D5·Task 003 결정 기준)

- **Task 014: 핵심 기능 통합 테스트 및 코드 리뷰**
  - 크기: M / 의존: Task 009~013
  - `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과 확인
  - Playwright MCP 클라이언트 여정 E2E: 링크 접속 → 견적서 확인 → PDF 다운로드 → 재다운로드
  - Playwright MCP 오류 여정: 잘못된 URL → 404 안내, 노션 장애(잘못된 키) → 에러 화면과 재시도
  - 엣지 케이스: 항목 0개, 항목 다수(PDF 페이지 넘김), 긴 텍스트, 큰 금액, 필수 속성 누락
  - 모바일(375px)·태블릿(768px)·데스크톱(1280px)에서 위 여정 반복
  - PRD "MVP 성공 기준" 5개 항목 충족 여부 점검
  - `code-reviewer` 서브에이전트로 Phase 3 변경사항 리뷰 (API 키 노출, 입력 검증, 오류 메시지 노출 중점), 지적 사항 반영 또는 보고

### Phase 4: 최적화 및 배포

- **Task 015: 성능·접근성 점검 및 개선**
  - 크기: S / 의존: Task 014
  - 견적서 1건 조회당 Notion API 요청 수 측정과 불필요한 중복 조회 제거 (페이지와 메타데이터, PDF API 간 재사용)
  - PDF 생성 시간과 폰트 파일 크기 점검 (D1 결과에 따라)
  - 접근성: 표 머리글, 버튼 레이블, 색 대비, 키보드 조작 점검
  - 수락 기준: 점검 결과와 개선 내역이 기록되고 `npm run build` 통과

- **Task 016: Vercel 배포 및 운영 환경 검증**
  - 크기: S (D1이 Puppeteer면 M) / 의존: Task 014
  - 사전 확인: `01-getting-started/17-deploying.md`
  - Vercel 프로젝트 환경 변수 설정: `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_SITE_URL` (D9에 따른 추가 변수 포함)
  - PDF Route Handler의 함수 실행 시간·용량 제한 확인
  - 배포 URL 대상 Playwright MCP 스모크 테스트: 견적서 조회, PDF 다운로드, 404
  - 배포 전 `code-reviewer` 서브에이전트로 Phase 4 코드 변경사항(Task 015, 배포 설정) 리뷰, 지적 사항 반영 또는 보고
  - 수락 기준: 배포 환경에서 MVP 성공 기준 5개 항목 충족

- **Task 017: 프로젝트 문서 갱신**
  - 크기: S / 의존: Task 016 / 코드 변경 없음
  - `docs/architecture.md`: "예정된 구조"를 실제 구조로 갱신, 견적서 전용 컴포넌트 위치를 계층 규칙에 반영
  - `CLAUDE.md`: 환경 변수 섹션에 노션 변수 추가, 새 라우트·모듈 설명 추가
  - `README.md`: 노션 Integration 설정과 로컬 실행 방법
  - 수락 기준: 문서 내용이 실제 코드 구조·환경 변수와 일치

## 기능 ID ↔ Task 매핑

| 기능 ID | 기능명 | 관련 Task |
| --- | --- | --- |
| F001 | 노션 데이터베이스 연동 | 009, 010, 015 |
| F002 | 견적서 조회 | 002, 005, 011 |
| F003 | PDF 다운로드 | 002, 007, 012 |
| F010 | 견적서 URL 생성 | 003(ID 형식), 013 |
| F011 | 견적서 유효성 검증 | 003(ID 검증), 006, 010 |
| F012 | 반응형 레이아웃 | 005, 006, 008, 014 |

## 진행 순서 요약

```
001 결정 확정
 ├─ 002 라우트 골격 ─┐
 └─ 003 타입·더미 ───┴─ 004 Phase 1 리뷰
        ├─ [UI]   005 화면 · 006 상태 화면 · 007 PDF 레이아웃 ─ 008 Phase 2 리뷰
        └─ [로직] 009 노션 환경 ─ 010 조회 로직
                                     └─ 011 페이지 연동 · 012 PDF API · 013 URL ─ 014 통합 테스트·리뷰
                                                                                  └─ 015 최적화 · 016 배포 ─ 017 문서
```
