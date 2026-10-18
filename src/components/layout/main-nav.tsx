"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { mainNav } from "@/config/site";

// 데스크톱 상단 네비게이션 (현재 경로 활성 표시)
export function MainNav() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {mainNav.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink
              active={
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              }
              render={<Link href={item.href} />}
            >
              {item.title}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
