from app.ai.graphs.interview_question.llm import invoke_structured
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import build_fit_analysis_messages
from app.ai.schemas.question_generation import QuestionFitAnalysis


async def analyze_fit(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    result = await invoke_structured(
        schema=QuestionFitAnalysis,
        messages=build_fit_analysis_messages(data),
        error_message="Failed to analyze candidate fit for interview questions.",
    )

    return {
        "analysis": QuestionFitAnalysis.model_validate(result),
    }
