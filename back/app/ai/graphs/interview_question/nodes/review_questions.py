from app.ai.graphs.interview_question.llm import invoke_structured
from app.ai.graphs.interview_question.review_policy import (
    apply_deterministic_review_checks,
)
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import build_question_review_messages
from app.ai.schemas.question_generation import QuestionReviewOutput


async def review_questions(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    result = await invoke_structured(
        schema=QuestionReviewOutput,
        messages=build_question_review_messages(
            data=data,
            analysis=state["analysis"],
            questions=state["questions"],
        ),
        error_message="생성된 면접 질문을 검토하지 못했습니다.",
    )
    review = QuestionReviewOutput.model_validate(result)
    review = apply_deterministic_review_checks(
        review=review,
        questions=state["questions"],
        question_count=data.question_count,
    )

    return {
        "review": review,
    }
