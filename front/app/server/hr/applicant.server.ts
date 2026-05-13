import "server-only";

import { Applicant, ApplicantListResponse } from "@/types/applicant";
import { apiServer } from "../axios-server";

/**
 * [Server-side] 지원자 리스트 조회
 * @param department 필터링할 부서명 (백엔드 position_id 매핑용)
 */
export const fetchApplicantsServer = async (
  department: string = "ALL",
): Promise<Applicant[]> => {
  try {
    // 실제 API 호출 (FastAPI 서버의 엔드포인트)
    // 💡 팁: 실제 백엔드에 쿼리 파라미터로 department를 보낼 준비가 되어 있다면 params를 추가하세요.
    const response = await apiServer.get<Applicant[]>("/api/candidates");

    return response.data;
  } catch (error: any) {
    console.warn(
      "🚨 [Server API] 지원자 리스트 로드 실패. 목업 데이터를 반환합니다.",
      error.message,
    );

    // 15명의 가상 지원자 생성 (서버 데이터 구조인 Snake Case 준수)
    let mockData: Applicant[] = Array.from({ length: 15 }).map((_, idx) => {
      const expLevel = ["신입", "경력", "무관"][idx % 3] as
        | "신입"
        | "경력"
        | "무관";
      const appStatus = ["서류", "면접"][idx % 2] as "서류" | "면접";
      const finalStatus = ["진행중", "합격", "불합격"][idx % 3] as
        | "진행중"
        | "합격"
        | "불합격";

      const criteria: string[] = [];
      if (idx % 2 === 0) criteria.push("정보처리기사");
      if (idx % 3 === 0) criteria.push("TOEIC 900점 이상");

      return {
        candidate_id: 100 + idx,
        position_id: 10 + (idx % 5),
        name: `지원자${idx + 1}`,
        date_of_birth: `199${idx % 9}-0${(idx % 9) + 1}-10`,
        gender: idx % 2 === 0 ? "남" : "여",
        address: `서울특별시 강남구 테헤란로 ${idx}길`,
        phone: `010-${1000 + idx}-${4000 + idx}`,
        email: `applicant${idx}@example.com`,
        experience_level: expLevel,
        application_status: appStatus,
        final_status: finalStatus,
        meets_preferred_criteria: criteria,
      };
    });

    // 부서(Position ID) 필터링 로직 유지
    if (department !== "ALL") {
      const deptMap: Record<string, number> = {
        개발팀: 10,
        디자인팀: 11,
        마케팅팀: 12,
        영업팀: 13,
        인사팀: 14,
      };
      const targetId = deptMap[department];
      if (targetId !== undefined) {
        mockData = mockData.filter((app) => app.position_id === targetId);
      }
    }

    return mockData;
  }
};
