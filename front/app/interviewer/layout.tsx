// app/interviewer/layout.tsx
import Header from "@/components/interviewer/layout/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 면접 질문 생성기 | HR Portal",
  description: "지원자의 이력서를 분석하여 맞춤형 면접 질문을 생성합니다.",
};

export default function InterviewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* 💡 모든 페이지 상단에 공통 헤더 배치 */}
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl h-full">{children}</div>
      </main>

      {/* 푸터가 필요하다면 여기에 추가 */}
    </div>
  );
}
