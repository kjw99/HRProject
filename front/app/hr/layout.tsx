import { requireRole } from "@app/server/auth/require-role";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata = {
  title: "HR",
};

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["hr"]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-slate-900">HR</span>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
