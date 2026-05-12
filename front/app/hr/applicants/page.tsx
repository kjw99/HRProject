// front/app/hr/applicants/page.tsx
import { Metadata } from "next";
import ApplicantListClient from "@/components/hr/applicants/ApplicantListClient";
import BackButton from "@/components/common/BackButton"; // 💡 새로 만든 컴포넌트 임포트 (경로에 맞게 수정)

export const metadata: Metadata = {
  title: "지원자 리스트 | HR Portal",
  description: "전체 부서의 지원자 현황 및 우대조건 충족 내역을 관리합니다.",
};

export default function ApplicantsPage() {
  return (
    <div className="w-full py-1 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 💡 서버 컴포넌트 내부에 클라이언트 컴포넌트(버튼) 삽입 */}
        <BackButton />

        <ApplicantListClient />
      </div>
    </div>
  );
}
