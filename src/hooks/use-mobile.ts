import { useMediaQuery } from "usehooks-ts"

const MOBILE_BREAKPOINT = 768

// shadcn Sidebar가 사용하는 훅 (usehooks-ts의 useMediaQuery로 구현)
// initializeWithValue: false -> 서버/클라이언트 첫 렌더를 일치시켜 hydration 불일치를 방지
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, {
    initializeWithValue: false,
  })
}
