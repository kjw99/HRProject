import type { Metadata } from "next";
import { fetchPositionsServer } from "@/app/server/hr/position.server";
import HrQuestionsBrowseClient from "@/components/hr/questions/HrQuestionsBrowseClient";
import HrQuestionsPageHero from "@/components/hr/questions/HrQuestionsPageHero";

export const metadata: Metadata = {
  title: "HR · 질문 조회",
  description: "부서별로 저장된 면접 질문을 조회합니다.",
};

export default async function HrQuestionsPage() {
  const departments = await fetchPositionsServer();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 animate-in fade-in duration-500 sm:gap-6">
      <HrQuestionsPageHero departmentCount={departments.length} />
      <HrQuestionsBrowseClient initialDepartments={departments} />
    </div>
  );
}
