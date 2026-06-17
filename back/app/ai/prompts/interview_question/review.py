from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
)


def build_question_review_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
    questions: list[GeneratedQuestion],
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
Review the draft interview questions below.

Position: {data.position_name}
Question count to review now: {data.question_count}
Overall requested question count: {data.final_question_count}
Additional request: {optional_text(data.additional_request)}

## Fit analysis
{model_to_json(analysis)}

## Draft questions
{model_to_json(questions)}

## Already reused questions
{model_to_json(data.reused_questions)}

Review criteria:
- The number of draft questions must exactly match {data.question_count}.
- Each question must be relevant to the job description and candidate evidence.
- Questions should be specific enough to evaluate real experience, decisions, and outcomes.
- The draft questions must not duplicate or closely paraphrase already reused questions.
- Avoid protected or irrelevant personal information.
- generation_basis should reflect the available evidence.

Scoring:
- Score from 0 to 100.
- passed should be true only when the score is 85 or higher and there is no major issue.
- If improvement is needed, explain the issue and the fix clearly.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
