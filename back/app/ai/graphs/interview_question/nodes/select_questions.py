from app.ai.graphs.interview_question.llm import invoke_structured
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.graphs.interview_question.validators import normalize_questions
from app.ai.prompts.interview_question import build_question_selection_messages
from app.ai.schemas.question_generation import QuestionSelectionOutput
from app.core.exceptions import ExternalServiceException


async def select_questions(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    candidate_questions = state["candidate_questions"]
    expected_candidate_count = data.question_count * 2

    if len(candidate_questions) < expected_candidate_count:
        raise ExternalServiceException(
            "AI가 요청한 개수보다 적은 면접 질문 후보를 생성했습니다."
        )

    result = await invoke_structured(
        schema=QuestionSelectionOutput,
        messages=build_question_selection_messages(
            data=data,
            analysis=state["analysis"],
            candidate_questions=candidate_questions[:expected_candidate_count],
        ),
        error_message="면접 질문 후보 중 질문을 선택하지 못했습니다.",
    )

    try:
        output = QuestionSelectionOutput.model_validate(result)
        selected_questions = normalize_questions(output.selected_questions)
    except Exception as exc:
        raise ExternalServiceException(
            "AI가 유효하지 않은 면접 질문 선택 형식을 반환했습니다."
        ) from exc

    if len(selected_questions) < data.question_count:
        raise ExternalServiceException(
            "AI가 요청한 개수보다 적은 면접 질문을 선택했습니다."
        )

    return {
        "questions": selected_questions[: data.question_count],
    }
