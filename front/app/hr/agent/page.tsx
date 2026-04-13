import React from "react";
import AgentClient from "@/components/hr/agent/AgentClient";
import { JobPosting, Candidate } from "@/types/hr";

// 서버 사이드에서 가져올 데이터
const MOCK_JOBS: JobPosting[] = [
  {
    id: "job_1",
    title: "프론트엔드 리드 개발자",
    department: "플랫폼 개발실",
    level: "경력 5년 이상",
    keySkills: ["React", "Next.js", "성능 최적화"],
  },
  {
    id: "job_2",
    title: "AI 에이전트 엔지니어",
    department: "AI 연구소",
    level: "신입/경력",
    keySkills: ["Python", "LangGraph", "FastAPI"],
  },
];

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "cnd_1",
    name: "김지원",
    appliedJob: "job_1",
    resumeSummary:
      "이커머스 플랫폼 프론트엔드 성능 30% 개선 경험. Vue에서 React로 마이그레이션 주도.",
  },
  {
    id: "cnd_2",
    name: "박랭체",
    appliedJob: "job_2",
    resumeSummary:
      "LangGraph를 활용한 사내 챗봇 토이 프로젝트 진행. RAG 구축 경험 있음.",
  },
];

export default function AgentPage() {
  return (
    <div className="space-y-12 animate-in fade-in zoom-in-[0.98] duration-700">
      <header className="border-b border-slate-200/60 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-[10px] text-[11px] font-black uppercase tracking-[0.2em] border border-blue-100/50 shadow-sm">
            <i className="bx bxs-magic-wand"></i> AI Interview Generator
          </div>
          <h2 className="text-[36px] lg:text-[44px] font-black text-slate-900 tracking-tighter leading-tight">
            지능형 면접 질문 생성기
          </h2>
          <p className="text-slate-500 font-semibold text-[16px] max-w-2xl leading-relaxed">
            지원자의 이력서와 직무 기술서를 교차 분석하여 심층 인터뷰 가이드를
            생성합니다.
          </p>
        </div>
      </header>

      {/* 조립된 클라이언트 컴포넌트 렌더링 */}
      <AgentClient jobPostings={MOCK_JOBS} candidates={MOCK_CANDIDATES} />
    </div>
  );
}
