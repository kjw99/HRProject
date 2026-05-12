import {
  BackendCandidate,
  BackendGeneratedQuestion,
  BackendPosition,
  QuestionGeneratePayload,
  QuestionSavePayload,
} from "@/types/interviewer";
import { api } from "../api";
import { tr } from "date-fns/locale";

export const question = {
  getPositions: async (): Promise<BackendPosition[]> => {
    const response = await api.get("/api/positions");
    return response as unknown as BackendPosition[];
  },

  getCandidates: async (): Promise<BackendCandidate[]> => {
    const response = await api.get("/api/candidates");
    return response as unknown as BackendCandidate[];
  },

  // 💡 1. async 키워드 추가
  generateQuestions: async (
    data: QuestionGeneratePayload,
  ): Promise<BackendGeneratedQuestion[]> => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기 시뮬레이션

    try {
      // 💡 2. 실제 에러를 잡기 위해 api.post 앞에 await 추가
      const response = await api.post("/api/questions/generate", data);
      return response as unknown as BackendGeneratedQuestion[];
    } catch (error) {
      console.error("🚨 질문 생성 API 에러. 목업 데이터를 반환합니다:", error);

      // 💡 3. async 함수이므로 지저분한 Promise 캐스팅 없이 배열 객체만 리턴
      return [
        {
          questionType: "기술 역량",
          questionText:
            "이력서에 기재하신 프로젝트에서 직면했던 가장 큰 기술적 한계는 무엇이었으며, 어떻게 극복하셨나요?",
          evaluationIntent: "문제 해결 능력과 기술적 깊이를 평가합니다.",
          generationBasis:
            "이력서 내 '대규모 트래픽 처리 경험' 항목을 바탕으로 생성됨",
        },
        {
          questionType: "컬쳐핏",
          questionText:
            "팀 내에서 의견 충돌이 발생했을 때 본인만의 해결 노하우가 있다면 말씀해 주세요.",
          evaluationIntent: "협업 능력과 커뮤니케이션 스킬을 확인합니다.",
          generationBasis:
            "자기소개서의 '팀 프로젝트 리딩' 경험을 바탕으로 생성됨",
        },
      ];
    }
  },

  saveQuestions: async (
    data: QuestionSavePayload,
  ): Promise<{ message: string }> => {
    const response = await api.post("/api/questions", data);
    return response as unknown as { message: string };
  },
};
