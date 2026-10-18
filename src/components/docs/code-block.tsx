"use client";

import { Check, Copy } from "lucide-react";
import { cn } from "cn";
import { useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import { Button } from "@/components/ui/button";

type CodeBlockProps = {
  code: string;
  // 파일명 등 상단에 표시할 제목
  title?: string;
  className?: string;
};

// 코드 + 복사 버튼 (하이라이터 없이 가볍게 유지)
export function CodeBlock({ code, title, className }: CodeBlockProps) {
  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copy(code);
    if (!ok) {
      toast.error("복사에 실패했습니다.");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/40", className)}>
      <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {title ?? "code"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="코드 복사"
          onClick={handleCopy}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
