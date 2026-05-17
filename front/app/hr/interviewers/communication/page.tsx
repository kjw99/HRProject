import { fetchInterviewersServer } from "@/app/server/hr/interviewer.server";
import { fetchPositionsServer } from "@/app/server/hr/position.server";
import HrPageHero from "@/components/hr/shared/HrPageHero";
import InterviewerCommunicationClient from "@/components/hr/interviewers/InterviewerCommunicationClient";

export default async function InterviewerCommunicationPage() {
  const [interviewerList, positions] = await Promise.all([
    fetchInterviewersServer({ size: 100 }),
    fetchPositionsServer(),
  ]);

  const interviewers = interviewerList.content;
  const interviewersWithPosition = interviewers.filter(
    (item) => item.positionId != null,
  ).length;
  const interviewersWithRound = interviewers.filter(
    (item) => item.interviewRound,
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 animate-in fade-in duration-500 sm:gap-6">
      <HrPageHero
        id="hr-interviewer-communication-title"
        theme="indigo"
        badge={{ icon: "send", label: "HR · 면접관 커뮤니케이션" }}
        icon="mail-send"
        title="면접관 초대 / 메일 운영"
        description="면접관에게 초대 링크를 발급하고, 템플릿 기반 메일을 빠르게 발송하는 운영 화면입니다."
        quickLinks={[
          { href: "/hr/interviewers", label: "면접관 목록", icon: "user-voice" },
          { href: "/hr/email-templates", label: "메일 템플릿", icon: "envelope" },
          { href: "/hr/schedule", label: "면접 일정", icon: "calendar" },
        ]}
        stats={[
          { label: "전체 면접관", icon: "group", value: interviewers.length },
          { label: "직무 연결", icon: "briefcase-alt-2", value: interviewersWithPosition },
          { label: "차수 지정", icon: "layer", value: interviewersWithRound },
        ]}
      />

      <InterviewerCommunicationClient
        interviewers={interviewers}
        positions={positions}
      />
    </div>
  );
}
