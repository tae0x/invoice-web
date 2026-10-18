"use client";

// 루트 레이아웃 자체에서 발생한 에러를 처리한다.
// 루트 레이아웃을 대체하므로 html/body를 직접 정의해야 하고, 전역 스타일은 적용되지 않는다.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="ko">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h2>문제가 발생했습니다</h2>
        <button onClick={() => retry()}>다시 시도</button>
      </body>
    </html>
  );
}
