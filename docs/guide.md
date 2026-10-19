# 사용 가이드

## shadcn/ui 컴포넌트

현재 설치된 컴포넌트:

- **레이아웃**: separator, sheet, dropdown-menu, tooltip, skeleton, card, badge, navigation-menu, sonner
- **일반 UI**: button, alert, table, spinner, empty

추가 설치(예: `dialog`, `tabs`, `input`, `calendar`):

```bash
npx shadcn@latest add dialog tabs
```

> 이 프로젝트는 Radix가 아닌 **Base UI** 기반입니다. Radix 예제의 `asChild` 대신 `render` prop을 사용합니다.
>
> ```tsx
> <Button render={<Link href="/" />} nativeButton={false}>홈</Button>
> ```

## 주요 기능 사용법

### 다크모드

`ThemeProvider`가 루트 레이아웃에 적용되어 있고, `ThemeToggle`로 라이트/다크/시스템을 전환합니다. 컴포넌트에서 직접 쓸 때는 `next-themes`의 `useTheme()`을 사용합니다.

### 토스트

```tsx
import { toast } from "sonner";

toast.success("저장되었습니다.");
```

## 환경 변수

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (metadata 절대 경로 기준) |

Notion 연동에 필요한 변수는 구현 단계에서 `.env.example`과 함께 이 표에 추가합니다(목록은 `docs/PRD.md` 8.3 참고).
