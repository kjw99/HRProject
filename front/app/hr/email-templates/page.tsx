import { Metadata } from "next";
import { fetchEmailTemplatesServer } from "@/app/server/hr/email-template.server";
import EmailTemplateManagerClient from "@/components/hr/email-templates/EmailTemplateManagerClient";
import HrPageHero from "@/components/hr/shared/HrPageHero";
import type { HrQuickLink } from "@/types/hr-ui";

export const metadata: Metadata = {
  title: "이메일 템플릿 | HR Portal",
  description: "반복 발송 메일 문구를 관리하고 초대 메일 화면에서 재사용합니다.",
};

const QUICK_LINKS: readonly HrQuickLink[] = [
  { href: "/hr", label: "대시보드", icon: "grid-alt" },
  { href: "/hr/applicants", label: "지원자", icon: "group" },
  { href: "/invitation-preview", label: "초대 메일", icon: "mail-send" },
];

const RECOMMENDED_VARIABLES =
  "{candidate_name}, {candidate_email}, {invitation_url}";

export default async function EmailTemplatesPage() {
  const templates = await fetchEmailTemplatesServer();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 animate-in fade-in duration-500 sm:gap-6">
      <HrPageHero
        id="hr-email-templates-title"
        theme="amber"
        badge={{ icon: "envelope", label: "HR · Mail Workflow" }}
        icon="mail-send"
        title="이메일 템플릿 관리"
        description="반복 발송하는 메일 문구를 모아두고, 초대 메일 화면에서 바로 불러와 렌더 미리보기와 함께 사용할 수 있습니다."
        quickLinks={QUICK_LINKS}
        stats={[
          {
            label: "저장된 템플릿",
            icon: "collection",
            value: templates.length,
          },
          {
            label: "권장 변수",
            icon: "code-alt",
            value: (
              <span className="text-sm font-bold leading-snug">
                {RECOMMENDED_VARIABLES}
              </span>
            ),
          },
        ]}
      />

      <EmailTemplateManagerClient initialTemplates={templates} />
    </div>
  );
}
