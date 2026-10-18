"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

import { DocsNav } from "@/components/docs/docs-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// 모바일에서 문서 메뉴를 여는 시트 (md 이상에서는 숨김)
export function DocsMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="sm" className="md:hidden" />}
      >
        <BookOpen data-icon="inline-start" />
        문서 메뉴
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>문서</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <DocsNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
