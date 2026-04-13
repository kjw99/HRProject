import { Candidate, JobPosting } from "@/types/hr";

export const JOB_POSTINGS: JobPosting[] = [
  { id: 'job_1', title: '프론트엔드 리드 개발자', department: '플랫폼 개발실', level: '경력 5년 이상', keySkills: ['React', 'Next.js', '성능 최적화'] },
  { id: 'job_2', title: 'AI 에이전트 엔지니어', department: 'AI 연구소', level: '신입/경력', keySkills: ['Python', 'LangGraph', 'FastAPI'] },
];

export const CANDIDATES: Candidate[] = [
  { id: 'cnd_1', name: '김지원', appliedJob: 'job_1', resumeSummary: '이커머스 플랫폼 프론트엔드 성능 30% 개선 경험. Vue에서 React로 마이그레이션 주도.' },
  { id: 'cnd_2', name: '박랭체', appliedJob: 'job_2', resumeSummary: 'LangGraph를 활용한 사내 챗봇 토이 프로젝트 진행. RAG 구축 경험 있음.' },
];