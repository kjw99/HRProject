import { DeptStatus, DeptStatusListResponse } from "@/types/hr";
import { api } from "../api";

export const deptStatusApi = {
  /** 부서별 채용 현황 (대시보드 Q4) — 컴포넌트 단독 새로고침용 */
  fetchRecruitmentStatus: async (): Promise<DeptStatus[]> => {
    const { data } = await api.get<DeptStatus[] | DeptStatusListResponse>(
      "/api/hr/recruitment-status",
    );
    const list = Array.isArray(data) ? data : (data?.content ?? []);
    return (list as DeptStatus[]).map((row) => ({
      ...row,
      id: String(row.id),
    }));
  },
};
