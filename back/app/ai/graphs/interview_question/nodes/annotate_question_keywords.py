from app.ai.graphs.interview_question.llm import invoke_question_output
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import (
    build_question_keyword_annotation_messages,
)


async def annotate_question_keywords(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    questions = state["questions"]

    if not data.resume_keywords:
        return {"questions": questions}

    output = await invoke_question_output(
        messages=build_question_keyword_annotation_messages(
            data=data,
            questions=questions,
        ),
        question_count=len(questions),
        error_message="질문별 키워드를 매핑하지 못했습니다.",
        count_error_message=(
            "AI가 질문별 키워드 매핑 결과를 충분히 반환하지 못했습니다."
        ),
    )

    return {"questions": output.questions}
