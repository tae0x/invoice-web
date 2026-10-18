# 사용 가이드

## shadcn/ui 컴포넌트

이미 설치된 컴포넌트:

- **레이아웃**: separator, sheet, dropdown-menu, tooltip, skeleton, avatar, badge, card, breadcrumb, navigation-menu, sidebar, sonner
- **폼**: input, label, textarea, select, checkbox, radio-group, switch, field
- **일반 UI**: dialog, alert-dialog, alert, popover, tabs, accordion, table, progress, spinner, empty

추가 설치(예: `calendar`, `chart`, `command`, `pagination`, `carousel`, `combobox`, `drawer`, `resizable`):

```bash
npx shadcn@latest add calendar chart
```

> 이 프로젝트는 Radix가 아닌 **Base UI** 기반입니다. Radix 예제의 `asChild` 대신 `render` prop을 사용합니다.
>
> ```tsx
> <Button render={<Link href="/docs" />} nativeButton={false}>문서</Button>
> ```

## 주요 기능 사용법

### 다크모드

`ThemeProvider`가 루트 레이아웃에 적용되어 있고, `ThemeToggle`로 라이트/다크/시스템을 전환합니다. 컴포넌트에서 직접 쓸 때는 `next-themes`의 `useTheme()`을 사용합니다.

### 토스트

```tsx
import { toast } from "sonner";

toast.success("저장되었습니다.");
```

### 폼 검증

`src/app/(marketing)/login/login-form.tsx`에 react-hook-form + zod + shadcn `Field` 조합 예제가 있습니다. 회원가입 폼(`src/app/(marketing)/signup/signup-form.tsx`)도 같은 패턴입니다.

### 전역 상태 (zustand)

`src/stores/notification-store.ts`가 예제입니다. 사이드바 앱 셸 예제에서 상단바의 알림 배지와 "알림 추가" 버튼이 같은 스토어를 공유합니다. 스토어는 **클라이언트 컴포넌트에서만** 사용하세요.

### 범용 훅 (usehooks-ts)

`useLocalStorage`, `useMediaQuery`, `useDebounceValue` 등을 제공합니다. SSR 환경에서는 hydration 불일치를 막기 위해 `initializeWithValue: false` 옵션을 사용합니다 (`src/app/(app-shell)/examples/sidebar-layout/settings/settings-form.tsx` 참고).

## 환경 변수

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 사이트 URL (metadata 절대 경로 기준) |
