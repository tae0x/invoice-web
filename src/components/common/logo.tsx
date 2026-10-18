import Link from "next/link";
import { Blocks } from "lucide-react";
import { cn } from "cn";

import { siteConfig } from "@/config/site";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <Blocks className="size-5" />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
