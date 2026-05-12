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
    const response = await api.get<ApplicantListResponse>("/api/applicants", {
      params: { department: department === "ALL" ? undefined : department },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "🚨 [GET] 지원자 리스트 로드 실패. 목업 데이터를 반환합니다.",
    );

    // 네트워크 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500));

    const DEPARTMENTS = ["개발팀", "디자인팀", "마케팅팀", "영업팀", "인사팀"];

    // 15명의 가상 지원자 생성
    let mockData: Applicant[] = Array.from({ length: 15 }).map((_, idx) => {
      const expLevel = ["신입", "경력", "무관"][idx % 3] as
        | "신입"
        | "경력"
        | "무관";
      const status = ["서류 심사 중", "면접 진행 중", "합격", "불합격"][
        idx % 4
      ] as "합격" | "불합격" | "서류 심사 중" | "면접 진행 중";

      // 인덱스에 따라 우대조건 가변적 부여
      const criteria: string[] = [];
      if (idx % 2 === 0) criteria.push("정보처리기사");
      if (idx % 3 === 0) criteria.push("TOEIC 900점 이상");
      if (idx % 5 === 0) criteria.push("관련 직무 인턴 경험 6개월");

      return {
        id: `APP-${202600 + idx}`,
        experienceLevel: expLevel,
        name: `지원자${idx + 1}`,
        phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        department: DEPARTMENTS[idx % 5],
        appliedPosition: [
          "프론트엔드",
          "UI/UX 디자이너",
          "퍼포먼스 마케터",
          "B2B 세일즈",
          "HR BP",
        ][idx % 5],
        status: status,
        preferredCriteria: criteria,
      };
    });

    // 클라이언트에서 넘긴 파라미터(부서)가 'ALL'이 아니면 필터링해서 반환
    if (department !== "ALL") {
      mockData = mockData.filter((app) => app.department === department);
    }

    return {
      content: mockData,
      totalElements: mockData.length,
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
