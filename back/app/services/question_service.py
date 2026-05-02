from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.graphs.interview_question_graph import interview_question_graph
from app.ai.schemas.question_generation import InterviewQuestionGraphInput
from app.core.exceptions import NotFoundException
from app.models.candidate import Candidate
from app.models.question import Question
from app.models.resume import Resume
from app.repositories.position_repository import position_repository
from app.repositories.question_repository import question_repository
from app.schemas.question import (
    GeneratedQuestionResponse,
    QuestionGenerateRequest,
    QuestionSaveRequest,
)


POSITION_BASED_QUESTION_TYPE = "position_based"
CANDIDATE_RESUME_BASED_QUESTION_TYPE = "candidate_resume_based"
CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE = "candidate_job_fit_based"


class QuestionService:
    async def generate_questions(
        self,
        db: AsyncSession,
        data: QuestionGenerateRequest,
    ) -> list[GeneratedQuestionResponse]:
        generation_result = await interview_question_graph.generate(
            db,
            InterviewQuestionGraphInput(
                candidate_id=data.candidate_id,
                position_id=data.position_id,
                question_count=data.question_count,
                additional_request=data.additional_request,
                job_description_section=data.job_description_section,
            ),
        )

        return [
            GeneratedQuestionResponse(
                question_text=generated_question.question_text,
                question_type=CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE,
                evaluation_intent=generated_question.evaluation_intent,
                generation_basis=generated_question.generation_basis,
            )
            for generated_question in generation_result.questions
        ]

    async def save_position_questions(
        self,
        db: AsyncSession,
        data: QuestionSaveRequest,
    ) -> None:
        resolved_position_id = data.position_id

        if data.candidate_id is not None:
            candidate = await db.get(Candidate, data.candidate_id)
            if not candidate:
                raise NotFoundException("Candidate not found.")

            resolved_position_id = await self._resolve_save_position_id(
                db,
                candidate,
                data.position_id,
            )
        elif data.position_id is not None and not await position_repository.find_by_id(
            db,
            data.position_id,
        ):
            raise NotFoundException("Position not found.")

        existing_questions = await question_repository.find_by_target(
            db,
            position_id=resolved_position_id,
            candidate_id=data.candidate_id,
        )
        existing_question_keys: set[tuple[str, str]] = set()

        for existing_question in existing_questions:
            if not existing_question.question_text:
                continue

            existing_question_keys.add(
                (
                    existing_question.question_type,
                    existing_question.question_text.strip(),
                )
            )

        question_items = self._get_unique_new_questions(
            data,
            existing_question_keys,
            resolved_position_id,
        )
        if not question_items:
            return

        questions = [
            Question(
                candidate_id=data.candidate_id,
                position_id=resolved_position_id,
                question_text=question_text,
                question_type=question_type,
                evaluation_intent=evaluation_intent,
                generation_basis=generation_basis,
            )
            for (
                question_text,
                question_type,
                evaluation_intent,
                generation_basis,
            ) in question_items
        ]

        question_repository.save_all(db, questions)
        await db.commit()

    def _get_unique_new_questions(
        self,
        data: QuestionSaveRequest,
        existing_question_keys: set[tuple[str, str]],
        resolved_position_id: int | None,
    ) -> list[tuple[str, str, str | None, str | None]]:
        question_items: list[tuple[str, str, str | None, str | None]] = []
        seen_question_keys = set(existing_question_keys)
        default_question_type = self._get_default_save_question_type(
            data,
            resolved_position_id,
        )

        for question in data.questions:
            question_type = (
                question.question_type
                or data.question_type
                or default_question_type
            )
            question_key = (question_type, question.question_text)
            if question_key in seen_question_keys:
                continue

            seen_question_keys.add(question_key)
            question_items.append(
                (
                    question.question_text,
                    question_type,
                    question.evaluation_intent,
                    question.generation_basis,
                )
            )

        return question_items

    async def get_questions(
        self,
        db: AsyncSession,
        position_id: int | None = None,
        candidate_id: int | None = None,
    ) -> list[Question]:
        if position_id is None and candidate_id is None:
            return await question_repository.find_all(db)

        if position_id is not None and not await position_repository.find_by_id(
            db,
            position_id,
        ):
            raise NotFoundException("Position not found.")

        if candidate_id is not None and not await db.get(Candidate, candidate_id):
            raise NotFoundException("Candidate not found.")

        return await question_repository.find_by_target(
            db,
            position_id=position_id,
            candidate_id=candidate_id,
        )

    async def delete_question(
        self,
        db: AsyncSession,
        question_id: int,
    ) -> None:
        question = await question_repository.find_by_id(db, question_id)
        if not question:
            raise NotFoundException("Question not found.")

        await question_repository.delete(db, question)
        await db.commit()

    async def _resolve_save_position_id(
        self,
        db: AsyncSession,
        candidate: Candidate,
        fallback_position_id: int | None,
    ) -> int | None:
        if candidate.position_id is not None:
            return candidate.position_id

        if fallback_position_id is not None:
            if not await position_repository.find_by_id(db, fallback_position_id):
                raise NotFoundException("Position not found.")

            return fallback_position_id

        return await self._find_latest_second_position_id(db, candidate.candidate_id)

    async def _find_latest_second_position_id(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> int | None:
        return await db.scalar(
            select(Resume.second_position_id)
            .where(
                Resume.candidate_id == candidate_id,
                Resume.second_position_id.is_not(None),
            )
            .order_by(
                desc(Resume.created_at),
                desc(Resume.resume_id),
            )
            .limit(1)
        )

    def _get_default_save_question_type(
        self,
        data: QuestionSaveRequest,
        resolved_position_id: int | None,
    ) -> str:
        if data.candidate_id is not None:
            if resolved_position_id is not None:
                return CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE

            return CANDIDATE_RESUME_BASED_QUESTION_TYPE

        return POSITION_BASED_QUESTION_TYPE


question_service = QuestionService()
