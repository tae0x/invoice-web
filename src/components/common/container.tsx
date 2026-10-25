import { cn } from "cn";

// 페이지 콘텐츠 최대 너비와 좌우 여백을 통일하는 컨테이너
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
