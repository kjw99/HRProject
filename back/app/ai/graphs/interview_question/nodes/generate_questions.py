from app.ai.graphs.interview_question.llm import invoke_question_output
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import (
    build_question_candidate_messages,
)


async def generate_question_candidates(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    analysis = state["analysis"]
    candidate_count = data.question_count * 2
    output = await invoke_question_output(
        messages=build_question_candidate_messages(
            data=data,
            analysis=analysis,
            candidate_count=candidate_count,
        ),
        question_count=candidate_count,
        error_message="Failed to generate interview question candidates.",
    )

    return {
        "candidate_questions": output.questions,
    }
