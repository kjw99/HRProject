import React from "react";
import PipelineClient from "@/components/hr/pipeline/PipelineClient";
import { Candidate } from "@/types/hr";

const MOCK_PIPELINE_CANDIDATES: Candidate[] = [
  {
    id: "cnd_1",
    name: "김지원",
    appliedJob: "job_1",
    status: "interview",
    fitScore: 92,
    resumeSummary: "이커머스 플랫폼 프론트엔드 성능 30% 개선 경험.",
  },
  {
    id: "cnd_2",
    name: "박랭체",
    appliedJob: "job_2",
    status: "screening",
    fitScore: 85,
    resumeSummary: "LangGraph를 활용한 사내 챗봇 토이 프로젝트 진행.",
  },
  {
    id: "cnd_3",
    name: "이코드",
    appliedJob: "job_1",
    status: "applied",
    fitScore: 68,
    resumeSummary: "신입 프론트엔드 개발자. React 기반 쇼핑몰 클론 코딩.",
  },
  {
    id: "cnd_4",
    name: "최서버",
    appliedJob: "job_2",
    status: "offered",
    fitScore: 95,
    resumeSummary:
      "대용량 트래픽 처리 경험 보유. FastAPI 및 Redis 캐싱 아키텍처 설계.",
  },
];

export default function PipelinePage() {
  return <PipelineClient initialCandidates={MOCK_PIPELINE_CANDIDATES} />;
}
