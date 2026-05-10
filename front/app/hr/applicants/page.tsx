import { Metadata } from "next";
import ApplicantListClient from "@/components/hr/applicants/ApplicantListClient";

export const metadata: Metadata = {
  title: "지원자 리스트 | HR Portal",
  description: "전체 부서의 지원자 현황 및 우대조건 충족 내역을 관리합니다.",
};

export default function ApplicantsPage() {
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        <ApplicantListClient />
      </div>
    </div>
  );
}
