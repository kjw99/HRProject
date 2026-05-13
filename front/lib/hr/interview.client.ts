import {
  AssignInterviewerRequest,
  AssignInterviewerResponse,
} from "@/types/hr";
import { Applicant, ApplicantListResponse } from "@/types/applicant";
import { api } from "../api";
import {
  BackendGeneratedQuestion,
  QuestionGeneratePayload,
} from "@/types/interviewer";
/**
 * @description 면접관 할당 (최대 3명)
 */
export const assignInterviewers = async (
  data: AssignInterviewerRequest,
): Promise<AssignInterviewerResponse> => {
  try {
    // ✅ [실제 백엔드 통신 시 아래 주석 해제]
    // const response = await api.post<AssignInterviewerResponse>('/api/interviews/assign', data);
    // return response.data;

    // 🚨 [UI 테스트용 목업 로직] 실제 서버가 돌아가는 것처럼 1초 지연
    console.log(
      "🚨 [POST] 서버 연결 실패! 목업 데이터를 반환합니다. 요청 데이터:",
      data,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 고의로 에러를 테스트하고 싶다면 아래 주석을 해제하세요.
    // throw new Error("서버 내부 오류가 발생했습니다.");

    return {
      message: `${data.interviewers.length}명의 면접관이 성공적으로 할당되었습니다.`,
    };
  } catch (error: any) {
    console.error("면접관 할당 에러:", error);
    throw new Error(error.message || "면접관 할당에 실패했습니다.");
  }
};

export const fetchApplicants = async (
  department: string = "ALL",
): Promise<ApplicantListResponse> => {
  try {
    const response = await api.get<ApplicantListResponse>("/api/candidates");
    // console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "🚨 [GET] 지원자 리스트 로드 실패. 서버 데이터 구조의 목업을 반환합니다.",
    );

    // 네트워크 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 15명의 가상 지원자 생성
    let mockData: Applicant[] = Array.from({ length: 15 }).map((_, idx) => {
      const expLevel = ["신입", "경력", "무관"][idx % 3] as
        | "신입"
        | "경력"
        | "무관";

      // application_status 매핑
      const appStatus = ["서류", "면접", "서류", "면접"][idx % 4] as
        | "서류"
        | "면접";

      // final_status 매핑
      const finalStatus = ["진행중", "진행중", "합격", "불합격"][idx % 4] as
        | "진행중"
        | "합격"
        | "불합격";

      // 우대조건 가변적 부여
      const criteria: string[] = [];
      if (idx % 2 === 0) criteria.push("정보처리기사");
      if (idx % 3 === 0) criteria.push("TOEIC 900점 이상");
      if (idx % 5 === 0) criteria.push("관련 직무 인턴 경험 6개월");

      return {
        candidate_id: 100 + idx, // number형 ID
        position_id: 10 + (idx % 5), // 지원 공고 ID
        name: `지원자${idx + 1}`,
        date_of_birth: `199${idx % 9}-0${(idx % 9) + 1}-10`,
        gender: idx % 2 === 0 ? "남" : "여",
        address: `(우편번호: 0612${idx}) 서울특별시 강남구 테헤란로 ${idx}길`,
        phone: `010-${1000 + idx}-${4000 + idx}`,
        email: `applicant${idx}@example.com`,
        experience_level: expLevel, // Snake Case
        application_status: appStatus, // 전형 단계
        final_status: finalStatus, // 최종 상태
        meets_preferred_criteria: criteria, // 필드명 변경
      };
    });

    // 부서 필터링 (position_id를 부서 대용으로 활용하거나 로직 유지)
    if (department !== "ALL") {
      // 실제 서버 데이터에는 department 문자열이 없으므로,
      // 테스트를 위해 특정 position_id를 부서처럼 매핑하여 필터링 예시를 둡니다.
      const deptMap: Record<string, number> = {
        개발팀: 10,
        디자인팀: 11,
        마케팅팀: 12,
      };
      const targetId = deptMap[department];
      if (targetId) {
        mockData = mockData.filter((app) => app.position_id === targetId);
      }
    }

    return {
      content: mockData,
    };
  }
};

// 3. (클라이언트용) AI 질문 생성 API 시뮬레이션
export const generateQuestionsAPI = async (
  payload: QuestionGeneratePayload,
): Promise<BackendGeneratedQuestion[]> => {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

  return [
    {
      questionType: "기술 역량",
      questionText:
        "이력서에 기재하신 프로젝트에서 직면했던 가장 큰 기술적 한계는 무엇이었으며, 어떻게 극복하셨나요?",
      evaluationIntent: "문제 해결 능력과 기술적 깊이를 평가합니다.",
      generationBasis:
        "이력서 내 '대규모 트래픽 처리 경험' 항목을 바탕으로 생성됨", // 💡 generationBasis 활용
    },
    {
      questionType: "컬쳐핏",
      questionText:
        "팀 내에서 의견 충돌이 발생했을 때 본인만의 해결 노하우가 있다면 말씀해 주세요.",
      evaluationIntent: "협업 능력과 커뮤니케이션 스킬을 확인합니다.",
      generationBasis: "자기소개서의 '팀 프로젝트 리딩' 경험을 바탕으로 생성됨",
    },
  ];
};
