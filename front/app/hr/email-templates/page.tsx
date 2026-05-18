import type { Metadata } from "next";
import { fetchEmailTemplatesServer } from "@/app/server/hr/email-template.server";
import EmailTemplateManagerClient from "@/components/hr/email-templates/EmailTemplateManagerClient";
import EmailTemplatePageHero from "@/components/hr/email-templates/EmailTemplatePageHero";

export const metadata: Metadata = {
  title: "이메일 템플릿 | HR Portal",
  description: "반복 발송 메일 문구를 관리하고 초대 메일 화면에서 재사용합니다.",
};

export default async function EmailTemplatesPage() {
  const templates = await fetchEmailTemplatesServer();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 animate-in fade-in duration-500 sm:gap-6">
      <EmailTemplatePageHero templateCount={templates.length} />
      <EmailTemplateManagerClient initialTemplates={templates} />
    </div>
  );
}
