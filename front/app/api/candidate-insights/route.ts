import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const insightSchema = {
  type: SchemaType.OBJECT,
  properties: {
    strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    risks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    scorecard: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: ["strengths", "risks", "scorecard"],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되어 있지 않습니다.", strengths: [], risks: [], scorecard: [] },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const job = body?.job;
    const candidate = body?.candidate;

    if (!job?.title || !candidate?.name) {
      return NextResponse.json({ error: "job / candidate 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: insightSchema as ResponseSchema,
      },
    });

    const systemPrompt = `당신은 HR 전략 컨설턴트입니다.
지원자의 이력과 채용 공고를 비교하여 강점 2개, 잠재적 리스크 2개, 면접에서 사용할 평가 척도(Scorecard) 3개를 제안하세요.
반드시 스키마에 맞는 JSON만 출력하세요.`;

    const userQuery = `[직무]: ${job.title} / [지원자]: ${candidate.name}, [이력 요약]: ${candidate.resumeSummary ?? ""}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userQuery }] }],
      systemInstruction: systemPrompt,
    });

    const text = result.response.text();
    const parsed = JSON.parse(text) as {
      strengths?: string[];
      risks?: string[];
      scorecard?: string[];
    };

    return NextResponse.json({
      strengths: parsed.strengths ?? [],
      risks: parsed.risks ?? [],
      scorecard: parsed.scorecard ?? [],
    });
  } catch (e) {
    console.error("[api/candidate-insights]", e);
    return NextResponse.json(
      { error: "Gemini 호출 중 오류가 발생했습니다.", strengths: [], risks: [], scorecard: [] },
      { status: 500 }
    );
  }
}
