from pydantic import ValidationError

from app.ai.clients.llm_errors import map_llm_exception
from app.ai.graphs.interview_question.llm import invoke_structured
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import build_fit_analysis_messages
from app.ai.schemas.question_generation import QuestionFitAnalysis
from app.core.exceptions import ExternalServiceException


async def analyze_fit(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    fallback = "면접 질문 생성을 위한 지원자 적합도 분석에 실패했습니다."
    result = await invoke_structured(
        schema=QuestionFitAnalysis,
        messages=build_fit_analysis_messages(data),
        error_message=fallback,
    )

    try:
        analysis = QuestionFitAnalysis.model_validate(result)
    except ValidationError as exc:
        raise ExternalServiceException(
            map_llm_exception(
                exc,
                "AI가 반환한 적합도 분석 형식이 올바르지 않습니다.",
            ),
        ) from exc

    return {"analysis": analysis}
