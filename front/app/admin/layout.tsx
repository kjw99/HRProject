// src/app/admin/layout.tsx
import React from "react";
import { Metadata } from "next";
import AdminClientWrapper from "@/components/admin/AdminClientWrapper";
// import { requireRole } from "@app/server/auth/require-role"; // 인증 필요 시 주석 해제

// 💡 [SSR 핵심 1] 서버 컴포넌트이므로 Metadata를 정상적으로 export 할 수 있습니다.
export const metadata: Metadata = {
  title: "관리자 포털 | Admin Portal",
  description: "시스템 관리 및 사용자 모니터링을 위한 관리자 전용 포털입니다.",
};

export const dynamic = "force-dynamic";

// 💡 [SSR 핵심 2] Props에 대한 엄격한 타입 지정
export interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // 💡 [SSR 핵심 3] 여기서 서버 측 DB 조회나 쿠키/세션 검증이 가능합니다.
  // await requireRole(["admin"]); 

  return (
    // 클라이언트의 반응형 UI 조작을 담당하는 Wrapper에게 children을 그대로 넘겨줍니다.
    // *중요: Client Component 안에 Server Component(children)를 넣어도 SSR은 유지됩니다!
    <AdminClientWrapper>
      {children}
    </AdminClientWrapper>
  );
}
