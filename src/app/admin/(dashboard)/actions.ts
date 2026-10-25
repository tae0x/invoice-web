"use server";

import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";
import { deleteAdminSession } from "@/lib/auth/session";

// 로그아웃 Server Action: 세션 쿠키를 지우고 로그인 화면으로 이동한다
// 이미 세션이 없어도 같은 결과이므로 별도 검사를 하지 않는다
export async function logout(): Promise<void> {
  await deleteAdminSession();
  redirect(siteConfig.adminLoginPath);
}
