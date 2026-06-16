from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import (
    model_to_json,
    optional_list,
    optional_text,
)
from app.ai.schemas.question_generation import (
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
    QuestionPlan,
)


def build_interview_question_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis | None = None,
) -> list[SystemMessage | HumanMessage]:
    additional_request = optional_text(data.additional_request)
    analysis_text = model_to_json(analysis) if analysis else "No fit analysis provided."
    human_prompt = f"""
Create exactly {data.question_count} interview questions based on the candidate and job context below.

Position: {data.position_name}
Generation mode: {data.generation_mode}
Question count: {data.question_count}
Additional request: {additional_request}

## Fit analysis
{analysis_text}

## Job description context
{optional_text(data.job_description_context)}

## Resume keywords
{optional_list(data.resume_keywords)}

## Resume highlights
{optional_list(data.resume_highlights)}

## Resume evidence
{optional_text(data.resume_context)}

Rules:
- Use the candidate's actual keywords and highlights as evidence.
- Ask concrete questions about projects, outcomes, decisions, trade-offs, and problem solving.
- If evidence is weak, ask a verification question instead of assuming experience.
- Do not ask about protected or irrelevant personal information.
- Every question_text must start with "[ ]".
- Each item must include only question_text, evaluation_intent, and generation_basis.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]


def build_question_candidate_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    question_plan: QuestionPlan | None,
    candidate_count: int,
) -> list[SystemMessage | HumanMessage]:
    additional_request = optional_text(data.additional_request)
    question_plan_text = (
        model_to_json(question_plan) if question_plan else "No question plan provided."
    )
    human_prompt = f"""
Generate exactly {candidate_count} candidate interview questions to later select the best final {data.question_count}.

Position: {data.position_name}
Generation mode: {data.generation_mode}
Final question count: {data.question_count}
Candidate question count: {candidate_count}
Additional request: {additional_request}

## Fit analysis
{model_to_json(analysis)}

## Question plan
{question_plan_text}

## Job description context
{optional_text(data.job_description_context)}

## Resume keywords
{optional_list(data.resume_keywords)}

## Resume highlights
{optional_list(data.resume_highlights)}

## Resume evidence
{optional_text(data.resume_context)}

Rules:
- Follow the question plan categories and counts.
- Build question pairs with different phrasing or evidence angles when possible.
- Use keywords and highlights to make questions specific rather than generic.
- Prefer questions that verify real work, outcomes, technical decisions, and risk handling.
- If the resume evidence is incomplete, ask a neutral verification question.
- Do not ask about protected or irrelevant personal information.
- Every question_text must start with "[ ]".
- Return exactly {candidate_count} items.
- Each item must include only question_text, evaluation_intent, and generation_basis.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
