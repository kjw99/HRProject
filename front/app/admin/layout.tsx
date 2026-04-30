import React from "react";
import { requireRole } from "@app/server/auth/require-role";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata = {
  title: "관리자",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="text-lg font-semibold text-slate-900">관리자</span>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
