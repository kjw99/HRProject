import "server-only";

import { InterviewSlot, InterviewSlotParams } from "@/types/schedule";
import { Applicant, ApplicantListResponse } from "@/types/applicant";
import { apiServer } from "../axios-server";
import { DeptStatus } from "@/types/hr";

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

/**
 * [Server-side] 면접 슬롯 목록 조회
 * GET /api/interview-slots
 */
export const fetchInterviewSlotsServer = async (
  params?: InterviewSlotParams,
): Promise<InterviewSlot[]> => {
  try {
    // 💡 Axios의 두 번째 인자인 config 객체에 params를 넣으면,
    // 자동으로 ?year=2026&month=5 형태로 변환되어 URL에 붙습니다.
    const response = await apiServer.get<InterviewSlot[]>(
      "/api/interview-slots",
      {
        params,
      },
    );

    return response.data;
  } catch (error: any) {
    console.warn(
      "🚨 [Server API] 면접 슬롯 로드 실패. 목업 데이터를 반환합니다.",
      error.message,
    );

    // 명세서 기반 목업 데이터 반환 (UI 개발용)
    return [
      {
        slotId: 2,
        positionName: "영업관리",
        interviewerNames: ["테스트면접", "면접관테스트"],
        interviewRound: "1차",
        interviewStartsAt: "2026-05-20T07:00:00Z",
        interviewEndsAt: "2026-05-20T07:30:00Z",
        slotStatus: "open",
        interviewLocation: "본사 3층 회의실 A",
      },
      {
        slotId: 3,
        positionName: "프론트엔드 개발",
        interviewerNames: ["한다솔", "김팀장"],
        interviewRound: "최종",
        interviewStartsAt: "2026-05-21T05:00:00Z", // KST 14:00
        interviewEndsAt: "2026-05-21T06:00:00Z", // KST 15:00
        slotStatus: "closed",
        interviewLocation: "본사 5층 대회의실",
      },
    ];
  }
};

export const fetchDeptStatusServer = async (): Promise<DeptStatus[]> => {
  try {
    const response = await apiServer.get<DeptStatus[]>(
      "/api/hr/recruitment-status",
    );
    return response.data;
  } catch (error: any) {
    console.warn(
      "🚨 [Server API] 부서별 채용 현황 로드 실패. 목업 데이터를 반환합니다.",
      error.message,
    );
    return [
      {
        id: "dept-1",
        deptName: "플랫폼개발팀",
        currentProgress: "2차 기술 면접 진행 중",
        experienced: { intervieweeCount: 3, applicantCount: 45 },
        newcomer: { intervieweeCount: 0, applicantCount: 12 },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "dept-2",
        deptName: "브랜드마케팅팀",
        currentProgress: "1차 실무 면접 진행 중",
        experienced: { intervieweeCount: 2, applicantCount: 30 },
        newcomer: { intervieweeCount: 8, applicantCount: 120 },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "dept-3",
        deptName: "인프라보안팀",
        currentProgress: "최종 임원 면접 대기",
        experienced: { intervieweeCount: 2, applicantCount: 15 },
        newcomer: { intervieweeCount: 0, applicantCount: 0 },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "dept-4",
        deptName: "영업기획팀",
        currentProgress: "서류 심사 중",
        experienced: { intervieweeCount: 0, applicantCount: 25 },
        newcomer: { intervieweeCount: 0, applicantCount: 80 },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "dept-5",
        deptName: "BX디자인팀",
        currentProgress: "컬쳐핏 면접 진행 중",
        experienced: { intervieweeCount: 1, applicantCount: 20 },
        newcomer: { intervieweeCount: 4, applicantCount: 65 },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }
};
