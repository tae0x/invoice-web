"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { GeneratePdfRequest } from "@/types/pdf";

type DownloadPdfButtonProps = {
  notionPageId: string;
  // 저장 파일명(`${invoiceNumber}.pdf`, 비어 있으면 invoice.pdf)에 쓴다
  invoiceNumber: string;
};

// 견적서 PDF 다운로드 버튼: 서버에서 PDF를 생성해 받아 저장한다 (같은 페이지에 머문다)
export function DownloadPdfButton({
  notionPageId,
  invoiceNumber,
}: DownloadPdfButtonProps) {
  const [isPending, setIsPending] = useState(false);
  // state 갱신 전에 들어오는 연속 클릭을 막는 가드
  const isRequestingRef = useRef(false);

  async function handleDownload() {
    if (isRequestingRef.current) return;
    isRequestingRef.current = true;
    setIsPending(true);

    try {
      const body: GeneratePdfRequest = { notionPageId };
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // 상태 코드가 정상이어도 PDF가 아닌 응답(오류 페이지 등)이면 실패로 본다
      const contentType = res.headers.get("content-type") ?? "";
      // 호출 빈도 제한(429)은 다시 시도하라는 안내를 따로 보여 준다
      if (res.status === 429) {
        toast.error("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      if (!res.ok || !contentType.includes("application/pdf")) {
        throw new Error(`PDF 생성 실패 (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoiceNumber.trim() || "invoice"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // click() 직후 동기로 해제하면 일부 브라우저에서 다운로드가 시작되기 전에 URL이 사라질 수 있어 다음 태스크로 미룬다
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (error) {
      console.error(error);
      toast.error("PDF를 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      isRequestingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDownload}
      disabled={isPending}
      // 생성 중에도 포커스를 유지한다(disabled는 aria-disabled로 표시됨). 중복 클릭은 위 ref 가드가 막는다
      focusableWhenDisabled
      aria-busy={isPending}
      // 네이티브 disabled가 아니므로 disabled: 변형이 적용되지 않아 aria-disabled로 같은 표시를 준다
      className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Spinner
            role="presentation"
            aria-label={undefined}
            aria-hidden="true"
          />
          PDF 생성 중
        </>
      ) : (
        <>
          <Download aria-hidden="true" />
          PDF 다운로드
        </>
      )}
    </Button>
  );
}
