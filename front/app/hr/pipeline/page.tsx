import React from "react";
import PipelineClient from "@/components/hr/pipeline/PipelineClient";
import { Candidate } from "@/types/hr";
import PipelineExcel from '@/components/hr/pipeline/PipelineExcel';
const MOCK_PIPELINE_CANDIDATES: Candidate[] = [
  // 1. 신규 지원 (Applied)
  {
    id: "cnd_101",
    name: "김프론",
    appliedJob: "job_1",
    status: "applied",
    fitScore: 72,
    resumeSummary:
      "React, TypeScript 기반 어드민 대시보드 개발 경험. UI/UX 최적화 관심.",
  },
  {
    id: "cnd_102",
    name: "이웹웹",
    appliedJob: "job_1",
    status: "applied",
    fitScore: 65,
    resumeSummary: "퍼블리셔 3년차, 프론트엔드 전향. Vue.js 주로 사용.",
  },
  {
    id: "cnd_103",
    name: "박에이",
    appliedJob: "job_2",
    status: "applied",
    fitScore: 88,
    resumeSummary:
      "PyTorch, TensorFlow를 이용한 이미지 분류 모델 학습 경험. 최근 LLM 파인튜닝 프로젝트 진행.",
  },
  {
    id: "cnd_104",
    name: "최랭체",
    appliedJob: "job_2",
    status: "applied",
    fitScore: 91,
    resumeSummary:
      "LangChain과 ChromaDB를 활용한 사내 문서 Q&A 챗봇 개발. FastAPI 백엔드 연동.",
  },
  {
    id: "cnd_105",
    name: "정리액",
    appliedJob: "job_1",
    status: "applied",
    fitScore: 78,
    resumeSummary:
      "Next.js 14 App Router 도입 및 SSR/RSC 활용으로 초기 로딩 속도 40% 단축.",
  },
  {
    id: "cnd_106",
    name: "강옵옵",
    appliedJob: "job_1",
    status: "applied",
    fitScore: 60,
    resumeSummary:
      "국비지원 부트캠프 수료. 자바스크립트 기본기 탄탄, React 클론코딩 다수.",
  },

  // 2. AI 서류 검토 (Screening)
  {
    id: "cnd_201",
    name: "조최적",
    appliedJob: "job_1",
    status: "screening",
    fitScore: 94,
    resumeSummary:
      "Lighthouse Web Vitals 지표 최적화, 번들 사이즈 50% 감소. 모노레포 구축 경험.",
  },
  {
    id: "cnd_202",
    name: "윤파이",
    appliedJob: "job_2",
    status: "screening",
    fitScore: 85,
    resumeSummary:
      "FastAPI 기반 마이크로서비스 아키텍처 설계. Redis 캐싱 적용.",
  },
  {
    id: "cnd_203",
    name: "임데이터",
    appliedJob: "job_2",
    status: "screening",
    fitScore: 89,
    resumeSummary:
      "빅데이터 처리 파이프라인 구축. RAG 시스템에서 Retriever 성능 개선 논문 작성.",
  },
  {
    id: "cnd_204",
    name: "한넥스",
    appliedJob: "job_1",
    status: "screening",
    fitScore: 82,
    resumeSummary:
      "React Native로 모바일 앱 출시. 최근 Next.js를 이용한 웹뷰 하이브리드 앱 개발.",
  },
  {
    id: "cnd_205",
    name: "오그래",
    appliedJob: "job_2",
    status: "screening",
    fitScore: 93,
    resumeSummary:
      "LangGraph를 이용한 다중 에이전트(Multi-Agent) 시스템 구현 토이 프로젝트 우수상.",
  },

  // 3. 심층 면접 (Interview)
  {
    id: "cnd_301",
    name: "신아키",
    appliedJob: "job_1",
    status: "interview",
    fitScore: 96,
    resumeSummary:
      "5년차 시니어. 토스/당근마켓과 유사한 복잡한 상태관리 설계. Zustand 및 React Query 마스터.",
  },
  {
    id: "cnd_302",
    name: "권프롬",
    appliedJob: "job_2",
    status: "interview",
    fitScore: 95,
    resumeSummary:
      "프롬프트 엔지니어링 튜닝으로 환각 현상(Hallucination) 30% 감소 경험. B2B AI 챗봇 상용화.",
  },
  {
    id: "cnd_303",
    name: "황성능",
    appliedJob: "job_1",
    status: "interview",
    fitScore: 90,
    resumeSummary:
      "웹어셈블리(Wasm)를 활용한 프론트엔드 렌더링 한계 극복 시도. 오픈소스 기여자.",
  },
  {
    id: "cnd_304",
    name: "안벡터",
    appliedJob: "job_2",
    status: "interview",
    fitScore: 92,
    resumeSummary:
      "Pinecone과 OpenAI 임베딩 API를 활용한 시맨틱 검색 엔진 고도화. 검색 정확도 20% 향상.",
  },

  // 4. 최종 합격 (Offered)
  {
    id: "cnd_401",
    name: "송리드",
    appliedJob: "job_1",
    status: "offered",
    fitScore: 98,
    resumeSummary:
      "대용량 트래픽 처리 프론트엔드 리드. 디자인 시스템 구축 및 사내 FE 인프라 표준화 주도.",
  },
  {
    id: "cnd_402",
    name: "전엔진",
    appliedJob: "job_2",
    status: "offered",
    fitScore: 97,
    resumeSummary:
      "초거대 언어모델(LLM) 서빙 최적화(vLLM). AI 서비스 아키텍처 A-Z 설계 가능 인재.",
  },

  // 5. 불합격 (Rejected)
  {
    id: "cnd_501",
    name: "유스프",
    appliedJob: "job_1",
    status: "rejected",
    fitScore: 55,
    resumeSummary:
      "Spring Boot 백엔드 5년차. 프론트엔드 리드 포지션에는 부적합하여 1차 드랍.",
  },
  {
    id: "cnd_502",
    name: "고디비",
    appliedJob: "job_2",
    status: "rejected",
    fitScore: 62,
    resumeSummary:
      "DBA 경력 10년. AI/ML 모델링이나 LangChain 관련 경험 부재로 서류 탈락.",
  },
  {
    id: "cnd_503",
    name: "백바닐",
    appliedJob: "job_1",
    status: "rejected",
    fitScore: 45,
    resumeSummary:
      "바닐라 JS 위주의 포트폴리오. 최신 React/Next.js 스택 경험이 부족함.",
  },
];
import { fetchPassedApplicants } from "@/lib/axios";
import AdvancedHybridPipeline, { Applicant } from "@/components/hr/pipeline/AdvancedHybridPipeline";
const MOCK_DATA: Applicant[] = [
  { id: '1', name: '김철수', position: '프론트엔드 개발자', status: '1차 면접', appliedDate: '2026-04-20', score: 92 },
  { id: '2', name: '이영희', position: 'UI/UX 디자이너', status: '분석중', appliedDate: '2026-04-21', score: 0 },
  { id: '3', name: '박지성', position: '백엔드 개발자', status: '2차 면접', appliedDate: '2026-04-18', score: 88 },
  { id: '4', name: '손흥민', position: '퍼포먼스 마케터', status: '합격', appliedDate: '2026-04-15', score: 95 },
  { id: '5', name: '김연아', position: '데이터 분석가', status: '불합격', appliedDate: '2026-04-19', score: 74 },
  { id: '6', name: '정우성', position: '프로덕트 매니저', status: '분석 완료', appliedDate: '2026-04-22', score: 85 },
  { id: '7', name: '이정재', position: 'iOS 개발자', status: '최종 면접', appliedDate: '2026-04-23', score: 91 },
];
export const metadata = { title: '파이프라인 관리 | HR' };


function page() {
  return (
    <AdvancedHybridPipeline data={MOCK_DATA} />
  )
}

export default page


// export default function PipelinePage() {
//   return <PipelineClient initialCandidates={MOCK_PIPELINE_CANDIDATES} />;
//   // return <PipelineExcel initialApplicants={MOCK_PIPELINE_CANDIDATES as Applicant[]} />;
// }



// export default async function HrPipelinePage() {
//   const applicants = await fetchPassedApplicants();

//   return (
//     <div className="p-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
//       <header>
//         <h1 className="text-[32px] font-black text-slate-900 tracking-tight">지원자 파이프라인</h1>
//         <p className="text-slate-500 font-medium">채용 단계별 지원자 현황을 엑셀 뷰로 한눈에 관리하세요.</p>
//       </header>

//       <PipelineExcel initialApplicants={applicants as Applicant[]} />
//     </div>
//   );
// }