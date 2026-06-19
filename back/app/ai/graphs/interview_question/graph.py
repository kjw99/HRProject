from typing import Any

from langgraph.graph import END, StateGraph

from app.ai.graphs.interview_question.nodes import (
    analyze_fit,
    plan_questions,
    generate_question_candidates,
    select_questions,
    review_questions,
    revise_questions,
    finalize_questions,  
)
from app.ai.graphs.interview_question.state import InterviewQuestionGraphState
from app.ai.schemas.question_generation import (
    InterviewQuestionGenerationInput,
    InterviewQuestionGenerationOutput,
)
from app.core.exceptions import ExternalServiceException


MAX_REVISION_COUNT = 2


class InterviewQuestionGraph:
    def __init__(self, max_revision_count: int = MAX_REVISION_COUNT) -> None:
        self._max_revision_count = max_revision_count
        self._graph = self._build_graph()

    async def generate(
        self,
        data: InterviewQuestionGenerationInput,
    ) -> InterviewQuestionGenerationOutput:
        initial_state: InterviewQuestionGraphState = {
            "generation_input": data,
            "revision_count": 0,
        }

        try:
            result = await self._graph.ainvoke(initial_state)
        except ExternalServiceException:
            raise
        except Exception as exc:
            raise ExternalServiceException(
                "LangGraph로 면접 질문을 생성하지 못했습니다."
            ) from exc

        output = result.get("final_output")
        if not output:
            raise ExternalServiceException(
                "질문 생성 그래프가 최종 결과를 반환하지 않았습니다."
            )

        return output

    def _build_graph(self) -> Any:
        workflow = StateGraph(InterviewQuestionGraphState)

        workflow.add_node("analyze_fit", analyze_fit)
        workflow.add_node("plan_questions", plan_questions)
        workflow.add_node("generate_question_candidates", generate_question_candidates)
        workflow.add_node("select_questions", select_questions)
        workflow.add_node("review_questions", review_questions)
        workflow.add_node("revise_questions", revise_questions)
        workflow.add_node("finalize_questions", finalize_questions)

        workflow.set_entry_point("analyze_fit")
        workflow.add_edge("analyze_fit", "plan_questions")
        workflow.add_edge("plan_questions", "generate_question_candidates")
        workflow.add_edge("generate_question_candidates", "select_questions")
        workflow.add_edge("select_questions", "review_questions")
        workflow.add_conditional_edges(
            "review_questions",
            self._route_after_review,
            {
                "revise": "revise_questions",
                "finalize": "finalize_questions",
            },
        )
        workflow.add_edge("revise_questions", "review_questions")
        workflow.add_edge("finalize_questions", END)

        return workflow.compile()

    def _route_after_review(self, state: InterviewQuestionGraphState) -> str:
        review = state.get("review")
        revision_count = state.get("revision_count", 0)
        if (
            review
            and not review.passed
            and revision_count < self._max_revision_count
        ):
            return "revise"

        return "finalize"


interview_question_graph = InterviewQuestionGraph()
