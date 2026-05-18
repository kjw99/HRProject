import AdminAdminActionsSection from "./AdminAdminActionsSection";
import AdminHomeHero from "./AdminHomeHero";
import AdminHrHandoffSection from "./AdminHrHandoffSection";
import type { AdminHomeOverviewProps } from "@/types/admin-ui";

export default function AdminHomeOverview({
  initialUserCount,
}: AdminHomeOverviewProps) {
  return (
    <div className="space-y-8">
      <AdminHomeHero initialUserCount={initialUserCount} />
      <AdminAdminActionsSection />
      <AdminHrHandoffSection />
    </div>
  );
}
