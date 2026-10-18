"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { docsPages } from "@/config/site";

// 현재 문서 기준 이전/다음 문서 링크
export function DocPager() {
  const pathname = usePathname();
  const index = docsPages.findIndex((page) => page.href === pathname);

  if (index === -1) return null;

  const prev = docsPages[index - 1];
  const next = docsPages[index + 1];

  return (
    <div className="mt-12 grid gap-4 border-t pt-6 sm:grid-cols-2">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="size-3" />
            이전
          </span>
          <span className="font-medium">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-lg border p-4 text-right transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            다음
            <ArrowRight className="size-3" />
          </span>
          <span className="font-medium">{next.title}</span>
        </Link>
      )}
    </div>
  );
}
