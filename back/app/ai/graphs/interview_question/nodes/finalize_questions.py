from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.graphs.interview_question.validators import normalize_questions
from app.ai.schemas.question_generation import InterviewQuestionGenerationOutput
from app.core.exceptions import ExternalServiceException


async def finalize_questions(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    questions = normalize_questions(state["questions"])
    if len(questions) < data.question_count:
        raise ExternalServiceException(
            "AI generated fewer interview questions than requested."
        )

    return {
        "final_output": InterviewQuestionGenerationOutput(
            questions=questions[: data.question_count],
        )
    }
