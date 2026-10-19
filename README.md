## 노션(Notion) 기반 견적서 관리 시스템 MVP

노션 데이터베이스에 저장된 견적서를 웹에서 조회·관리하는 것을 목표로 합니다.

> **진행 상황**: 스타터킷의 문서·예제·로그인 코드를 정리하고 기본 골격(레이아웃, 다크모드, 안내 홈)만 남긴 초기화 단계입니다. 노션 연동과 견적서 기능은 구현 예정입니다. 요구사항은 [docs/PRD.md](docs/PRD.md)를 참고하세요.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router), React 19 |
| 언어 | TypeScript (strict) |
| 스타일 | Tailwind CSS 4, shadcn/ui (`base-nova`, Base UI 기반) |
| 아이콘 | lucide-react |
| 다크모드 | next-themes |
| 검증 | zod (도메인 스키마용, 구현 예정) |
| 토스트 | sonner |
| 데이터 소스 | Notion (연동 예정) |

## 시작하기

```bash
npm install
cp .env.example .env.local   # 필요 시 환경 변수 수정
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

## 환경 변수

현재는 `NEXT_PUBLIC_SITE_URL`만 사용하며, 없으면 `http://localhost:3000`입니다. 노션 연동에 필요한 변수는 기능이 추가될 때 `.env.example`에 함께 안내합니다.

## 문서

상세 내용은 `docs/` 폴더에 있습니다.

| 문서 | 내용 |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | MVP 요구사항, 데이터 모델, 라우트·기술 설계 |
| [docs/architecture.md](docs/architecture.md) | 폴더 구조(`src/`), 컴포넌트 계층, 코드 규칙, 스타터 정리 이력 |
| [docs/guide.md](docs/guide.md) | shadcn 컴포넌트, 다크모드·토스트 사용법, 환경 변수 |

## Claude Code 설정

- `.claude/settings.json`: 팀 공유 설정(Slack 알림 훅). `.env`에 `SLACK_WEBHOOK_URL`이 있을 때만 동작합니다.
- `.claude/settings.local.json`: 개인 로컬 설정이며 커밋하지 않습니다.
