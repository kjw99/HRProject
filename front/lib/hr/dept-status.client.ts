import { DeptStatus } from "@/types/hr";
import { api } from "../api";

export const deptStatusApi = {
  /** 부서별 채용 현황 (대시보드 Q4) — 컴포넌트 단독 새로고침용 */
  fetchRecruitmentStatus: async (): Promise<DeptStatus[]> => {
    const { data } = await api.get<DeptStatus[]>("/api/hr/recruitment-status");
    return data;
  },
};
