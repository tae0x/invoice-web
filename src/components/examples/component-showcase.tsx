"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Bell,
  ChevronDown,
  Inbox,
  Info,
  LogOut,
  Mail,
  Settings,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { DemoCard } from "@/components/examples/demo-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const roles = [
  { label: "개발자", value: "developer" },
  { label: "디자이너", value: "designer" },
  { label: "기획자", value: "pm" },
];

const members = [
  { name: "김민준", role: "개발자", status: "활성" },
  { name: "이서연", role: "디자이너", status: "활성" },
  { name: "박지호", role: "기획자", status: "대기" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function ButtonSection() {
  const [loading, setLoading] = useState(false);

  function handleClick() {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }

  return (
    <Section id="button" title="버튼 & 배지">
      <DemoCard title="버튼 변형" tag="Button">
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </DemoCard>
      <DemoCard title="크기 · 아이콘 · 로딩" tag="Button">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">XS</Button>
          <Button size="sm">SM</Button>
          <Button>Default</Button>
          <Button size="lg">LG</Button>
          <Button size="icon" aria-label="알림">
            <Bell />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Mail data-icon="inline-start" />
            메일 보내기
          </Button>
          <Button onClick={handleClick} disabled={loading}>
            {loading && <Spinner />}
            {loading ? "처리 중..." : "클릭해서 로딩"}
          </Button>
          <Button disabled>비활성</Button>
        </div>
      </DemoCard>
      <DemoCard title="배지" tag="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </DemoCard>
      <DemoCard title="아바타" tag="Avatar">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>홍</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>김</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </div>
      </DemoCard>
    </Section>
  );
}

function FormControlsSection() {
  const [role, setRole] = useState<string | null>("developer");
  const [agree, setAgree] = useState(false);
  const [notice, setNotice] = useState(true);

  return (
    <Section id="form" title="폼 컨트롤">
      <DemoCard title="텍스트 입력" tag="Input · Textarea">
        <Field>
          <FieldLabel htmlFor="showcase-name">이름</FieldLabel>
          <Input id="showcase-name" placeholder="홍길동" />
        </Field>
        <Field>
          <FieldLabel htmlFor="showcase-bio">소개</FieldLabel>
          <Textarea id="showcase-bio" placeholder="간단히 자신을 소개해 주세요." />
        </Field>
      </DemoCard>
      <DemoCard title="선택" tag="Select">
        <Select items={roles} value={role} onValueChange={setRole}>
          <SelectTrigger className="w-48" aria-label="직군">
            <SelectValue placeholder="직군 선택" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">선택값: {role ?? "-"}</p>
      </DemoCard>
      <DemoCard title="체크박스 · 스위치" tag="Checkbox · Switch">
        <div className="flex items-center gap-2">
          <Checkbox
            id="showcase-agree"
            checked={agree}
            onCheckedChange={setAgree}
          />
          <Label htmlFor="showcase-agree">이용약관에 동의합니다</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="showcase-notice"
            checked={notice}
            onCheckedChange={setNotice}
          />
          <Label htmlFor="showcase-notice">
            알림 {notice ? "켜짐" : "꺼짐"}
          </Label>
        </div>
      </DemoCard>
      <DemoCard title="라디오 그룹" tag="RadioGroup">
        <RadioGroup defaultValue="pro" aria-label="플랜">
          {["free", "pro", "team"].map((plan) => (
            <div key={plan} className="flex items-center gap-2">
              <RadioGroupItem value={plan} id={`showcase-plan-${plan}`} />
              <Label htmlFor={`showcase-plan-${plan}`}>
                {plan === "free" ? "무료" : plan === "pro" ? "프로" : "팀"}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </DemoCard>
    </Section>
  );
}

function NavigationSection() {
  return (
    <Section id="navigation" title="탭 · 아코디언">
      <DemoCard title="탭" tag="Tabs">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">계정</TabsTrigger>
            <TabsTrigger value="password">비밀번호</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="text-sm text-muted-foreground">
            계정 정보를 수정하는 영역입니다.
          </TabsContent>
          <TabsContent value="password" className="text-sm text-muted-foreground">
            비밀번호를 변경하는 영역입니다.
          </TabsContent>
        </Tabs>
      </DemoCard>
      <DemoCard title="아코디언" tag="Accordion">
        <Accordion defaultValue={["q1"]}>
          <AccordionItem value="q1">
            <AccordionTrigger>스타터킷에 무엇이 포함되나요?</AccordionTrigger>
            <AccordionContent>
              Next.js, Tailwind, shadcn/ui, 폼 검증, 전역 상태, 다크 모드가
              준비되어 있습니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>컴포넌트는 어떻게 추가하나요?</AccordionTrigger>
            <AccordionContent>
              npx shadcn@latest add 명령으로 필요한 컴포넌트를 추가합니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DemoCard>
    </Section>
  );
}

function OverlaySection() {
  return (
    <Section id="overlay" title="오버레이">
      <DemoCard title="다이얼로그 · 알럿 다이얼로그" tag="Dialog · AlertDialog">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              다이얼로그 열기
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>프로필 수정</DialogTitle>
                <DialogDescription>
                  변경할 이름을 입력하고 저장하세요.
                </DialogDescription>
              </DialogHeader>
              <Input placeholder="이름" aria-label="이름" />
              <DialogFooter>
                <Button onClick={() => toast.success("저장되었습니다.")}>
                  저장
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              삭제
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => toast.error("삭제되었습니다.")}
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DemoCard>
      <DemoCard title="시트" tag="Sheet">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            시트 열기
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>필터</SheetTitle>
              <SheetDescription>
                화면 가장자리에서 열리는 패널입니다.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </DemoCard>
      <DemoCard title="드롭다운 메뉴" tag="DropdownMenu">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            내 계정
            <ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>계정</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("설정을 선택했습니다.")}>
              <Settings />
              설정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("로그아웃 예시입니다.")}>
              <LogOut />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DemoCard>
      <DemoCard title="팝오버 · 툴팁" tag="Popover · Tooltip">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger render={<Button variant="outline" />}>
              팝오버
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>도움말</PopoverTitle>
                <PopoverDescription>
                  버튼 근처에 떠 있는 작은 패널입니다.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>
              툴팁
            </TooltipTrigger>
            <TooltipContent>마우스를 올리면 보입니다</TooltipContent>
          </Tooltip>
        </div>
      </DemoCard>
    </Section>
  );
}

function FeedbackSection() {
  const [progress, setProgress] = useState(13);

  // 진행률 데모: 마운트 후 값을 올려 애니메이션을 보여준다
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Section id="feedback" title="피드백">
      <DemoCard title="토스트" tag="sonner">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast("기본 토스트입니다.")}>
            기본
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("성공했습니다.")}
          >
            성공
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("문제가 발생했습니다.")}
          >
            에러
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info("알려드립니다.")}
          >
            정보
          </Button>
        </div>
      </DemoCard>
      <DemoCard title="알림 배너" tag="Alert">
        <Alert>
          <Info />
          <AlertTitle>안내</AlertTitle>
          <AlertDescription>변경 사항은 저장 후 반영됩니다.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>요청을 처리하지 못했습니다.</AlertDescription>
        </Alert>
      </DemoCard>
      <DemoCard title="진행률 · 스피너 · 스켈레톤" tag="Progress · Spinner · Skeleton">
        <Progress value={progress} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> 불러오는 중...
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </DemoCard>
      <DemoCard title="빈 상태" tag="Empty">
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>받은 알림이 없습니다</EmptyTitle>
            <EmptyDescription>새 소식이 오면 여기에 표시됩니다.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </DemoCard>
    </Section>
  );
}

function DataSection() {
  return (
    <Section id="data" title="데이터">
      <div className="md:col-span-2">
        <DemoCard title="테이블" tag="Table · Badge · Separator">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>직군</TableHead>
                <TableHead className="text-right">상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.name}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={member.status === "활성" ? "default" : "secondary"}
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <p className="text-xs text-muted-foreground">총 {members.length}명</p>
        </DemoCard>
      </div>
    </Section>
  );
}

// 컴포넌트 쇼케이스 전체: 상호작용이 있는 컴포넌트를 모두 클라이언트에서 렌더링한다
export function ComponentShowcase() {
  return (
    <div className="space-y-10">
      <ButtonSection />
      <FormControlsSection />
      <NavigationSection />
      <OverlaySection />
      <FeedbackSection />
      <DataSection />
    </div>
  );
}
