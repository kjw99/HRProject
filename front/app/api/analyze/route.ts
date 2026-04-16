import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const questionsSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.NUMBER },
          type: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING },
          intent: { type: SchemaType.STRING },
          ragContext: { type: SchemaType.STRING },
        },
        required: ["id", "type", "question", "intent"],
      },
    },
  },
  required: ["questions"],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY가 설정되어 있지 않습니다.", questions: [] },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const job = body?.job;
    const candidate = body?.candidate;

    if (!job?.title || !Array.isArray(job.keySkills) || !candidate?.name) {
      return NextResponse.json({ error: "job / candidate 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: questionsSchema as ResponseSchema,
      },
    });

    const systemPrompt = `당신은 20년 경력의 베테랑 기술 면접관입니다.
채용 공고 정보와 지원자의 이력 요약을 분석하여, 지원자의 실력을 날카롭게 검증할 수 있는 심층 면접 질문을 정확히 3개 생성하세요.
반드시 스키마에 맞는 JSON만 출력하세요.`;

    const userQuery = `[채용공고]: ${job.title}, [필수기술]: ${job.keySkills.join(", ")} / [지원자]: ${candidate.name}, [이력요약]: ${candidate.resumeSummary ?? ""}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userQuery }] }],
      systemInstruction: systemPrompt,
    });

    const text = result.response.text();
    const parsed = JSON.parse(text) as { questions?: unknown[] };
    return NextResponse.json({ questions: parsed.questions ?? [] });
  } catch (e) {
    console.error("[api/analyze]", e);
    return NextResponse.json({ error: "Gemini 호출 중 오류가 발생했습니다.", questions: [] }, { status: 500 });
  }
}
