import AdminAppFrame from "@/components/admin/layout/AdminAppFrame";
import React from "react";

// 서버에서만 실행되므로 메타데이터 설정 가능
export const metadata = {
  title: "Admin Console | A-RECRUIT",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAppFrame>{children}</AdminAppFrame>;
}
