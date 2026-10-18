import {
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export type SidebarNavItem = NavItem & {
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

// 사이트 기본 정보 (metadata, 헤더, 푸터에서 공유)
export const siteConfig = {
  name: "Next.js Starter",
  description:
    "Next.js 16, TypeScript, Tailwind CSS, shadcn/ui로 만든 모던 웹 스타터킷",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

// 마케팅 영역 상단 네비게이션
export const mainNav: NavItem[] = [
  { title: "홈", href: "/" },
  { title: "문서", href: "/docs" },
  { title: "예제", href: "/examples" },
  { title: "로그인", href: "/login" },
];

// 문서 사이드 네비게이션 (순서가 곧 이전/다음 문서 순서)
export const docsNav: NavGroup[] = [
  {
    title: "시작하기",
    items: [
      {
        title: "시작하기",
        href: "/docs/getting-started",
        description: "설치부터 개발 서버 실행까지",
      },
      {
        title: "프로젝트 구조",
        href: "/docs/project-structure",
        description: "폴더 계층과 코드 작성 규칙",
      },
    ],
  },
  {
    title: "가이드",
    items: [
      {
        title: "UI 컴포넌트",
        href: "/docs/components",
        description: "설치된 shadcn/ui 컴포넌트와 사용법",
      },
      {
        title: "훅 라이브러리",
        href: "/docs/hooks",
        description: "usehooks-ts 훅 목록과 라이브 데모",
      },
      {
        title: "폼 & 검증",
        href: "/docs/forms",
        description: "React Hook Form + Zod",
      },
      {
        title: "상태 관리",
        href: "/docs/state",
        description: "Zustand 전역 상태",
      },
      {
        title: "테마",
        href: "/docs/theming",
        description: "다크 모드와 디자인 토큰",
      },
    ],
  },
];

// 문서 페이지를 평탄화한 목록 (이전/다음 링크 계산용)
export const docsPages: NavItem[] = docsNav.flatMap((group) => group.items);

// 예제 목록 (예제 인덱스 카드와 내비게이션에서 공유)
export const examplesNav: NavItem[] = [
  {
    title: "컴포넌트 쇼케이스",
    href: "/examples/components",
    description: "설치된 UI 컴포넌트를 직접 눌러보며 확인합니다.",
  },
  {
    title: "레이아웃 예제",
    href: "/examples/layouts",
    description: "헤더/푸터, 사이드바, 2단 등 자주 쓰는 레이아웃 패턴입니다.",
  },
  {
    title: "폼 예제",
    href: "/examples/forms",
    description: "React Hook Form + Zod 검증이 적용된 가입 폼입니다.",
  },
  {
    title: "훅 예제",
    href: "/examples/hooks",
    description: "usehooks-ts 훅을 활용한 동작 데모입니다.",
  },
  {
    title: "사이드바 앱 셸",
    href: "/examples/sidebar-layout",
    description: "사이드바 + 상단바 + 전역 상태가 연결된 앱 레이아웃입니다.",
  },
];

// 사이드바 앱 셸 예제 네비게이션
export const shellNav: SidebarNavItem[] = [
  { title: "개요", href: "/examples/sidebar-layout", icon: LayoutDashboard },
  {
    title: "설정",
    href: "/examples/sidebar-layout/settings",
    icon: Settings,
  },
];

// 브레드크럼에서 경로 세그먼트를 표시 이름으로 바꾸기 위한 맵
export const routeLabels: Record<string, string> = {
  docs: "문서",
  "getting-started": "시작하기",
  "project-structure": "프로젝트 구조",
  components: "UI 컴포넌트",
  hooks: "훅 라이브러리",
  forms: "폼 & 검증",
  state: "상태 관리",
  theming: "테마",
  examples: "예제",
  layouts: "레이아웃",
  "sidebar-layout": "사이드바 앱 셸",
  settings: "설정",
  login: "로그인",
  signup: "회원가입",
};
