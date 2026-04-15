import { Candidate, CandidateInsight, GeneratedQuestion, JobPosting } from "@/types/hr";
import { CandidateReport } from "@/types/report";
import { ScheduleData } from "@/types/schedule";
import axios from 'axios';

const apiKey = "";

export const fetchGeminiDeepAnalysis = async (job: JobPosting, candidate: Candidate): Promise<GeneratedQuestion[]> => {
  const systemPrompt = `
    당신은 20년 경력의 베테랑 기술 면접관입니다. 
    채용 공고 정보와 지원자의 이력 요약을 분석하여, 지원자의 실력을 날카롭게 검증할 수 있는 '심층 면접 질문' 3개를 생성하세요.
    응답은 JSON 형식이어야 합니다.
  `;

  const userQuery = `[채용공고]: ${job.title}, [필수기술]: ${job.keySkills.join(', ')} / [지원자]: ${candidate.name}, [이력요약]: ${candidate.resumeSummary}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          questions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "NUMBER" },
                type: { type: "STRING" },
                question: { type: "STRING" },
                intent: { type: "STRING" },
                ragContext: { type: "STRING" }
              }
            }
          }
        }
      }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? JSON.parse(text).questions : [];
};

/**
 * ✨ Feature: Candidate Insight Analysis
 * 지원자의 강점, 리스크, 면접 시 평가 척도를 분석합니다.
 */
export const fetchGeminiCandidateInsights = async (job: JobPosting, candidate: Candidate): Promise<CandidateInsight> => {
  const systemPrompt = `
    당신은 HR 전략 컨설턴트입니다. 
    지원자의 이력과 채용 공고를 비교하여 강점 2개, 잠재적 리스크 2개, 그리고 면접에서 사용해야 할 주요 평가 척도(Scorecard) 3개를 제안하세요.
  `;

  const userQuery = `[직무]: ${job.title} / [지원자]: ${candidate.name}, [이력 요약]: ${candidate.resumeSummary}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          strengths: { type: "ARRAY", items: { type: "STRING" } },
          risks: { type: "ARRAY", items: { type: "STRING" } },
          scorecard: { type: "ARRAY", items: { type: "STRING" } }
        }
      }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text ? JSON.parse(text) : { strengths: [], risks: [], scorecard: [] };
};

export const fetchReportData = async (): Promise<CandidateReport> => {
  try {
    // 실제 백엔드 API 엔드포인트 호출
    const response = await axios.get<CandidateReport>('/api/reports/me');
    return response.data;
  } catch (error) {
    console.warn("API 통신 실패, 더미 데이터로 폴백합니다.", error);

    // API 미구현 시 보여줄 가짜(Mock) 데이터 (1초 딜레이)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      applicantName: "홍길동",
      appliedJob: "프론트엔드 엔지니어 (React/Next.js)",
      overallScore: 88,
      summary: "React 생태계에 대한 깊은 이해도를 바탕으로 실무에 즉시 투입 가능한 수준의 기술 역량을 보유하고 있습니다. 특히 상태 관리와 렌더링 최적화에 대한 논리적인 접근이 매우 우수합니다.",
      competencies: [
        { label: "기술 전문성", score: 90 },
        { label: "문제 해결력", score: 85 },
        { label: "의사소통", score: 95 },
        { label: "학습 민첩성", score: 80 },
        { label: "프로젝트 관리", score: 75 },
      ],
      strengths: [
        "구체적인 경험을 바탕으로 한 논리적인 답변 전개",
        "최신 프론트엔드 트렌드(서버 컴포넌트 등)에 대한 높은 이해도"
      ],
      weaknesses: [
        "백엔드 인프라(CI/CD, Docker)와의 연동 경험에 대한 설명 부족",
        "답변 시 다소 말이 빨라지는 경향"
      ],
      feedbacks: [
        {
          id: "fb1",
          question: "이전 프로젝트에서 상태 관리 라이브러리를 선택한 기준은 무엇인가요?",
          myAnswerSummary: "프로젝트 규모에 맞춰 보일러플레이트가 적은 Zustand를 도입하여 전역 상태를 관리했습니다.",
          aiComment: "Zustand의 장점(적은 보일러플레이트, 렌더링 최적화)을 정확히 인지하고 프로젝트 상황에 맞게 기술을 선택한 점이 훌륭합니다. 향후 Redux 등 다른 도구와의 Trade-off를 비교 설명한다면 더 완벽할 것입니다.",
          rating: 'Excellent'
        },
        {
          id: "fb2",
          question: "프론트엔드 성능 최적화를 위해 시도해 본 경험이 있나요?",
          myAnswerSummary: "이미지 Lazy Loading과 Memoization을 사용했습니다.",
          aiComment: "기본적인 최적화 기법을 잘 숙지하고 있습니다. 다만, 구체적인 성능 지표(Lighthouse 점수 등)가 얼마나 개선되었는지 수치화하여 답변하면 설득력을 더 높일 수 있습니다.",
          rating: 'Good'
        }
      ]
    };
  }
};

export const fetchScheduleData = async (): Promise<ScheduleData> => {
  try {
    const response = await axios.get<ScheduleData>('/api/schedules/me');
    return response.data;
  } catch (error) {
    console.warn("API 통신 실패, 더미 데이터로 대체합니다.", error);

    // 네트워크 딜레이 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      applicantName: "홍길동",
      upcomingCount: 1,
      events: [
        {
          id: "evt-002",
          title: "1차 기술 심층 면접",
          date: "2026-04-20",
          time: "02:00 PM",
          type: "ONLINE",
          status: "UPCOMING",
          locationOrLink: "https://meet.google.com/abc-defg-hij",
          interviewerInfo: "프론트엔드 파트장 외 1명",
          preparation: ["본인 확인용 신분증", "조용한 환경 및 마이크 점검", "포트폴리오 내용 숙지"]
        },
        {
          id: "evt-001",
          title: "AI 역량 검사",
          date: "2026-04-10",
          time: "10:00 AM",
          type: "ONLINE",
          status: "COMPLETED",
          locationOrLink: "시스템 내 자체 진행",
          preparation: []
        }
      ]
    };
  }
};