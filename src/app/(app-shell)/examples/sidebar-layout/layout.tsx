import { AppSidebar } from "@/components/layout/app-sidebar";
import { ShellHeader } from "@/components/layout/shell-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// 사이드바 앱 셸 레이아웃: 사이드바 + 상단바 + 본문
export default function SidebarLayoutShell({
  children,
}: LayoutProps<"/examples/sidebar-layout">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ShellHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
