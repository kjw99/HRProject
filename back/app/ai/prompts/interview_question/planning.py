from langchain_core.messages import HumanMessage, SystemMessage

from app.ai.prompts.interview_question.system import SYSTEM_PROMPT
from app.ai.prompts.interview_question.utils import model_to_json, optional_text
from app.ai.schemas.question_generation import (
    InterviewQuestionGenerationInput,
    QuestionFitAnalysis,
)


def build_question_plan_messages(
    data: InterviewQuestionGenerationInput,
    analysis: QuestionFitAnalysis,
) -> list[SystemMessage | HumanMessage]:
    human_prompt = f"""
Create an interview question plan before generating the actual questions.

Position:
{data.position_name}

Total question count:
{data.question_count}

Additional request:
{optional_text(data.additional_request)}

Fit analysis:
{model_to_json(analysis)}

Job description context:
{optional_text(data.job_description_context)}

Resume context:
{optional_text(data.resume_context)}

Rules:
- The sum of all item counts must equal {data.question_count}.
- Include job-fit questions based on both the job description and resume evidence.
- Include risk/gap verification questions when the analysis has unclear points.
- Include practical communication/collaboration questions only when relevant.
- Do not include protected personal information topics.
- Each item must include category, count, and focus.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
