from app.ai.graphs.interview_question.llm import invoke_structured
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import build_question_plan_messages
from app.ai.schemas.question_generation import QuestionPlan


async def plan_questions(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    analysis = state["analysis"]

    result = await invoke_structured(
        schema=QuestionPlan,
        messages=build_question_plan_messages(data, analysis),
        error_message="Failed to create interview question plan.",
    )

    return {
        "question_plan": QuestionPlan.model_validate(result),
    }
