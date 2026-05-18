from app.ai.graphs.interview_question.llm import invoke_question_output
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.prompts.interview_question import (
    build_question_candidate_messages,
)

#####사비카 수정########
async def generate_question_candidates(
    state: InterviewQuestionGraphState,
) -> InterviewQuestionGraphState:
    data = state["generation_input"]
    analysis = state["analysis"]
    question_plan = state["question_plan"]

    candidate_count = data.question_count * 2
    batch_size = 10
    candidate_questions = []

    while len(candidate_questions) < candidate_count:
        remaining_count = candidate_count - len(candidate_questions)
        current_batch_count = min(batch_size, remaining_count)

        output = await invoke_question_output(
            messages=build_question_candidate_messages(
                data=data,
                analysis=analysis,
                question_plan=question_plan,
                candidate_count=current_batch_count,
            ),
            question_count=current_batch_count,
            error_message="면접 질문 후보를 생성하지 못했습니다.",
            count_error_message=(
                f"AI generated fewer candidate questions than required. "
                f"expected={current_batch_count}"
            ),
        )

        candidate_questions.extend(output.questions)

    return {
        "candidate_questions": candidate_questions[:candidate_count],
    }
###############################



# async def generate_question_candidates(
#     state: InterviewQuestionGraphState,
# ) -> InterviewQuestionGraphState:
#     data = state["generation_input"]
#     analysis = state["analysis"]
#     # question_plan = state.get("question_plan")
#     question_plan = state["question_plan"]
#     candidate_count = data.question_count * 2
#     output = await invoke_question_output(
#         messages=build_question_candidate_messages(
#             data=data,
#             analysis=analysis,
#             question_plan=question_plan,
#             candidate_count=candidate_count,
#         ),
#         question_count=candidate_count,
#         error_message="면접 질문 후보를 생성하지 못했습니다.",
#         count_error_message=(
#             f"AI generated fewer candidate questions than required. "
#             f"expected={candidate_count}")
#     )

#     return {
#         "candidate_questions": output.questions,
#     }
