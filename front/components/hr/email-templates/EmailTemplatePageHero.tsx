import HrPageHero from "@/components/hr/shared/HrPageHero";
import { EMAIL_TEMPLATE_RECOMMENDED_KEYS } from "./email-template.constants";
import type { EmailTemplatePageHeroProps } from "@/types/email-template-ui";
import type { HrQuickLink } from "@/types/hr-ui";

const QUICK_LINKS: readonly HrQuickLink[] = [
  { href: "/hr", label: "대시보드", icon: "grid-alt" },
  { href: "/hr/applicants", label: "지원자", icon: "group" },
  {
    href: "/hr/interviewers/communication",
    label: "면접관 초대·메일",
    icon: "send",
  },
  { href: "/invitation-preview", label: "초대 미리보기", icon: "mail-send" },
];

export default function EmailTemplatePageHero({
  templateCount,
}: EmailTemplatePageHeroProps) {
  const recommendedVars = EMAIL_TEMPLATE_RECOMMENDED_KEYS.map(
    (key) => `{${key}}`,
  ).join(", ");

  return (
    <HrPageHero
      id="hr-email-templates-title"
      theme="amber"
      badge={{ icon: "envelope", label: "HR · 메일 워크플로" }}
      icon="mail-send"
      title="이메일 템플릿 관리"
      description={
        <>
          반복 발송 메일 문구를 모아두고, 지원자·면접관 초대 화면에서 불러와
          렌더 미리보기와 함께 사용할 수 있습니다. 권장 변수:{" "}
          <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs font-bold text-amber-900">
            {recommendedVars}
          </code>
        </>
      }
      quickLinks={QUICK_LINKS}
      stats={[
        {
          label: "저장된 템플릿",
          icon: "collection",
          value: (
            <>
              {templateCount}
              <span className="ml-0.5 text-xs font-bold text-slate-400 sm:text-sm">
                개
              </span>
            </>
          ),
        },
        {
          label: "연결 화면",
          icon: "link",
          value: "초대 · 면접관 메일",
          hint: "템플릿 적용 후 발송",
        },
      ]}
    />
  );
}
