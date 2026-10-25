# 노션 설정 가이드

견적서 데이터는 노션 데이터베이스에서 읽어 옵니다. 이 문서는 노션 쪽에서 필요한 설정과, 클라이언트에게 보낼 견적서 URL을 만드는 방법을 정리합니다.

## 1. Integration과 환경 변수

노션 화면의 메뉴 이름은 버전에 따라 다를 수 있으니, 아래 이름과 다르면 노션 공식 문서를 확인하세요.

1. 노션의 내 통합(Integrations) 설정에서 내부 Integration을 만들고 시크릿을 복사합니다.
2. Invoices DB와 Items DB 페이지의 연결(Connections) 메뉴에서 이 Integration을 추가합니다. 연결하지 않으면 API로 읽을 수 없습니다.
   - Invoices DB를 연결하지 않으면 견적서가 404 화면으로 보입니다.
   - Items DB만 연결하지 않으면 항목 조회가 실패해 오류 화면이 나옵니다.
3. 프로젝트 루트의 `.env.local`에 아래 변수를 넣습니다. 이 파일은 Git에 올리지 않습니다. `NOTION_API_KEY`와 `NOTION_DATABASE_ID`는 필수이고, `NEXT_PUBLIC_SITE_URL`은 선택입니다.

```bash
# Integration 시크릿 (서버 전용, NEXT_PUBLIC_ 접두사 금지)
NOTION_API_KEY=
# Invoices 데이터베이스 ID (데이터 소스 ID가 아님)
NOTION_DATABASE_ID=
# 배포 도메인. 없으면 http://localhost:3000
NEXT_PUBLIC_SITE_URL=
```

`NOTION_DATABASE_ID`는 Invoices DB 주소의 32자리 ID입니다. 값이 빠지면 앱은 빌드는 통과하지만 견적서를 조회할 때 오류 화면이 나옵니다.

## 2. 데이터베이스 속성

속성 이름과 타입은 `docs/ROADMAP.md`의 "노션 DB 속성 명세"와 `src/lib/notion/properties.ts`가 기준입니다. 이름을 바꾸면 `properties.ts`도 같이 고쳐야 합니다.

- **Invoices**: 견적서 번호(제목), 클라이언트명(텍스트), 발행일(날짜), 유효기간(날짜), 상태(Status), 총 금액(숫자), 항목(Relation → Items)
- **Items**: 항목명(제목), 수량(숫자), 단가(숫자), 금액(수식 `수량 × 단가`, 결과가 숫자여야 하며 아니면 "-"로 표시), Invoices(역방향 Relation)

항목 조회는 Items의 역방향 Relation 이름(`Invoices`)에 의존합니다. Relation을 새로 만들 때는 역방향 속성 이름이 `Invoices`인지 직접 확인하세요. 이름이 다르면 견적서 화면이 오류 화면으로 바뀝니다.

## 3. 견적서 URL 만들기 (D5)

앱은 별도의 URL 생성 화면이 없습니다. 노션 Invoices DB에 수식 속성을 하나 추가해 URL을 만듭니다.

> 확인 결과: Invoices DB에 `견적서 URL` 수식 속성(`"http://localhost:3000/invoice/" + id()`)을 추가해 값을 읽었더니 `http://localhost:3000/invoice/4044512d22df80c899b5ffca83602b91`처럼 하이픈 없는 32자리 ID가 붙었고, 이 URL을 그대로 열면 해당 견적서가 표시됩니다(2026-10-25 확인). 배포 후에는 수식의 도메인을 배포 도메인으로 바꿔야 합니다.

1. Invoices DB에 속성을 추가합니다 (이름 `견적서 URL`, 타입: 수식). 현재 DB에는 이미 만들어져 있습니다.
2. 수식에 배포 도메인과 페이지 ID를 이어 붙입니다.

```
"https://<배포 도메인>/invoice/" + id()
```

3. 각 견적서의 `견적서 URL` 값을 복사해 클라이언트에게 보냅니다.

주의할 점
- 수식 안의 도메인은 배포 도메인과 같아야 하고, `NEXT_PUBLIC_SITE_URL`(메타데이터 기준 도메인과 안내 화면의 URL 예시)도 같은 값으로 맞춰 두는 것이 좋습니다. 로컬 확인에는 `"http://localhost:3000/invoice/" + id()`를 씁니다.
- 앱은 하이픈이 있는 ID(`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)와 없는 ID(32자리), 대소문자 구분 없이 같은 견적서로 열어 줍니다. 주소 뒤의 `/`나 `?utm_source=...` 같은 쿼리가 붙어도 열립니다.
- 노션 페이지 자체의 공유 링크(`https://www.notion.so/...`)는 앱 주소가 아니므로 클라이언트에게 보내지 않습니다.
- 이 속성은 앱이 읽지 않습니다. 코드는 페이지 ID만 사용하므로 속성을 추가해도 다른 설정을 바꿀 필요가 없습니다.

## 4. 문제가 생겼을 때

| 증상 | 확인할 것 |
| --- | --- |
| 견적서가 404 화면으로 보임 | 주소의 ID가 올바른지, Integration이 Invoices DB에 연결돼 있는지, 그 페이지가 Invoices DB의 것인지, `NOTION_DATABASE_ID`가 Invoices 데이터베이스 ID인지(다른 DB나 데이터 소스 ID면 모든 견적서가 404) |
| 오류 화면이 나옴 | `NOTION_API_KEY` 값, Integration이 Items DB에도 연결돼 있는지, 노션 속성 이름과 Items의 `Invoices` Relation 이름이 바뀌지 않았는지, 서버 로그 |
| 항목이 비어 있음 | Items의 `Invoices` Relation이 해당 견적서를 가리키는지 |
| 상태 배지가 안 보임 | 상태가 `대기`·`승인`·`거절`이 아니거나 비어 있음 |
