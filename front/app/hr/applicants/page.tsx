import { Metadata } from "next";
import ApplicantListClient from "@/components/hr/applicants/ApplicantListClient";
import HrPageHero from "@/components/hr/shared/HrPageHero";
import { fetchApplicantsServer } from "@/app/server/hr/applicant.server";
import type { Applicant } from "@/types/applicant";
import type { HrQuickLink } from "@/types/hr-ui";

export const metadata: Metadata = {
  title: "지원자 리스트 | HR Portal",
  description: "전체 부서의 지원자 현황 및 우대조건 충족 내역을 관리합니다.",
};

const QUICK_LINKS: readonly HrQuickLink[] = [
  { href: "/hr", label: "대시보드", icon: "grid-alt" },
  { href: "/hr/schedule", label: "면접 일정", icon: "calendar" },
  { href: "/hr/email-templates", label: "메일 템플릿", icon: "envelope" },
];

function summarizeApplicants(data: Applicant[]) {
  const withCriteria = data.filter(
    (item) => (item.meets_preferred_criteria?.length ?? 0) > 0,
  ).length;

  return {
    total: data.length,
    withCriteria,
    inProgress: data.filter((item) => item.final_status === "진행중").length,
  };
}

export default async function ApplicantsPage() {
  const data = await fetchApplicantsServer();
  const summary = summarizeApplicants(data);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 animate-in fade-in duration-500 sm:gap-6">
      <HrPageHero
        id="hr-applicants-title"
        theme="emerald"
        badge={{ icon: "group", label: "HR · 지원자 관리" }}
        icon="user-check"
        title="지원자 목록"
        description="이름·연락처로 검색하고, 우대 조건 충족 여부를 확인한 뒤 상세 보기 또는 메일 발송을 진행할 수 있습니다."
        quickLinks={QUICK_LINKS}
        stats={[
          {
            label: "전체 지원자",
            icon: "group",
            value: summary.total,
          },
          {
            label: "우대 조건 보유",
            icon: "award",
            value: summary.withCriteria,
          },
          {
            label: "진행 중",
            icon: "time-five",
            value: summary.inProgress,
            hint: "최종 상태 기준",
          },
        ]}
      />

      <ApplicantListClient initialData={data} />
    </div>
  );
}
