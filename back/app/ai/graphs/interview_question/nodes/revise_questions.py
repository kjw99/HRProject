from app.ai.graphs.interview_question.llm import invoke_question_output
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import (
    build_question_revision_messages,
)


async def revise_questions(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    output = await invoke_question_output(
        messages=build_question_revision_messages(
            data=data,
            analysis=state["analysis"],
            questions=state["questions"],
            review=state["review"],
        ),
        question_count=data.question_count,
        error_message="면접 질문을 수정하지 못했습니다.",
    )

    return {
        "questions": output.questions,
        "revision_count": state.get("revision_count", 0) + 1,
    }
