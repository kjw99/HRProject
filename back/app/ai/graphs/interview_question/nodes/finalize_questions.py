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
            # "AI가 요청한 개수보다 적은 면접 질문을 생성했습니다."
            f"Final question count is too small. actual={len(questions)}, expected={data.question_count}"
        )

    return {
        "final_output": InterviewQuestionGenerationOutput(
            questions=questions[: data.question_count],
        )
    }
