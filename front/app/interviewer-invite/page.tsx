import { redirect } from "next/navigation";

export default async function LegacyInterviewerInviteRedirect({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) {
    redirect(`/interviewer/invite?token=${encodeURIComponent(token)}`);
  }
  redirect("/interviewer/invite");
}
