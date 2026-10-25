import Link from "next/link";
import { Blocks } from "lucide-react";
import { cn } from "cn";

import { siteConfig } from "@/config/site";

export function Logo({
  className,
  onClick,
  href = siteConfig.guidePath,
}: {
  className?: string;
  onClick?: () => void;
  // 이동 경로 (기본값: 서비스 안내 페이지)
  href?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <Blocks className="size-5" />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
