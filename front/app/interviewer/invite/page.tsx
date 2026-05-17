import InterviewerInviteAcceptClient from "@/components/interviewer/invite/InterviewerInviteAcceptClient";

interface InterviewerInvitePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function InterviewerInvitePage({
  searchParams,
}: InterviewerInvitePageProps) {
  const params = await searchParams;

  return <InterviewerInviteAcceptClient initialToken={params.token ?? ""} />;
}
