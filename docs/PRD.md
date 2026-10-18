# Invoice Web MVP PRD

| 항목 | 내용 |
| --- | --- |
| 문서 버전 | 0.2 |
| 작성일 | 2026-10-18 |
| 상태 | Draft (D1~D8 권장안으로 확정, 2026-10-18) |
| 대상 | 1인 개발자 (바로 구현 가능한 수준의 명세) |

> 표기 규칙: **[확정]** 은 사용자가 확정한 결정(대안은 변경 시 참고용으로 남김), **[결정 필요]** 는 아직 확정되지 않은 항목, **[확인 필요]** 는 아직 공식 문서/실측으로 검증하지 못한 사실이다. 이 문서의 소스 경로는 `src/`를 생략하지 않고 명시한다.

## 0. 결정 사항 요약

D1~D8은 모두 권장안으로 **확정**했다(2026-10-18, 사용자 승인). 대안은 확정안이 막힐 때의 전환 후보로만 남긴다.

| ID | 결정 항목 | 확정안 | 대안 (전환 후보) | 상세 |
| --- | --- | --- | --- | --- |
| D1 | 클라이언트 접근 제어 | Notion에 저장한 추측 불가 토큰 링크 (`/invoice/[token]`) | 서명(HMAC) 토큰, Notion 페이지 ID 직접 사용, 이메일+코드, 로그인 | 5.2, 6.1 |
| D2 | PDF 생성 방식 | `@react-pdf/renderer` 서버 생성 (+ P1로 브라우저 인쇄 보기 병행) | 헤드리스 브라우저, 브라우저 인쇄 단독 | 8.4 |
| D3 | 배포 환경 | Vercel(서버리스) + 저트래픽 가정 | 셀프호스팅(Node 상시 서버), `use cache: remote` | 8.3, 10 |
| D4 | 상태별 공개 정책 | 초안=404, 취소=표시+PDF 비활성, 알 수 없는 상태=404 | 취소도 404, 취소도 PDF 허용 | 5.2, 6.1 |
| D5 | 발행자(작성자) 정보 저장 위치 | `src/config/issuer.ts` 상수 | 환경 변수, Notion 별도 페이지 | 6.1 |
| D6 | Notion 수정 반영 방식 | 짧은 TTL(60초) 캐시 | Notion 웹훅 + `revalidateTag` (P1) | 8.3 |
| D7 | 스타터 템플릿 정리 범위 | 출시 전에 docs/examples/app-shell 삭제, 로그인/회원가입 내비 제외 | 내부 용도로 유지 | 7.4 |
| D8 | 문서 유형·통화 범위 | 문서 유형은 "견적서" 하나, 통화는 KRW + USD | 청구서 유형 select 추가, 통화 확대 | 6.1 |

---

## 1. 개요

### 1.1 문제 정의

사업자·프리랜서는 견적서를 Notion에서 관리하지만, 이를 클라이언트에게 보낼 때는 Notion 페이지를 그대로 공유하거나 별도로 PDF를 만들어 보내야 한다. 그러면 내부 메모가 노출될 위험이 있고, 형식이 일정하지 않으며, 수정 시 PDF를 다시 만들어야 한다.

### 1.2 목표

- Notion을 유일한 입력 도구로 두고, 같은 데이터를 **정돈된 웹 견적서**와 **PDF**로 클라이언트에게 제공한다.
- 작성자는 링크 한 개만 전달하고, 클라이언트는 로그인 없이 열람·저장한다.
- 앱은 읽기 전용이다. 견적서를 웹에서 작성·편집하지 않는다.

### 1.3 성공 기준 (MVP 출시 후 직접 측정)

| 지표 | 목표 | 측정 방법 |
| --- | --- | --- |
| 반영 지연 | Notion 수정 후 웹 뷰 반영까지 2분 이내 | 수정 후 새로고침 실측 5회의 최댓값 |
| 열람→저장 효율 | 링크 클릭 후 PDF 저장까지 클릭 2회 이하, 캐시 적중 시 웹 뷰 LCP 2.5초 이내 | 수동 시나리오 + 개발자 도구 |
| 금액 정확도·한글 품질 | 검증용 샘플 견적서 5종의 소계/세금/합계가 수기 계산과 100% 일치하고, PDF에서 한글 깨짐 0건 | 샘플 5종 체크리스트 (6.4의 예시 포함) |

---

## 2. 페르소나와 핵심 사용자 여정

### 2.1 페르소나 (가정 기반, 실사용자 인터뷰 전)

| 구분 | 작성자 | 클라이언트 |
| --- | --- | --- |
| 정체 | 1인 사업자/프리랜서(디자이너, 개발자 등). Notion 숙련자 | 견적을 받는 기업·개인의 비개발자 담당자 |
| 환경 | 데스크톱 Notion | 모바일/PC 혼용, 메신저·메일로 링크 수신 |
| 니즈 | Notion 입력만으로 끝내고 싶다. 내부 메모는 숨기고 싶다 | 로그인 없이 바로 보고, 사내 결재용 PDF를 저장하고 싶다 |
| 불만 | 링크 공유·PDF 재생성이 번거롭다 | 계정 가입, 모바일에서 깨지는 화면 |

### 2.2 작성자 여정

```
1. Notion 견적서 DB에 견적서 + 견적 항목 입력
   ↓ 상태를 "발송됨"으로 변경, 공유 토큰 입력 (공유 링크 formula가 URL 생성)
2. 공유 링크를 클라이언트에게 전달 (메신저/메일, 앱 밖)
   ↓
3. 수정이 필요하면 Notion에서 수정 → 최대 2분 내 웹 반영
   ↓
4. 링크 폐기가 필요하면 상태를 "취소"/"초안"으로 바꾸거나 토큰 삭제·교체
```

### 2.3 클라이언트 여정

```
1. 링크 접속 (견적서 상세 페이지)
   ↓ 로딩 화면 (스켈레톤)
2. 토큰·상태 검증
   [유효 + 공개 가능 상태] → 견적서 웹 뷰 표시
   [토큰 없음/형식 오류/초안/알 수 없는 상태] → 404 화면
   [Notion 장애·설정 오류] → 오류 화면(다시 시도)
   ↓
3. 웹 뷰 확인 (모바일은 카드형 항목, 데스크톱은 표)
   ↓ "PDF 다운로드" 클릭
4. PDF 파일 저장
   [항목 없음/취소됨] → 버튼 비활성 + 사유 안내
   ↓
5. 완료. 필요 시 "인쇄"(P1)
```

---

## 3. MVP 범위

### 3.1 In Scope

- 토큰 링크로 견적서 상세 웹 뷰 열람 (로그인 없음)
- Notion 견적서 DB + 견적 항목 DB 읽기 (서버 전용)
- 소계/세금/합계 계산, 통화 표기
- PDF 다운로드 (한글 지원)
- 로딩·오류·404·빈 상태, 취소·만료 안내
- 반응형, 다크 모드(웹), 캐싱
- 서비스 안내 홈(최소)

### 3.2 Out of Scope (후순위 후보로만 표기)

- 웹에서 견적서 작성·편집, 작성자 대시보드/견적서 목록, 작성자 로그인 (후보)
- 결제, 전자서명, 클라이언트의 웹 승인/반려 버튼 (승인은 작성자가 Notion에서 상태 변경)
- 알림 메일 발송, 다국어, 다중 작성자/팀, 견적서 버전 이력
- 할인·음수 금액 항목, 부가세 포함 단가, 다중 세율
- Notion 페이지 본문(블록) 렌더링, Notion 호스팅 파일(로고·첨부) 표시
- 설정/프로필, 소셜 기능

---

## 4. 기능 요구사항

우선순위: **P0** = 없으면 출시 불가, **P1** = 출시 직후 추가 가능.

### 4.1 기능 명세

| ID | 기능명 | 설명 | 우선순위 | 관련 페이지 |
| --- | --- | --- | --- | --- |
| F001 | 링크 진입 | 토큰이 포함된 URL로 견적서에 진입 (목록 없이 링크가 유일한 진입점) | P0 | 견적서 상세 페이지 |
| F002 | 접근 제어 | 토큰 형식 검증, 토큰으로 견적서 1건 조회, 상태별 공개 규칙, 검색 색인 차단 | P0 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 |
| F003 | Notion 견적서·항목 조회 | 견적서 DS에서 토큰으로 1건, 항목 DS에서 relation 필터로 항목 조회 후 도메인 타입으로 변환 | P0 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 |
| F004 | 금액 계산 | 항목 금액/소계/세금/합계 계산, 통화별 반올림·표기 | P0 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 |
| F005 | 견적서 웹 뷰 | 발행자, 고객, 번호/날짜, 항목, 합계, 메모를 한 화면에 표시 | P0 | 견적서 상세 페이지 |
| F006 | PDF 다운로드 | 웹 뷰와 같은 정보 구조의 PDF를 파일로 저장 | P0 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 |
| F007 | 상태별 화면 | 로딩, 빈 항목, 오류(다시 시도), 404, 취소·만료 안내 | P0 | 견적서 상태 화면, 견적서 상세 페이지 |
| F008 | 반응형·다크 모드 | 시맨틱 토큰만 사용, 모바일 카드형/데스크톱 표. PDF는 항상 라이트 | P0 | 견적서 상세 페이지, 서비스 안내 홈 |
| F009 | 캐싱·재검증 | `use cache` + `cacheLife` + `cacheTag`, 짧은 TTL, 부정 결과 단기 캐시 | P0 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 |
| F010 | 인쇄 보기 | `window.print()` + 인쇄 스타일. PDF 라이브러리 문제 시 대체 수단 | P1 | 견적서 상세 페이지 |
| F011 | Notion 웹훅 재검증 | 서명 검증 후 `revalidateTag`로 즉시 반영 | P1 | 웹훅 수신 엔드포인트 |
| F012 | 서비스 안내 홈 | 스타터 랜딩을 교체. "견적서는 전달받은 링크로 접속" 안내 | P1 | 서비스 안내 홈 |

### 4.2 인수 조건

**F001 링크 진입**
- [ ] Given 유효한 토큰 링크, When 접속, Then 로그인 없이 견적서 상세가 표시된다.
- [ ] Given 토큰이 없거나 `/invoice`만 접속, When 접속, Then 404 화면이 나온다 (목록·검색 기능 없음).

**F002 접근 제어**
- [ ] Given 토큰이 정규식(`^[a-z0-9]{32}$`, D1 확정안 기준)에 맞지 않음, When 접속, Then Notion을 호출하지 않고 404를 반환한다.
- [ ] Given 토큰이 일치하는 견적서가 없거나 2건 이상(중복), When 접속, Then 404이며 서버에 마스킹된 로그를 남긴다.
- [ ] Given 상태가 초안 또는 알 수 없는 값, When 접속, Then 404이고 존재 여부를 구분할 수 없다.
- [ ] Given 취소 상태, When 접속, Then "취소된 견적서" 안내가 표시되고 PDF 버튼은 비활성이다 (D4).
- [ ] Given 응답 HTML, Then `noindex` 메타와 `Referrer-Policy: no-referrer` 헤더가 포함된다.

**F003 조회**
- [ ] Given 유효 토큰, When 조회, Then 견적서 쿼리 1회 + 항목 쿼리 1회(필요 시 커서 반복)만 호출한다.
- [ ] Given 항목이 25개를 초과, Then 롤업·relation 응답에 의존하지 않고 항목 DS 쿼리 결과로 전부 표시한다.
- [ ] Given Notion 응답에 필수 속성 누락/타입 불일치, Then zod 검증이 실패하고 오류 화면이 나온다 (원인은 서버 로그에만).

**F004 금액 계산**
- [ ] Given 6.4의 예시 입력, When 계산, Then 예시 출력과 정확히 일치한다.
- [ ] Given 수량·단가 중 하나라도 음수, Then 해당 견적서는 데이터 오류로 처리한다.
- [ ] Given 웹 뷰와 PDF, Then 두 곳의 금액이 동일 함수 결과다.

**F005 웹 뷰**
- [ ] 필수 표시: 견적서명, 번호(`INV-12` 형식), 상태 배지, 발행일, 만료일, 고객명, 발행자 정보, 항목(품목/수량/단가/금액), 소계/세금/합계, 메모.
- [ ] 내부용 필드(고객 이메일 제외 정책 포함)는 화이트리스트 매핑에 없으면 표시되지 않는다.

**F006 PDF 다운로드**
- [ ] Given 공개 가능한 견적서, When "PDF 다운로드" 클릭, Then `INV-12.pdf` 파일이 저장되고 한글이 깨지지 않는다.
- [ ] Given 항목이 10개 이상, Then 여러 페이지로 나뉘고 표 헤더가 매 페이지 반복된다.
- [ ] Given 잘못된 토큰으로 PDF 경로 접근, Then 404 (웹 뷰와 같은 규칙).

**F007 상태별 화면**
- [ ] 로딩: 스켈레톤(`loading.tsx`). 오류: 일반화된 메시지 + `retry` 버튼 (Notion 에러 코드·토큰 미노출).
- [ ] 빈 항목: "준비 중인 견적서입니다" 안내(`Empty`), PDF 비활성.
- [ ] 만료: 만료일(KST) 경과 시 "만료됨" 배지, 열람·다운로드는 허용.

**F008 반응형·다크 모드**
- [ ] 360px 폭에서 가로 스크롤이 없고, 항목은 카드형으로 보인다. 768px 이상에서 표로 보인다.
- [ ] 하드코딩 색상이 없고(시맨틱 토큰만), 라이트/다크 모두 대비가 충분하다.

**F009 캐싱·재검증**
- [ ] 같은 토큰의 반복 요청은 TTL 내 Notion을 재호출하지 않는다 (자체 호스팅 환경 기준).
- [ ] Notion 수정 후 2분 이내 반영된다.
- [ ] `npm run build`에서 cacheComponents prerender 오류가 없다.

**F010 인쇄 보기 (P1)**: 인쇄 시 헤더/버튼이 숨고 A4에서 표가 잘리지 않는다.
**F011 웹훅 (P1)**: 서명이 틀린 요청은 401, 올바른 요청은 해당 태그 재검증 후 200.
**F012 안내 홈 (P1)**: 스타터 문구가 제거되고, 링크 접속 방법과 문의처만 안내한다.

---

## 5. 비기능 요구사항

### 5.1 성능과 캐싱

- 읽기 함수에 `"use cache"` + `cacheLife` + `cacheTag`를 적용한다. 권장 수명: `revalidate 60초`, `expire 300초` 수준(구현 시 조정).
- 부정 결과(404)는 같은 함수 안에서 조건부로 더 짧은 `cacheLife`를 적용한다(함수 호출당 `cacheLife`는 1회만 실행). 오류(throw)는 캐시되지 않는다.
- 캐시 키가 토큰 인자라서 임의 토큰 대량 요청이 Notion 호출을 유발할 수 있다. 토큰 형식 사전 검증과 부정 결과 단기 캐시로 완화한다.
- `Date.now` 기반 "만료됨" 판정은 캐시 함수 밖(요청 시점)에서 한다. 캐시 안에 넣으면 값이 고정된다.
- 캐시 함수의 반환값은 직렬화 가능한 평범한 객체(날짜는 ISO 문자열)로 제한한다.
- 서버리스에서는 기본 `use cache` 저장소(메모리)가 요청 간 유지되지 않을 수 있다. 이 경우 요청마다 Notion 2회 호출이 발생한다 (D3).

### 5.2 보안과 접근 제어

- **D1 접근 제어 (확정: A. Notion `공유 토큰`)**

| 방식 | 장점 | 단점 | 판단 |
| --- | --- | --- | --- |
| A. Notion 속성 `공유 토큰`에 저장한 추측 불가 토큰 (확정) | 앱에 인증 백엔드 불필요, 폐기/재발급이 Notion 편집만으로 가능, 링크 발급이 Notion formula로 가능 | 작성자가 토큰을 직접 만들어 넣어야 함(예: `openssl rand -hex 16`), 조회 시 Notion 필터 호출 필요 | MVP 확정 |
| B. HMAC 서명 토큰 | 잘못된 토큰을 Notion 호출 없이 거부 | 발급용 CLI/화면 필요, 개별 폐기 어려움 | 대안 (rate limit 부담이 크면 전환) |
| C. Notion 페이지 ID를 URL로 사용 | 구현 최소 | ID는 Notion URL에 노출되는 값, 폐기 불가 | 비권장 |
| D. 이메일 + 코드 / 로그인 | 가장 강한 통제 | 클라이언트 마찰, 인증 백엔드 필요 | MVP 범위 밖 |

- 토큰은 128비트 이상 무작위 소문자 16진수 32자(권장). 소문자 숫자만 쓰는 이유는 Notion `rich_text equals` 필터의 대소문자 구분 여부가 불확실하기 때문이다 **[확인 필요]**. 조회 후 앱에서 한 번 더 문자열 일치를 확인한다.
- **D4 상태별 공개 정책 (확정)**: 초안 → 404, 발송됨/승인 → 표시, 취소 → 표시 + PDF 비활성, 만료(날짜 경과) → 표시 + 배지, 알 수 없는 상태 → 404 + 로그.
- Notion 통합 토큰과 DB/데이터 소스 ID는 서버 전용이다. `NEXT_PUBLIC_` 접두사 금지, `lib/notion/*`는 `import "server-only"`.
- 클라이언트로는 화이트리스트 매핑된 도메인 DTO만 전달한다. Notion 원본 응답, 내부 메모, 토큰 값은 전달하지 않는다.
- 로그에는 토큰 전체를 남기지 않는다(앞 4자 + 마스킹). 사용자에게는 일반화된 오류 메시지만 보인다.
- 응답 헤더: `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex` (또는 layout metadata `robots`). PDF 응답은 `Cache-Control: private, no-store`.

### 5.3 Notion 레이트 리밋 대응

- 연결당 평균 약 3 req/s. 초과 시 429 + `Retry-After`이며 SDK가 429/529를 자동 재시도한다.
- 캐시 미스당 호출은 2회(견적서 1 + 항목 1)로 고정한다. 웹 뷰와 PDF는 같은 캐시 함수를 공유해 중복 호출을 피한다.
- 최종 실패(`APIErrorCode.RateLimited` 등)는 오류 화면(다시 시도)으로 처리한다.
- 에러는 `APIResponseError`/`APIErrorCode`로 분기: `ObjectNotFound`(통합 미연결 가능) → 설정 오류로 로그, 토큰 불일치와 구분.

### 5.4 Notion 파일 URL 만료 대응

- Notion 호스팅 파일 URL은 약 1시간 후 만료된다. **MVP는 Notion 호스팅 파일(첨부·로고·커버)을 화면/PDF에 쓰지 않는다.** 로고는 `public/`에 둔다.
- 후속에서 도입한다면: 캐시에 URL을 담지 않고, 요청 시 재조회하는 프록시 Route Handler를 둔다.

### 5.5 접근성

- 항목 표는 시맨틱 `table`(`caption`, `th scope`). 모바일 카드형도 항목 이름/값이 읽히는 순서로 구성한다.
- 상태는 색만으로 구분하지 않고 텍스트 배지로 표시한다. 오류 영역은 `role="alert"` 또는 `status`.
- 키보드로 PDF 버튼 접근과 포커스 링 확인, 터치 영역 44px 이상, `lang="ko"`(루트 적용 완료).
- 시맨틱 토큰 사용으로 라이트/다크 대비를 확보한다.

---

## 6. 데이터 모델

### 6.1 Notion 속성 스키마 (제안 → MVP 확정안)

> 속성은 **이름 기준**으로 읽고, 이름 상수는 `src/lib/notion/schema.ts` 한 곳에 모은다. Notion에서 속성 이름을 바꾸면 이 파일도 같이 바꾼다. 통합(Connection)을 **두 데이터베이스 모두**에 연결해야 한다.

**견적서 데이터 소스 (`NOTION_INVOICES_DATA_SOURCE_ID`)**

| 속성 | Notion 타입 | 필수 | 용도/규칙 |
| --- | --- | --- | --- |
| 견적서명 | title | O | 화면 제목 |
| 번호 | unique_id (접두사 `INV`) | O | `INV-12` 형식으로 표기, PDF 파일명 |
| 고객명 | rich_text | O | 수신자 |
| 고객 이메일 | email | X | 표시 여부는 구현 시 결정 (기본: 표시 안 함 권장) |
| 상태 | status | O | 초안 / 발송됨 / 승인 / 취소. 옵션은 Notion UI에서 먼저 만들고, 이름은 코드의 zod enum 한 곳에 모은다 |
| 발행일 | date | O | KST 기준 `YYYY.MM.DD` 표기 |
| 만료일 | date | X | 유효기간 만료일. 경과 시 "만료됨" 배지 (D8: 문서 유형은 견적서 하나) |
| 통화 | select | O | `KRW` / `USD` |
| 세율 | number (percent) | O | 0~1 비율로 읽음 (10% = 0.1) **[확인 필요: API가 비율로 주는지 샘플로 검증]** |
| 항목 | relation → 견적 항목 | O | 작성용. 합계 계산에는 사용하지 않음 |
| 고객용 메모 | rich_text | X | 화면/PDF에 표시. 내부 메모는 별도 속성에 두고 앱이 읽지 않음 |
| 공유 토큰 | rich_text | O | 접근 제어용 (D1-A). 중복 금지 |
| 공유 링크 | formula | X | 읽기 전용. `https://<도메인>/invoice/` + 공유 토큰으로 작성자가 복사 |

**견적 항목 데이터 소스 (`NOTION_INVOICE_ITEMS_DATA_SOURCE_ID`)**

| 속성 | Notion 타입 | 필수 | 용도/규칙 |
| --- | --- | --- | --- |
| 품목 | title | O | 항목명 |
| 견적서 | relation → 견적서 (이중 연결) | O | 쿼리 필터 `relation.contains` 대상 |
| 수량 | number | O | 0보다 큼, 소수 허용 |
| 단가 | number | O | 0 이상 |
| 순번 | number | X | 표시 순서. 없으면 생성 시각 오름차순 |
| 금액 | formula (수량×단가) | X | 작성자 편의용. **앱은 읽지 않고 재계산** |

**발행자 정보 (D5)**: 상호, 대표자, 사업자등록번호, 주소, 연락처, 입금 계좌는 Notion이 아니라 `src/config/issuer.ts` 상수로 둔다 (1인 작성자 가정). 대안: 환경 변수 또는 Notion 별도 페이지.

### 6.2 Notion 응답 → 도메인 타입 매핑 방침

1. `src/lib/notion/mappers.ts`에서 Notion 페이지의 `properties`를 읽어 **원시 값 객체**로 만든다(`isFullPage`로 좁힌 뒤, title/rich_text는 plain text 합치기, unique_id는 `prefix-number`, formula는 무시).
2. 원시 값 객체를 `src/lib/invoice/types.ts`의 zod 스키마(`invoiceSchema`, `invoiceItemSchema`, `invoiceStatusSchema`)로 `safeParse`한다. 타입은 `z.infer`로만 얻는다.
3. 도메인 타입은 직렬화 가능해야 한다: 날짜는 ISO 문자열, 금액은 number(최소 단위 정수 계산은 `calculate.ts` 내부).
4. 화이트리스트 매핑: 스키마에 없는 Notion 속성은 절대 도메인 객체에 들어가지 않는다.
5. 검증 실패는 `InvoiceDataError`로 던지고, 오류 화면에서는 일반화된 메시지만 보인다.

### 6.3 도메인 타입 요약

| 모델 | 핵심 필드 |
| --- | --- |
| Invoice | id(Notion 페이지 ID), number, title, status, customerName, issueDate, expiryDate, currency, taxRate, note |
| InvoiceItem | id, name, quantity, unitPrice, order |
| InvoiceTotals (계산 결과) | lines[{itemId, amount}], subtotal, tax, total |
| IssuerInfo (config) | name, representative, businessNumber, address, contact, bankAccount |

### 6.4 금액 계산 규칙

- 계산은 통화 **최소 단위 정수**로 수행한다: 소수 자릿수 `d`(KRW 0, USD 2), `unitMinor = round(단가 × 10^d)`.
- 항목 금액 `lineMinor = round(수량 × unitMinor)` (항목별 반올림).
- 소계 `subtotalMinor = Σ lineMinor`.
- 세금 `taxMinor = round(subtotalMinor × 세율)` (세금은 소계에 한 번만 계산, 부가세 별도 가정).
- 합계 `totalMinor = subtotalMinor + taxMinor`.
- 반올림은 "반올림(0.5는 올림)". 음수는 허용하지 않으므로 방향 문제는 없다. 부동소수 경계값은 샘플로 검증한다.
- 표기: KRW는 `3,300,000원`, USD는 `$1,234.50`(`Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`). 표기 함수는 `src/lib/invoice/format.ts` 한 곳에서 웹/PDF가 공유한다.
- 날짜: Notion `date.start`를 Asia/Seoul 기준 날짜로 변환해 `YYYY.MM.DD`로 표기한다.

| 입력 | 출력 |
| --- | --- |
| KRW, 세율 10%, 항목 [1,000,000 × 3] | 소계 3,000,000 / 세금 300,000 / 합계 3,300,000 |
| KRW, 세율 10%, 항목 [33,333 × 1.5] | 항목 50,000 (49,999.5 반올림) / 소계 50,000 / 세금 5,000 / 합계 55,000 |
| USD, 세율 8.25%, 항목 [19.99 × 3] | 항목 59.97 / 소계 59.97 / 세금 4.95 (4.947525 반올림) / 합계 64.92 |
| KRW, 세율 0%, 항목 [100,000 × 2] | 소계 200,000 / 세금 0 / 합계 200,000 |

---

## 7. 화면/라우트 구성

### 7.1 라우트 제안

작성자는 앱 UI를 쓰지 않으므로 화면은 클라이언트용 열람 화면 중심이다. 기존 `(marketing)` 레이아웃은 헤더에 문서/예제/로그인 내비가 있어 클라이언트용으로 부적합하므로 **새 라우트 그룹 `(invoice)`** 를 둔다.

```
src/app/
├─ (marketing)/page.tsx                      서비스 안내 홈 (/)       F012
├─ (invoice)/
│  ├─ layout.tsx                             최소 헤더(로고 + 테마 토글), noindex metadata
│  └─ invoice/[token]/
│     ├─ page.tsx                            견적서 상세 (/invoice/[token])
│     ├─ loading.tsx / error.tsx / not-found.tsx
│     └─ pdf/route.ts                        PDF 다운로드 (/invoice/[token]/pdf)
└─ api/notion/webhook/route.ts               웹훅 수신 (P1)
```

### 7.2 메뉴 구조 (내비게이션)

```
Invoice Web 내비게이션
├── 공개 헤더 (견적서 영역: (invoice) 레이아웃)
│   ├── 로고 -> 서비스 안내 홈 (F012)
│   └── 테마 토글 (F008)
├── 서비스 안내 홈 헤더 ((marketing) 레이아웃)
│   └── 홈 (F012)   * 로그인/문서/예제는 D7 결정에 따라 제거
└── 견적서 상세 페이지 내부 액션 (메뉴 아님)
    ├── PDF 다운로드 - F006
    └── 인쇄 - F010 (P1)

작성자 메뉴: 없음 (Notion이 입력/관리 도구)
```

### 7.3 페이지별 상세 기능

#### 견적서 상세 페이지

> **구현 기능:** `F001`, `F002`, `F003`, `F004`, `F005`, `F006`, `F007`, `F008`, `F009`, `F010`

| 항목 | 내용 |
| --- | --- |
| 역할 | 클라이언트가 견적서를 열람하고 PDF를 받는 핵심 화면 |
| 진입 경로 | 작성자가 전달한 공유 링크 직접 접속 (메뉴 진입 없음) |
| 사용자 행동 | 견적 내용 확인, PDF 저장, 인쇄(P1), 테마 전환 |
| 주요 기능 | • 토큰 검증 + 상태별 공개 판정<br>• 서버 컴포넌트에서 캐시된 조회 함수 호출, 요청 시점에 만료 판정<br>• 금액 계산 결과 표시 (표 / 모바일 카드형)<br>• 취소·만료·빈 항목 안내 (`Alert`, `Badge`, `Empty`)<br>• **PDF 다운로드** 버튼 (`<a href="/invoice/[token]/pdf" download>`), **인쇄** 버튼(P1) |
| 다음 이동 | 성공 → 현재 화면 유지, 비공개/없음 → 견적서 상태 화면(404), Notion 오류 → 견적서 상태 화면(오류) |

#### 견적서 상태 화면

> **구현 기능:** `F007`

| 항목 | 내용 |
| --- | --- |
| 역할 | 로딩/오류/404를 일관된 톤으로 보여주는 상태 화면 (`loading.tsx`, `error.tsx`, `not-found.tsx`) |
| 진입 경로 | 견적서 상세 페이지의 로딩 중, 예외 발생, `notFound()` 호출 시 자동 전환 |
| 사용자 행동 | 오류 시 다시 시도, 404 시 안내 홈으로 이동 |
| 주요 기능 | • 스켈레톤 로딩<br>• 일반화된 오류 문구 + `retry` 버튼 (Next 16.4의 에러 바운더리 prop은 `retry`)<br>• 404 안내 ("링크를 다시 확인하거나 작성자에게 문의") |
| 다음 이동 | 다시 시도 → 견적서 상세 페이지, 홈으로 → 서비스 안내 홈 |

#### PDF 다운로드 엔드포인트 (Route Handler, 화면 없음)

> **구현 기능:** `F002`, `F003`, `F004`, `F006`, `F009`

| 항목 | 내용 |
| --- | --- |
| 역할 | 토큰으로 견적서를 조회해 PDF 바이너리를 응답 |
| 진입 경로 | 견적서 상세 페이지의 PDF 다운로드 버튼 (GET) |
| 사용자 행동 | 없음 (브라우저가 파일 저장) |
| 주요 기능 | • 웹 뷰와 같은 토큰 검증·상태 규칙·캐시 함수 재사용<br>• Node 런타임에서 PDF 렌더링, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename*=UTF-8''INV-12.pdf`<br>• 실패 시 404/500 (일반화된 본문), PDF 응답은 `Cache-Control: private, no-store` |
| 다음 이동 | 성공 → 파일 저장, 실패 → 상태 코드로 종료 |

#### 서비스 안내 홈

> **구현 기능:** `F008`, `F012`

| 항목 | 내용 |
| --- | --- |
| 역할 | 스타터 랜딩을 대체하는 최소 안내 페이지 |
| 진입 경로 | 도메인 루트 접속, 헤더 로고 클릭 |
| 사용자 행동 | 안내 문구 읽기 |
| 주요 기능 | • "견적서는 전달받은 링크로 접속하세요" 안내<br>• 문의처 표시 (D5의 발행자 연락처 재사용) |
| 다음 이동 | 없음 (링크 없이는 견적서 접근 불가) |

#### 웹훅 수신 엔드포인트 (P1, 화면 없음)

> **구현 기능:** `F011`

| 항목 | 내용 |
| --- | --- |
| 역할 | Notion 변경 이벤트를 받아 캐시 즉시 무효화 |
| 진입 경로 | Notion → POST 요청 |
| 사용자 행동 | 없음 |
| 주요 기능 | • 서명 검증(원본 본문 기준 HMAC, `NOTION_WEBHOOK_VERIFICATION_TOKEN`) **[확인 필요: 헤더명·구독 이벤트 이름]**<br>• `revalidateTag("invoices", { expire: 0 })` (웹훅은 Server Action이 아니므로 `updateTag` 불가) |
| 다음 이동 | 200/401 응답 후 종료 |

### 7.4 `config/site.ts` 수정 지점

| 대상 | 변경 |
| --- | --- |
| `siteConfig.name`, `siteConfig.description` | "Next.js Starter" → 서비스명(결정 필요). 루트 title template이 자동 반영 |
| `mainNav` | 로그인 제거. D7 확정 시 문서/예제도 제거 (홈만 남김) |
| `docsNav`, `docsPages`, `examplesNav`, `shellNav`, `routeLabels` | D7에서 docs/examples/app-shell 삭제 시 함께 정리 (`docs/architecture.md` 하단 절차). `(invoice)`는 브레드크럼을 쓰지 않아 `routeLabels` 추가 불필요 |
| 로그인/회원가입 | 인증 백엔드가 없으므로 MVP에서 내비 제외. 페이지 삭제 여부는 D7 |

그 외 문서 갱신: `docs/architecture.md`(새 폴더 `src/components/invoice/`, `src/lib/invoice/`, `src/lib/notion/`, `(invoice)` 그룹), `docs/guide.md`/`.env.example`(환경 변수).

### 7.5 정합성 점검

| 기능 ID | 구현 페이지 | 메뉴/진입 |
| --- | --- | --- |
| F001 | 견적서 상세 페이지 | 공유 링크 |
| F002 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 | 공유 링크 |
| F003 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 | 공유 링크 |
| F004 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 | 공유 링크 |
| F005 | 견적서 상세 페이지 | 공유 링크 |
| F006 | 견적서 상세 페이지(버튼), PDF 다운로드 엔드포인트 | PDF 다운로드 |
| F007 | 견적서 상태 화면, 견적서 상세 페이지 | 자동 전환 |
| F008 | 견적서 상세 페이지, 서비스 안내 홈 | 테마 토글 |
| F009 | 견적서 상세 페이지, PDF 다운로드 엔드포인트 | 내부 |
| F010 | 견적서 상세 페이지 | 인쇄 |
| F011 | 웹훅 수신 엔드포인트 | Notion |
| F012 | 서비스 안내 홈 | 홈, 로고 |

모든 기능 ID가 최소 한 페이지에서 구현되고, 모든 페이지의 구현 기능 ID가 4.1에 정의되어 있다.

---

## 8. 기술 설계 개요

### 8.1 스택 (프로젝트 기준)

Next.js 16.4 (App Router, `cacheComponents`, `partialPrefetching`) / React 19.3 / TypeScript / zod v4 / shadcn(Base UI, base-nova) / Tailwind v4 / `lucide-react` / `sonner`. 인증·DB 서버는 없다.

### 8.2 파일 배치

의존 방향은 CLAUDE.md의 계층을 따른다. `lib/**`는 `components`/`app`을 import하지 않는다.

```
src/
├─ config/issuer.ts                     발행자 정보 상수 (D5)
├─ lib/
│  ├─ invoice/                          순수 도메인 (서버/클라이언트 공용)
│  │  ├─ types.ts                       zod 스키마 + z.infer 타입, 상태 enum
│  │  ├─ calculate.ts                   금액 계산 (6.4)
│  │  └─ format.ts                      금액/날짜/번호 표기
│  ├─ notion/                           서버 전용 (모든 파일 import "server-only")
│  │  ├─ client.ts                      Client 생성, notionVersion: "2026-03-11" 한 곳에서 명시
│  │  ├─ env.ts                         환경 변수 zod 검증 (없으면 즉시 실패)
│  │  ├─ schema.ts                      속성 이름 상수
│  │  ├─ mappers.ts                     Notion 응답 -> 원시 값 -> 도메인
│  │  ├─ errors.ts                      APIResponseError -> InvoiceError 종류 매핑
│  │  └─ invoices.ts                    getInvoiceByToken (use cache)
│  └─ pdf/                              서버 전용
│     ├─ fonts.ts                       한글 폰트 등록
│     └─ invoice-document.tsx           PDF 템플릿
├─ components/invoice/                  UI 블록 (ui 컴포넌트 조합, 도메인 전용)
│  ├─ invoice-view.tsx / invoice-items.tsx / invoice-totals.tsx
│  ├─ invoice-status-badge.tsx / download-button.tsx / print-button.tsx(P1)
│  └─ invoice-skeleton.tsx
├─ components/layout/invoice-header.tsx 최소 헤더
└─ assets/fonts/                        한글 폰트 파일 (OFL 라이선스 폰트)
```

`components/invoice/`는 기본 계층 밖의 새 폴더이므로 `docs/architecture.md`에 "Common 계층의 도메인 블록"으로 추가한다.

### 8.3 서버/클라이언트 역할, 캐싱·재검증, 배포

| 요소 | 역할 |
| --- | --- |
| 서버 컴포넌트 | `page.tsx`는 얇게 유지. `params`(Promise)는 `Suspense` 안의 async 컴포넌트에서 읽고, 셸(헤더·스켈레톤)은 정적으로 둔다. 캐시 함수 호출 -> 요청 시점 만료 판정 -> 렌더 |
| 클라이언트 컴포넌트 | 말단만 `"use client"`: 인쇄 버튼(P1), 테마 토글(기존). 다운로드 버튼은 단순 앵커라 서버 컴포넌트 가능 |
| Server Action | MVP에는 없음 (읽기 전용 앱) |
| Route Handler | PDF 생성(Node 런타임), 웹훅(P1) |
| 캐시 | `getInvoiceByToken(token)`: `"use cache"`, `cacheLife`(5.1), `cacheTag("invoices")` + 견적서 조회 후 `cacheTag("invoice:<pageId>")` **[확인 필요: 비동기 호출 이후 `cacheTag` 호출 가능 여부]** |
| 재검증 (D6) | 확정: TTL 60초. 대안: 웹훅(P1) + `revalidateTag(tag, { expire: 0 })` |
| 배포 (D3) | 확정: Vercel. 서버리스에서 메모리 캐시가 유지되지 않아도 저트래픽(클라이언트 소수)이면 허용. 부하가 문제 되면 `use cache: remote` 또는 셀프호스팅 검토 **[확인 필요: Vercel에서 remote 핸들러 제공 여부와 비용]** |

환경 변수 (추가될 항목):

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `NOTION_TOKEN` | O | 통합(internal connection) 토큰. 서버 전용 |
| `NOTION_INVOICES_DATA_SOURCE_ID` | O | 견적서 **데이터 소스 ID** (데이터베이스 ID와 호환되지 않음) |
| `NOTION_INVOICE_ITEMS_DATA_SOURCE_ID` | O | 견적 항목 데이터 소스 ID |
| `NOTION_WEBHOOK_VERIFICATION_TOKEN` | P1 | 웹훅 서명 검증용 |

기존 `NEXT_PUBLIC_SITE_URL`은 그대로 쓴다. `.env.example`과 `docs/guide.md`의 환경 변수 표를 함께 갱신한다. 데이터 소스 ID는 `databases.retrieve` 응답의 `data_sources` 배열에서 확인한다 **[확인 필요: Notion UI에서 복사하는 경로]**.

의존성 추가:

| 패키지 | 구분 | 비고 |
| --- | --- | --- |
| `@notionhq/client` (5.x) | dependency | `notionVersion: "2026-03-11"` 명시, `dataSources.query` 사용 |
| `server-only` | dependency | 서버 전용 모듈 보호 |
| `@react-pdf/renderer` | dependency | D2 확정안 **[확인 필요: React 19.3 / Next 16.4 호환 버전, `serverExternalPackages` 필요 여부]** |
| `vitest` | devDependency (선택) | 금액 계산 단위 테스트용. 현재 테스트 러너 없음 (10.3) |

Notion 호출 요약:
- 견적서 조회: `notion.dataSources.query({ data_source_id, filter: { property: "공유 토큰", rich_text: { equals: token } }, page_size: 2 })` (2건이면 중복 오류). 보관(휴지통) 페이지는 `is_archived` 기본값(false)으로 제외된다.
- 항목 조회: `filter: { property: "견적서", relation: { contains: invoicePageId } }`, `sorts`(순번 오름차순), `has_more`/`next_cursor` 반복. `filter_properties`(속성 이름 또는 ID)로 응답을 줄일 수 있다.

### 8.4 PDF 생성 방식 비교 (D2 확정: (a) `@react-pdf/renderer` + P1 인쇄 보기)

| 기준 | (a) 서버 PDF 라이브러리 (`@react-pdf/renderer`) | (b) 헤드리스 브라우저 | (c) 브라우저 인쇄 (`window.print`) |
| --- | --- | --- | --- |
| 웹과 레이아웃 일치 | 낮음~중간: 별도 템플릿 필요 (Tailwind/shadcn 재사용 불가) | 높음: 같은 페이지를 렌더 | 가장 높음: 같은 DOM + 인쇄 CSS |
| "다운로드" 경험 | 버튼 한 번에 파일 저장 | 버튼 한 번에 파일 저장 | 인쇄 대화상자에서 "PDF로 저장" 선택, 모바일은 번거로움 |
| 서버리스 적합성 | 좋음: 순수 JS | 나쁨: Chromium 번들 크기·콜드 스타트·타임아웃 부담 **[확인 필요]** | 해당 없음 (서버 작업 없음) |
| 한글 폰트 | 폰트 파일 등록 필요 | 웹 폰트/시스템 폰트 사용 | 브라우저 폰트 사용 |
| 구현 비용(1인) | 중간 (템플릿 1개) | 중간~높음 (배포 제약) | 낮음 |
| 위험 | 템플릿 이중 관리, 폰트 번들/추적 | 인프라 제약이 가장 큼 | 결과 품질이 사용자 브라우저에 좌우 |

- **확정안**: (a)로 P0의 "PDF 다운로드"를 구현하고, (c)를 P1 "인쇄 보기"로 병행한다 (a가 막히면 (c)가 임시 대체 수단). 이유: 서버리스 제약이 가장 약하고, 클라이언트가 한 번의 클릭으로 파일을 받는다.
- **대안**: 레이아웃 완전 일치가 최우선이고 셀프호스팅이면 (b). 가장 빠른 검증이 목적이면 (c) 단독.
- **한글 폰트**: OFL 라이선스의 Noto Sans KR 또는 Pretendard 정적 Regular/Bold를 `src/assets/fonts/`에 두고 `Font.register`로 등록한다. 가변 폰트·woff2 지원 여부, 파일 크기(서브셋 필요 여부), 한글 줄바꿈(`registerHyphenationCallback` 필요 여부) **[확인 필요]**. 서버리스 번들에 폰트가 포함되도록 `next.config.ts`의 `outputFileTracingIncludes` 설정이 필요할 수 있다 **[확인 필요]**.
- **웹/PDF 일치 방법**: (1) 둘 다 `Invoice` 도메인 객체 + `calculate`/`format` 함수만 입력으로 사용, (2) 섹션 순서·라벨 문구를 상수로 공유(`src/lib/invoice/labels.ts`, 필요 시 추가), (3) PDF 색상은 라이트 고정 상수 한 곳, (4) 완전한 픽셀 일치는 목표가 아니며 "정보 구조·금액 동일"을 합격 기준으로 한다, (5) 샘플 5종 화면/PDF 대조 체크리스트.

---

## 9. 마일스톤

| 단계 | 작업 | 완료 기준 |
| --- | --- | --- |
| M0 준비 | Notion 통합 생성, 두 DB 생성(6.1 스키마), 두 DB에 Connection 연결, 샘플 견적서 5종 입력, 환경 변수 3종, 의존성 설치 | 로컬 스크립트/임시 코드로 두 데이터 소스 쿼리 성공 (ObjectNotFound 없음) |
| M1 도메인 레이어 | `lib/invoice` (zod 스키마, 계산, 표기) | 6.4 예시 4건을 전부 통과 (임시 스크립트 또는 vitest), `tsc` 통과 |
| M2 Notion 어댑터 | `lib/notion` (client, env, schema, mappers, errors, `getInvoiceByToken`) | 유효/무효/초안/취소/중복 토큰 5케이스가 기대 결과 반환, 25개 초과 항목 샘플 전량 조회 |
| M3 웹 뷰 | `(invoice)` 그룹, 레이아웃, 상세 페이지, 상태 화면, 반응형·다크 | 360/768/1280px에서 깨짐 없음, 라이트/다크 확인, 로딩·404·오류·빈 항목·취소·만료 화면 확인 (Playwright MCP) |
| M4 캐싱 | `use cache`/`cacheLife`/`cacheTag` 적용, 부정 결과 단기 캐시 | `npm run build` 성공(prerender 오류 없음), Notion 수정 후 2분 이내 반영 |
| M5 PDF | 폰트 등록, 템플릿, Route Handler | 샘플 5종 PDF에서 한글/금액 정확, 10개 이상 항목 다중 페이지, 파일명 `INV-n.pdf`, 배포 환경에서 동작 |
| M6 마감 | noindex/Referrer-Policy, 로그 마스킹, 스타터 정리(D7), `config/site.ts`/문서/`.env.example` 갱신, 안내 홈, 배포 | 성공 기준 3개 측정 완료, `lint`/`tsc`/`build` 통과 |
| M7 (P1) | 인쇄 보기, 웹훅 재검증 | 인쇄 미리보기에서 표 잘림 없음, 서명 오류 401 |

각 단계는 코드 변경 후 `code-reviewer` 서브에이전트 리뷰를 거친다 (CLAUDE.md 규칙).

---

## 10. 리스크, 가정, 열린 질문

### 10.1 리스크

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| 통합이 DB에 연결되지 않음 (`object_not_found` 404) | 데이터 조회 불가 | M0 체크리스트에 두 DB 연결 확인 포함, 설정 오류 로그 구분 |
| 데이터베이스 ID와 데이터 소스 ID 혼동 | 쿼리 실패 | 환경 변수 이름에 DATA_SOURCE 명시, 문서화 |
| 임의 토큰 대량 요청 -> Notion 레이트 리밋 소진 | 정상 사용자 장애 | 형식 사전 검증, 부정 결과 캐시, 필요 시 방화벽/HMAC 토큰 전환(D1-B) |
| 서버리스에서 캐시 미유지 | 요청마다 Notion 2회 호출 | 저트래픽 가정, 필요 시 `use cache: remote`(D3) |
| 속성 이름 변경·status 옵션 이름 변경 | 파싱 실패 | 이름 상수·zod enum 한 곳 관리, 알 수 없는 상태는 404 + 로그 |
| 한글 폰트 번들/PDF 렌더링 문제 | PDF 품질·배포 실패 | M5에서 조기 검증, 대체 수단 (c) |
| 웹과 PDF 템플릿 이중 관리 | 불일치 | 공유 계산/표기/라벨 상수, 대조 체크리스트 |
| 링크 유출 | 견적서 노출 | 추측 불가 토큰, 상태·토큰으로 즉시 폐기, `no-referrer` |

### 10.2 가정

- 작성자 1명, 동시 견적서 수십 건 이하, 클라이언트 트래픽은 낮다.
- 견적서는 부가세 별도 단일 세율이며 할인 항목이 없다.
- 클라이언트 승인은 작성자가 Notion에서 상태를 "승인"으로 바꾸는 방식이다.
- 모든 날짜는 KST 기준으로 표시한다.
- 웹 뷰의 한글은 시스템 폰트 폴백을 쓴다 (루트 레이아웃의 Geist는 latin subset만 로드). 한글 웹 폰트 도입은 별도 판단.

### 10.3 열린 질문

| 질문 | 상태 |
| --- | --- |
| 쿼리 엔드포인트의 휴지통 파라미터명 | 일부 해소: 요청 본문 `is_archived`(기본 false)로 확인. 응답에는 `in_trash`, `is_archived` 포함. SDK 5.x 타입에서 재확인 필요 |
| 쿼리 최대 `page_size` | 확인 필요 (쿼리 문서에서 최댓값 미확인. 100으로 알려져 있으나 검증 전). 커서 반복 구현으로 영향 최소화. 쿼리 1회 전체 상한은 10,000건 |
| title 필터 키 | 확인 필요. 본 설계는 `공유 토큰`(rich_text) 필터만 사용하므로 구현을 막지 않음 |
| `rich_text equals` 대소문자 구분, percent 숫자 표현, `cacheTag` 호출 시점 | 확인 필요 (M2에서 샘플로 검증) |
| 배포 환경(서버리스 여부) | 확정 (D3: Vercel). `use cache: remote` 제공 여부·비용은 확인 필요 |
| 클라이언트 접근 제어 방식 | 확정 (D1: 토큰 링크) |
| 웹훅 사용 여부 | 확정 (D6: MVP는 TTL 60초, 웹훅은 P1 후보). 웹훅 서명 헤더명·구독 이벤트 이름 확인 필요 |
| 계산 로직 테스트 도구 도입 (vitest) | 결정 필요 (선택) |
| 서비스명·발행자 정보·도메인 | 발행자 정보 위치는 확정 (D5: `src/config/issuer.ts`). 서비스명·실제 값·도메인은 결정 필요 |
| 고객 이메일을 클라이언트 화면에 표시할지 | 결정 필요 (기본: 표시 안 함) |

---

## 11. 부록

### 11.1 용어

| 용어 | 설명 |
| --- | --- |
| 데이터베이스 / 데이터 소스 | Notion `2025-09-03`부터 데이터베이스 아래에 데이터 소스가 있다. 쿼리는 데이터 소스 ID로 한다. 두 ID는 호환되지 않는다 |
| 통합(internal connection) 토큰 | Notion API 호출용 비밀 토큰. 서버 전용 |
| Connection 연결 | 통합을 대상 DB에 "Add connections"로 연결하는 작업. 안 하면 `object_not_found` |
| 공유 토큰 | 견적서 열람용 추측 불가 문자열. URL 경로에 사용 |
| `use cache` / `cacheLife` / `cacheTag` | Next.js Cache Components의 캐시 지시어와 수명·태그 API |
| 최소 단위 | 통화의 가장 작은 단위 (KRW 1원, USD 1센트). 계산을 정수로 수행하는 기준 |
| KST | Asia/Seoul 시간대 |

### 11.2 참고 링크

Notion 공식 문서 (작성 시점에 응답 확인, 구현 전 최신 여부 재확인):

- https://developers.notion.com/reference/intro
- https://developers.notion.com/docs/upgrade-guide-2025-09-03
- https://developers.notion.com/reference/query-a-data-source
- https://developers.notion.com/reference/post-database-query-filter
- https://developers.notion.com/reference/property-value-object
- https://developers.notion.com/reference/get-block-children
- https://developers.notion.com/reference/request-limits
- https://developers.notion.com/reference/status-codes
- https://developers.notion.com/docs/working-with-files-and-media
- https://developers.notion.com/reference/webhooks
- https://developers.notion.com/docs/authorization
- https://github.com/makenotion/notion-sdk-js

프로젝트 내 Next.js 16.4 문서 (구현 전 필독): `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-cache.md`, `.../use-cache-remote.md`, `.../04-functions/cacheLife.md`, `.../04-functions/cacheTag.md`, `.../04-functions/revalidateTag.md`.

PDF 라이브러리 문서 (확인 필요): https://react-pdf.org/
