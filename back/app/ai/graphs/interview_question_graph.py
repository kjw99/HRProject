from typing import Any, TypedDict

from langgraph.graph import END, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.clients.openai_client import get_chat_model
from app.ai.prompts.interview_question_prompt import (
    build_fit_analysis_messages,
    build_interview_question_messages,
    build_question_review_messages,
    build_question_revision_messages,
)
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
    InterviewQuestionGenerationOutput,
    InterviewQuestionGraphInput,
    QuestionFitAnalysis,
    QuestionReviewIssue,
    QuestionReviewOutput,
)
from app.core.exceptions import ExternalServiceException
from app.services.job_description_service import job_description_service
from app.services.resume_context_service import resume_context_service


CANDIDATE_JOB_FIT_BASED_MODE = "candidate_job_fit_based"
MAX_REVISION_COUNT = 2
MIN_REVIEW_SCORE = 85


class InterviewQuestionGraphState(TypedDict, total=False):
    db: AsyncSession
    candidate_id: int
    position_id: int | None
    question_count: int
    additional_request: str | None
    job_description_section: str | None
    generation_input: InterviewQuestionGenerationInput
    analysis: QuestionFitAnalysis
    questions: list[GeneratedQuestion]
    review: QuestionReviewOutput
    revision_count: int
    final_output: InterviewQuestionGenerationOutput


class InterviewQuestionGraph:
    def __init__(self, max_revision_count: int = MAX_REVISION_COUNT) -> None:
        self._max_revision_count = max_revision_count
        self._graph = self._build_graph()

    async def generate(
        self,
        db: AsyncSession,
        data: InterviewQuestionGraphInput,
    ) -> InterviewQuestionGenerationOutput:
        initial_state: InterviewQuestionGraphState = {
            "db": db,
            "candidate_id": data.candidate_id,
            "position_id": data.position_id,
            "question_count": data.question_count,
            "additional_request": data.additional_request,
            "job_description_section": data.job_description_section,
            "revision_count": 0,
        }

        try:
            result = await self._graph.ainvoke(initial_state)
        except ExternalServiceException:
            raise
        except Exception as exc:
            raise ExternalServiceException(
                "Failed to generate interview questions with LangGraph."
            ) from exc

        output = result.get("final_output")
        if not output:
            raise ExternalServiceException(
                "Question generation graph did not return final output."
            )

        return output

    def _build_graph(self) -> Any:
        workflow = StateGraph(InterviewQuestionGraphState)

        workflow.add_node("collect_context", self._collect_context)
        workflow.add_node("analyze_fit", self._analyze_fit)
        workflow.add_node("generate_questions", self._generate_questions)
        workflow.add_node("review_questions", self._review_questions)
        workflow.add_node("revise_questions", self._revise_questions)
        workflow.add_node("finalize_questions", self._finalize_questions)

        workflow.set_entry_point("collect_context")
        workflow.add_edge("collect_context", "analyze_fit")
        workflow.add_edge("analyze_fit", "generate_questions")
        workflow.add_edge("generate_questions", "review_questions")
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

    async def _collect_context(
        self,
        state: InterviewQuestionGraphState,
    ) -> InterviewQuestionGraphState:
        db = state["db"]
        resume_context = await resume_context_service.build_context(
            db=db,
            candidate_id=state["candidate_id"],
            position_id=state.get("position_id"),
        )
        job_description_context = job_description_service.get_context_for_position(
            resume_context.position,
            state.get("job_description_section"),
        )
        generation_input = InterviewQuestionGenerationInput(
            position_name=resume_context.position.position_name,
            question_count=state["question_count"],
            additional_request=state.get("additional_request"),
            generation_mode=CANDIDATE_JOB_FIT_BASED_MODE,
            job_description_context=job_description_context,
            resume_context=resume_context.text,
        )

        return {
            "generation_input": generation_input,
        }

    async def _analyze_fit(
        self,
        state: InterviewQuestionGraphState,
    ) -> InterviewQuestionGraphState:
        data = state["generation_input"]
        result = await self._invoke_structured(
            schema=QuestionFitAnalysis,
            messages=build_fit_analysis_messages(data),
            error_message="Failed to analyze candidate fit for interview questions.",
        )

        return {
            "analysis": QuestionFitAnalysis.model_validate(result),
        }

    async def _generate_questions(
        self,
        state: InterviewQuestionGraphState,
    ) -> InterviewQuestionGraphState:
        data = state["generation_input"]
        analysis = state["analysis"]
        output = await self._invoke_question_output(
            messages=build_interview_question_messages(data, analysis),
            question_count=data.question_count,
            error_message="Failed to generate interview questions.",
        )

        return {
            "questions": output.questions,
        }

    async def _review_questions(
        self,
        state: InterviewQuestionGraphState,
    ) -> InterviewQuestionGraphState:
        data = state["generation_input"]
        result = await self._invoke_structured(
            schema=QuestionReviewOutput,
            messages=build_question_review_messages(
                data=data,
                analysis=state["analysis"],
                questions=state["questions"],
            ),
            error_message="Failed to review generated interview questions.",
        )
        review = QuestionReviewOutput.model_validate(result)
        review = self._apply_deterministic_review_checks(
            review=review,
            questions=state["questions"],
            question_count=data.question_count,
        )

        return {
            "review": review,
        }

    async def _revise_questions(
        self,
        state: InterviewQuestionGraphState,
    ) -> InterviewQuestionGraphState:
        data = state["generation_input"]
        output = await self._invoke_question_output(
            messages=build_question_revision_messages(
                data=data,
                analysis=state["analysis"],
                questions=state["questions"],
                review=state["review"],
            ),
            question_count=data.question_count,
            error_message="Failed to revise interview questions.",
        )

        return {
            "questions": output.questions,
            "revision_count": state.get("revision_count", 0) + 1,
        }

    async def _finalize_questions(
        self,
        state: InterviewQuestionGraphState,
    ) -> InterviewQuestionGraphState:
        data = state["generation_input"]
        questions = self._normalize_questions(state["questions"])
        if len(questions) < data.question_count:
            raise ExternalServiceException(
                "AI generated fewer interview questions than requested."
            )

        return {
            "final_output": InterviewQuestionGenerationOutput(
                questions=questions[: data.question_count],
            )
        }

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

    async def _invoke_structured(
        self,
        schema: type[Any],
        messages: list[Any],
        error_message: str,
    ) -> Any:
        try:
            llm = get_chat_model().with_structured_output(schema)
            return await llm.ainvoke(messages)
        except ExternalServiceException:
            raise
        except Exception as exc:
            raise ExternalServiceException(error_message) from exc

    async def _invoke_question_output(
        self,
        messages: list[Any],
        question_count: int,
        error_message: str,
    ) -> InterviewQuestionGenerationOutput:
        result = await self._invoke_structured(
            schema=InterviewQuestionGenerationOutput,
            messages=messages,
            error_message=error_message,
        )

        try:
            output = InterviewQuestionGenerationOutput.model_validate(result)
            questions = self._normalize_questions(output.questions)
        except Exception as exc:
            raise ExternalServiceException(
                "AI returned an invalid interview question format."
            ) from exc

        if len(questions) < question_count:
            raise ExternalServiceException(
                "AI generated fewer interview questions than requested."
            )

        return InterviewQuestionGenerationOutput(questions=questions[:question_count])

    def _normalize_questions(
        self,
        questions: list[GeneratedQuestion],
    ) -> list[GeneratedQuestion]:
        normalized_questions: list[GeneratedQuestion] = []
        seen_texts: set[str] = set()

        for question in questions:
            question_text = question.question_text.strip()
            if not question_text or question_text in seen_texts:
                continue

            seen_texts.add(question_text)
            normalized_questions.append(
                GeneratedQuestion(
                    question_text=question_text,
                    evaluation_intent=question.evaluation_intent.strip(),
                    generation_basis=question.generation_basis.strip(),
                )
            )

        return normalized_questions

    def _apply_deterministic_review_checks(
        self,
        review: QuestionReviewOutput,
        questions: list[GeneratedQuestion],
        question_count: int,
    ) -> QuestionReviewOutput:
        issues = list(review.issues)
        hard_failure = False
        needs_revision = False

        for issue in issues:
            severity = issue.severity.strip().casefold()
            if severity == "critical":
                hard_failure = True
            elif severity == "major":
                needs_revision = True

        if len(questions) != question_count:
            hard_failure = True
            issues.append(
                QuestionReviewIssue(
                    severity="critical",
                    reason=(
                        f"요청 질문 개수는 {question_count}개이지만 "
                        f"생성 질문은 {len(questions)}개입니다."
                    ),
                    suggestion="요청 개수와 정확히 일치하도록 질문을 보완하세요.",
                )
            )

        seen_texts: set[str] = set()
        for index, question in enumerate(questions, start=1):
            question_text = question.question_text.strip()
            if question_text in seen_texts:
                hard_failure = True
                issues.append(
                    QuestionReviewIssue(
                        question_number=index,
                        severity="major",
                        reason="동일한 질문이 중복 생성되었습니다.",
                        suggestion="중복 질문을 다른 검증 관점의 질문으로 교체하세요.",
                    )
                )
            seen_texts.add(question_text)

            if not question_text.startswith("[ ]"):
                needs_revision = True
                issues.append(
                    QuestionReviewIssue(
                        question_number=index,
                        severity="minor",
                        reason='질문이 "[ ]" 형식으로 시작하지 않습니다.',
                        suggestion='질문 문두를 "[ ]" 형식으로 맞추세요.',
                    )
                )

        passed = (
            review.passed
            and review.score >= MIN_REVIEW_SCORE
            and not hard_failure
            and not needs_revision
        )
        score = review.score
        if hard_failure:
            score = min(score, 70)
        elif needs_revision:
            score = min(score, MIN_REVIEW_SCORE - 1)
        elif not passed:
            score = min(score, MIN_REVIEW_SCORE - 1)

        return QuestionReviewOutput(
            passed=passed,
            score=score,
            summary=review.summary,
            issues=issues,
        )


interview_question_graph = InterviewQuestionGraph()
