"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CopyInvoiceLinkButtonProps = {
  invoiceNumber: string;
  // 복사할 공개 URL (서버 DAL이 buildInvoiceUrl로 만든 값, ID 형식이나 기준 URL이 올바르지 않으면 null)
  url: string | null;
};

type CopyStatus = "idle" | "copied" | "failed";

// 체크 아이콘을 보여 주는 시간(ms)
const COPIED_RESET_MS = 2000;

// 링크 복사 버튼 (D19)
// 클릭 핸들러에서 Clipboard API를 호출한다 (HTTPS·localhost에서만 동작). 실패하면 오류 토스트와 함께
// 읽기 전용 입력란에 링크를 보여 주고 전체 선택해 직접 복사할 수 있게 한다
// 토스트(sonner)는 aria-live 영역이라 읽히지만, 토스트가 사라진 뒤에도 남도록 버튼 옆 live 영역에도 알린다
export function CopyInvoiceLinkButton({
  invoiceNumber,
  url,
}: CopyInvoiceLinkButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  // 복사 시도 결과가 나올 때마다 늘리는 카운터: live 영역 문구의 key로 써서 같은 결과가 반복돼도
  // 매번 새 노드로 읽히게 하고, 연속 실패에서 입력란 선택 effect도 다시 실행한다
  // (status를 idle로 비웠다 채우는 방식은 같은 틱의 상태 변경이 합쳐지거나 입력란이 깜빡이므로 쓰지 않는다)
  const [resultSeq, setResultSeq] = useState(0);
  // 언마운트 여부 (await 중 언마운트되면 이후 상태 변경과 타이머 등록을 하지 않는다)
  const isMountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const disabledReasonId = useId();
  const label = `견적서 ${invoiceNumber} 링크 복사`;
  const disabledReason =
    "견적서 ID 형식이나 기준 URL(NEXT_PUBLIC_SITE_URL)이 올바르지 않아 링크를 만들 수 없습니다";

  // 토스트 고정 id: 같은 견적서를 연속으로 눌러도 토스트가 쌓이지 않고 기존 토스트가 갱신된다
  const toastId = `copy-invoice-link-${invoiceNumber}`;

  // 마운트 표시와 언마운트 시 체크 아이콘 타이머 정리 (Strict Mode의 재마운트에서도 true로 복구한다)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // 실패할 때마다(이미 실패 상태여도) 링크를 전체 선택한다 (키보드·마우스 모두 바로 복사할 수 있게)
  useEffect(() => {
    if (status === "failed") inputRef.current?.select();
  }, [status, resultSeq]);

  async function handleCopy() {
    if (url === null) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      // 비보안 컨텍스트이거나 API가 없으면 시도하지 않고 실패로 처리한다
      if (!window.isSecureContext || !navigator.clipboard) {
        throw new Error("clipboard_unavailable");
      }
      await navigator.clipboard.writeText(url);
    } catch {
      if (!isMountedRef.current) return;
      // 권한 거부(NotAllowedError) 등 모든 실패를 같은 안내로 처리한다
      setStatus("failed");
      setResultSeq((seq) => seq + 1);
      toast.error(
        "링크를 복사하지 못했습니다. 아래 링크를 직접 복사해 주세요",
        {
          id: toastId,
        },
      );
      return;
    }

    // 복사하는 사이 목록에서 사라졌다면 상태·타이머를 만들지 않는다
    if (!isMountedRef.current) return;
    setStatus("copied");
    setResultSeq((seq) => seq + 1);
    toast.success("링크를 복사했습니다", { id: toastId });
    timerRef.current = setTimeout(() => setStatus("idle"), COPIED_RESET_MS);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={label}
        aria-describedby={url === null ? disabledReasonId : undefined}
        // 좁은 화면에서는 아이콘만 보이므로 title로 이름을 보충한다
        title={url === null ? disabledReason : label}
        disabled={url === null}
        onClick={handleCopy}
      >
        {status === "copied" ? (
          <Check aria-hidden="true" />
        ) : (
          <Copy aria-hidden="true" />
        )}
        <span className="hidden lg:inline">링크 복사</span>
      </Button>
      {/* 비활성 사유 (비활성 버튼은 포커스를 받지 못하므로 title과 함께 스크린 리더용 텍스트로 둔다) */}
      {url === null && (
        <span id={disabledReasonId} className="sr-only">
          {disabledReason}
        </span>
      )}
      {/* 복사 결과를 스크린 리더에 알리는 시각적으로 숨긴 영역 */}
      <span className="sr-only" aria-live="polite">
        {status !== "idle" && (
          <span key={`${status}-${resultSeq}`}>
            {status === "copied"
              ? "링크를 복사했습니다"
              : "복사하지 못했습니다. 아래 링크를 직접 복사해 주세요"}
          </span>
        )}
      </span>
      {/* 복사 실패 시 링크를 보여 주는 읽기 전용 입력란 */}
      {status === "failed" && url !== null && (
        <Input
          ref={inputRef}
          readOnly
          value={url}
          aria-label={`견적서 ${invoiceNumber} 링크`}
          className="w-56 max-w-full min-w-0 text-xs"
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
