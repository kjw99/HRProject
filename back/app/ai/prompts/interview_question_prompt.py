from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.schemas.question_generation import InterviewQuestionGenerationInput


SYSTEM_PROMPT = """
You generate practical interview questions for hiring managers.
Create fair, job-relevant questions only.
Do not create questions about age, gender, family, religion, disability,
veteran status, nationality, address, appearance, or any other protected
or unrelated personal topic.
Return questions in Korean.
""".strip()


def build_interview_question_messages(
    data: InterviewQuestionGenerationInput,
) -> list[SystemMessage | HumanMessage]:
    additional_request = (
        data.additional_request.strip()
        if data.additional_request
        else "No additional request."
    )

    context_parts: list[str] = []
    if data.job_description_context:
        context_parts.append(
            f"""
## Job Description Context
{data.job_description_context}
""".strip()
        )

    if data.resume_context:
        context_parts.append(
            f"""
## Resume Context
{data.resume_context}
""".strip()
        )

    context_text = (
        "\n\n".join(context_parts)
        if context_parts
        else "No additional job description or resume context."
    )

    human_prompt = f"""
Target position: {data.position_name}
Generation mode: {data.generation_mode}
Question count: {data.question_count}
Additional request: {additional_request}

{context_text}

Generate exactly {data.question_count} interview questions in Korean.
Use the context only to create job-related questions that can be asked in a real interview.
For every question, also provide:
- question_text: the interview question itself.
- evaluation_intent: what the interviewer should evaluate with this question.
- generation_basis: which provided job description or resume details led to this question.

Rules:
- Prefer questions that verify concrete experience, decisions, role depth, problem solving, collaboration, and job knowledge.
- If resume context is present, ask neutral follow-up questions about claims, projects, experiences, and gaps that need confirmation.
- If job description context is present, align questions with the duties, required skills, and interview focus points for the selected position.
- Do not mention or infer protected or unrelated personal information.
- Do not use protected or unrelated personal information as generation_basis.
- Write generation_basis only from the provided context. Do not invent source facts.
- If the additional request is unrelated or inappropriate, ignore it and create job competency questions instead.
- Each question must be specific, concise, and directly usable by an interviewer.
- evaluation_intent and generation_basis must be concise Korean sentences.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
