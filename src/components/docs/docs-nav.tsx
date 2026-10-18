"use client";

import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { docsNav } from "@/config/site";

type DocsNavProps = {
  // 링크 클릭 시 호출 (모바일 시트 닫기 용도)
  onNavigate?: () => void;
};

// 문서 좌측 내비게이션 (현재 경로 활성 표시)
export function DocsNav({ onNavigate }: DocsNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="문서 메뉴" className="space-y-6">
      {docsNav.map((group) => (
        <div key={group.title} className="space-y-1">
          <h4 className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.title}
          </h4>
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
