import type { Metadata } from "next";

import { PageHeader } from "@/components/common/page-header";

import { SettingsForm } from "./settings-form";

export const metadata: Metadata = {
  title: "설정",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="설정" description="화면 옵션과 알림을 설정합니다. 값은 예시이며 저장 시 토스트만 표시됩니다." />
      <SettingsForm />
    </>
  );
}
