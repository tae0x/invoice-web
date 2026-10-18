"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/common/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { shellNav, siteConfig } from "@/config/site";

// 사이드바 앱 셸 예제의 사이드바 (현재 경로 활성 표시)
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo className="px-2 py-1.5" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shellNav.map((item) => {
                const Icon = item.icon;
                // 개요 경로는 하위 경로(설정)와 겹치므로 정확히 일치할 때만 활성
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
          {siteConfig.name}
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
