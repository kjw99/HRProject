import AgentClient from "@/components/interviewer/agent/AgentClient";
import {
  fetchCandidates,
  fetchPositions,
} from "@/app/server/interviewer/interviewer.server";

export default async function HrAiGenPage() {
  const [positionsData, candidatesData] = await Promise.all([
    fetchPositions(),
    fetchCandidates(),
  ]);

  return (
    <div className="flex h-full min-h-0 flex-col animate-in fade-in duration-500">
      <div className="mb-6 shrink-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          HR · AI
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-800">
          <i className="bx bx-bot text-3xl text-indigo-600" />
          AI 면접 질문 에이전트
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          부서와 지원자를 선택하면 맞춤형 심층 질문을 자동으로 생성합니다.
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <AgentClient
          initialPositions={positionsData}
          initialCandidates={candidatesData}
        />
      </div>
    </div>
  );
}
