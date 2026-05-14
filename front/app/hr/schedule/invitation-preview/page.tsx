import { redirect } from "next/navigation";

/** 예전 경로 호환 — HR 레이아웃 없이 미리보기만 보려면 `/invitation-preview`로 이동 */
export default async function LegacyInvitationPreviewRedirect({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft } = await searchParams;
  if (draft) {
    redirect(`/invitation-preview?draft=${encodeURIComponent(draft)}`);
  }
  redirect("/invitation-preview");
}
