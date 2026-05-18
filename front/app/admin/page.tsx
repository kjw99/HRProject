import type { Metadata } from "next";
import { fetchUsersList } from "@/app/server/admin/adminUsers.server";
import AdminHomeOverview from "@/components/admin/AdminHomeOverview";

export const metadata: Metadata = {
  title: "관리자 홈 | Admin Portal",
  description: "시스템 운영 지표와 Admin·HR 업무 바로가기를 제공합니다.",
};

export default async function AdminHomePage() {
  const users = await fetchUsersList(0, 100, "");
  const initialUserCount = users.content.length;

  return <AdminHomeOverview initialUserCount={initialUserCount} />;
}
