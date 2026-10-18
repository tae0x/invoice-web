"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes 래퍼: class 기반 다크모드 (globals.css의 .dark 변형과 연결)
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
