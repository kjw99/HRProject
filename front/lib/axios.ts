import { Candidate, CandidateInsight, GeneratedQuestion, JobPosting } from "@/types/hr";

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