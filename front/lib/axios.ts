import { CalendarEvent, PassedApplicant } from "@/types/calendar";
import { Candidate, CandidateInsight, GeneratedQuestion, JobPosting } from "@/types/hr";
import { CandidateReport } from "@/types/report";
import { ScheduleData } from "@/types/schedule";
import axios from 'axios';

/**
 * Gemini 호출은 API 키가 서버에만 있어야 하므로 app/api 아래 Route Handler에서 수행합니다.
 * 클라이언트에서는 같은 출처의 /api/analyze 등으로만 요청합니다.
 */
export const fetchGeminiDeepAnalysis = async (
  job: JobPosting,
  candidate: Candidate
): Promise<GeneratedQuestion[]> => {
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job, candidate }),
    });
    const data = (await res.json()) as { questions?: GeneratedQuestion[]; error?: string };
    if (!res.ok) {
      console.warn("fetchGeminiDeepAnalysis:", data.error ?? res.statusText);
      return [];
    }
    return data.questions ?? [];
  } catch (e) {
    console.error("fetchGeminiDeepAnalysis:", e);
    return [];
  }
};

/**
 * 지원자 인사이트(강점·리스크·스코어카드) — 서버 Route Handler에서 Gemini 호출.
 */
export const fetchGeminiCandidateInsights = async (
  job: JobPosting,
  candidate: Candidate
): Promise<CandidateInsight> => {
  try {
    const res = await fetch("/api/candidate-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job, candidate }),
    });
    const data = (await res.json()) as Partial<CandidateInsight> & { error?: string };
    if (!res.ok) {
      console.warn("fetchGeminiCandidateInsights:", data.error ?? res.statusText);
      return { strengths: [], risks: [], scorecard: [] };
    }
    return {
      strengths: data.strengths ?? [],
      risks: data.risks ?? [],
      scorecard: data.scorecard ?? [],
    };
  } catch (e) {
    console.error("fetchGeminiCandidateInsights:", e);
    return { strengths: [], risks: [], scorecard: [] };
  }
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

export const fetchAdminEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const response = await axios.get('/api/admin/events');
    return response.data;
  } catch (error) {
    // Mock Data Fallback
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: 'ev-1',
        title: '프론트엔드 기술 면접',
        date: '2026-04-20',
        startTime: '14:00',
        endTime: '15:00',
        type: 'INTERVIEW',
        location: '회의실 A',
        candidates: [
          { id: 'c1', name: '홍길동', position: 'FE 개발자', email: 'hong@test.com' },
          { id: 'c2', name: '김철수', position: 'FE 개발자', email: 'kim@test.com' }
        ]
      },
      {
        id: 'ev-2',
        title: '백엔드 코딩 테스트',
        date: '2026-04-20',
        startTime: '10:00',
        endTime: '12:00',
        type: 'CODING_TEST',
        location: '온라인 세션',
        candidates: [{ id: 'c3', name: '이영희', position: 'BE 개발자', email: 'lee@test.com' }]
      }
    ];
  }
};

export const fetchPassedApplicants = async (): Promise<PassedApplicant[]> => {
  // 실제로는 axios.get('/api/hr/applicants?status=passed')
  return [
    { id: 'app-1', name: '박지성', position: 'FE 개발자', status: 'DOCUMENT_PASSED' },
    { id: 'app-2', name: '손흥민', position: 'BE 개발자', status: 'DOCUMENT_PASSED' },
    { id: 'app-3', name: '이강인', position: 'FE 개발자', status: 'DOCUMENT_PASSED' },
  ];
};

// 💡 일정 등록 API
export const createCalendarEvent = async (eventData: any) => {
  // return axios.post('/api/hr/events', eventData);
  console.log("서버에 전송될 데이터:", eventData);
  return { success: true };
};

export const updateCalendarEvent = async (eventId: string, eventData: any) => {
  // return axios.put(`/api/hr/events/${eventId}`, eventData);
  console.log(`${eventId}번 일정 수정 완료`, eventData);
  return { success: true };
};

// 일정 삭제 API
export const deleteCalendarEvent = async (eventId: string) => {
  // return axios.delete(`/api/hr/events/${eventId}`);
  console.log(`${eventId}번 일정 삭제 완료`);
  return { success: true };
};