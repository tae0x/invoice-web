"use client";

import { useRef, useState, type RefObject } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import {
  useCopyToClipboard,
  useCountdown,
  useCounter,
  useDebounceValue,
  useHover,
  useLocalStorage,
  useMediaQuery,
  useOnClickOutside,
  useStep,
  useToggle,
  useWindowSize,
} from "usehooks-ts";

import { DemoCard } from "@/components/examples/demo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

export function CounterDemo() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <DemoCard
      title="카운터"
      description="숫자 상태와 증감 함수를 한 번에 제공합니다."
      tag="useCounter"
    >
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={decrement} aria-label="감소">
          <Minus />
        </Button>
        <span className="w-12 text-center text-xl font-semibold tabular-nums">
          {count}
        </span>
        <Button variant="outline" size="icon" onClick={increment} aria-label="증가">
          <Plus />
        </Button>
        <Button variant="ghost" size="icon" onClick={reset} aria-label="초기화">
          <RotateCcw />
        </Button>
      </div>
    </DemoCard>
  );
}

export function ToggleDemo() {
  const [on, toggle] = useToggle(false);

  return (
    <DemoCard
      title="토글"
      description="불리언 상태를 뒤집는 함수를 제공합니다."
      tag="useToggle"
    >
      <div className="flex items-center gap-3">
        <Switch checked={on} onCheckedChange={toggle} aria-label="토글" />
        <Badge variant={on ? "default" : "secondary"}>{on ? "ON" : "OFF"}</Badge>
      </div>
    </DemoCard>
  );
}

export function DebounceDemo() {
  const [text, setText] = useState("");
  const [debounced] = useDebounceValue(text, 500);

  return (
    <DemoCard
      title="디바운스 입력"
      description="입력을 멈추고 0.5초 뒤에 값이 반영됩니다. 검색 API 호출 횟수를 줄일 때 씁니다."
      tag="useDebounceValue"
    >
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="검색어를 입력하세요"
        aria-label="검색어"
      />
      <p className="text-sm text-muted-foreground">
        입력값: <span className="text-foreground">{text || "-"}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        디바운스된 값: <span className="text-foreground">{debounced || "-"}</span>
      </p>
    </DemoCard>
  );
}

export function LocalStorageDemo() {
  // SSR hydration 불일치를 막기 위해 초기 렌더에서는 localStorage를 읽지 않는다
  const [name, setName, removeName] = useLocalStorage("demo:name", "", {
    initializeWithValue: false,
  });

  return (
    <DemoCard
      title="localStorage 동기화"
      description="값을 입력하고 새로고침해도 유지됩니다. 다른 탭과도 동기화됩니다."
      tag="useLocalStorage"
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="이름을 입력하세요"
        aria-label="이름"
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          저장된 값: <span className="text-foreground">{name || "-"}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={removeName}>
          삭제
        </Button>
      </div>
    </DemoCard>
  );
}

export function MediaQueryDemo() {
  const isDesktop = useMediaQuery("(min-width: 768px)", {
    initializeWithValue: false,
  });
  const { width, height } = useWindowSize({ initializeWithValue: false });

  return (
    <DemoCard
      title="반응형 감지"
      description="브라우저 창 크기를 조절해 보세요."
      tag="useMediaQuery · useWindowSize"
    >
      <p className="text-sm">
        레이아웃:{" "}
        <Badge variant="secondary">{isDesktop ? "데스크톱 (≥768px)" : "모바일"}</Badge>
      </p>
      <p className="text-sm text-muted-foreground">
        창 크기: {width ?? "-"} × {height ?? "-"}
      </p>
    </DemoCard>
  );
}

export function CopyDemo() {
  const [copiedText, copy] = useCopyToClipboard();
  const sample = "npm install";

  return (
    <DemoCard
      title="클립보드 복사"
      description="텍스트를 복사하고 복사된 값을 확인합니다."
      tag="useCopyToClipboard"
    >
      <div className="flex items-center gap-2">
        <code className="rounded bg-muted px-2 py-1 font-mono text-sm">{sample}</code>
        <Button variant="outline" size="sm" onClick={() => copy(sample)}>
          복사
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        복사된 값: <span className="text-foreground">{copiedText ?? "-"}</span>
      </p>
    </DemoCard>
  );
}

export function CountdownDemo() {
  const [count, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: 10,
    intervalMs: 1000,
  });

  return (
    <DemoCard
      title="카운트다운"
      description="10초에서 0까지 1초 간격으로 줄어듭니다."
      tag="useCountdown"
    >
      <Progress value={(count / 10) * 100} />
      <p className="text-2xl font-semibold tabular-nums">{count}초</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={startCountdown}>
          시작
        </Button>
        <Button size="sm" variant="outline" onClick={stopCountdown}>
          정지
        </Button>
        <Button size="sm" variant="ghost" onClick={resetCountdown}>
          리셋
        </Button>
      </div>
    </DemoCard>
  );
}

export function InteractionDemo() {
  // usehooks-ts 타입은 RefObject<T | null>을 받지 않아 캐스팅이 필요하다
  const hoverRef = useRef<HTMLDivElement>(null);
  const outsideRef = useRef<HTMLDivElement>(null);
  const [outsideCount, setOutsideCount] = useState(0);
  const hovered = useHover(hoverRef as RefObject<HTMLDivElement>);

  useOnClickOutside(outsideRef as RefObject<HTMLDivElement>, () =>
    setOutsideCount((value) => value + 1)
  );

  return (
    <DemoCard
      title="호버 · 바깥 클릭"
      description="요소 위에 마우스를 올리거나, 상자 바깥을 클릭해 보세요."
      tag="useHover · useOnClickOutside"
    >
      <div
        ref={hoverRef}
        className="rounded-lg border border-dashed p-4 text-center text-sm transition-colors data-[hovered=true]:bg-muted"
        data-hovered={hovered}
      >
        {hovered ? "마우스가 올라와 있습니다" : "여기에 마우스를 올려보세요"}
      </div>
      <div ref={outsideRef} className="rounded-lg border p-4 text-center text-sm">
        이 상자 바깥을 클릭한 횟수: <span className="font-semibold">{outsideCount}</span>
      </div>
    </DemoCard>
  );
}

const steps = ["계정", "프로필", "완료"];

export function StepDemo() {
  const [step, { goToNextStep, goToPrevStep, reset, canGoToNextStep, canGoToPrevStep }] =
    useStep(steps.length);

  return (
    <DemoCard
      title="단계 이동"
      description="마법사(Wizard) UI의 단계 상태를 관리합니다."
      tag="useStep"
    >
      <ol className="flex items-center gap-2 text-sm">
        {steps.map((label, index) => (
          <li key={label}>
            <Badge variant={index + 1 === step ? "default" : "outline"}>
              {index + 1}. {label}
            </Badge>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={goToPrevStep} disabled={!canGoToPrevStep}>
          이전
        </Button>
        <Button size="sm" onClick={goToNextStep} disabled={!canGoToNextStep}>
          다음
        </Button>
        <Button size="sm" variant="ghost" onClick={reset}>
          처음으로
        </Button>
      </div>
    </DemoCard>
  );
}
