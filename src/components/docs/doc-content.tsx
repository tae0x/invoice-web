import { cn } from "cn";

type DocContentProps = React.ComponentProps<"div"> & {
  title: string;
  description?: string;
};

// 문서 본문 래퍼: 제목 + 하위 h2/h3/p/ul/code 기본 타이포를 한 곳에서 정의한다
export function DocContent({
  title,
  description,
  className,
  children,
  ...props
}: DocContentProps) {
  return (
    <article className="min-w-0 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </header>
      <div
        className={cn(
          "space-y-4 text-[15px] leading-7",
          "[&_h2]:mt-10 [&_h2]:scroll-mt-20 [&_h2]:border-b [&_h2]:pb-2 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
          "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-6",
          "[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[13px]",
          "[&_a:not([data-slot])]:font-medium [&_a:not([data-slot])]:underline [&_a:not([data-slot])]:underline-offset-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </article>
  );
}
