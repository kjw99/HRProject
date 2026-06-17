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

Overall requested question count:
{data.final_question_count}

Additional request:
{optional_text(data.additional_request)}

Fit analysis:
{model_to_json(analysis)}

Job description context:
{optional_text(data.job_description_context)}

Resume keywords:
{optional_list(data.resume_keywords)}

Resume highlights:
{optional_list(data.resume_highlights)}

Resume evidence:
{optional_text(data.resume_context)}

Already reused questions:
{model_to_json(data.reused_questions)}

Rules:
- The sum of all item counts must equal {data.question_count}.
- Treat already reused questions as fixed and plan only the remaining questions.
- Build the plan from the candidate's actual keywords, highlights, and job-fit evidence.
- Include practical verification questions for highlighted projects, outcomes, and problem solving.
- Include risk or gap verification questions when the analysis has unclear points.
- Do not include protected personal information topics.
- Each item must include category, count, and focus.
""".strip()

    return [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=human_prompt),
    ]
