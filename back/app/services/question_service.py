from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.graphs.interview_question import interview_question_graph
from app.ai.schemas.question_generation import (
    GeneratedQuestion,
    InterviewQuestionGenerationInput,
)
from app.core.exceptions import ConflictException, ForbiddenException, NotFoundException
from app.models.candidate import Candidate
from app.models.interviewer import Interviewer
from app.models.question import Question
from app.models.question_generation_job import (
    QUESTION_GENERATION_STATUS_SUCCEEDED,
    QuestionGenerationJob,
)
from app.repositories.candidate_repository import candidate_repository
from app.repositories.position_repository import position_repository
from app.repositories.question_generation_job_repository import (
    question_generation_job_repository,
)
from app.repositories.question_repository import question_repository
from app.schemas.question import (
    GeneratedQuestionResponse,
    QuestionGenerateRequest,
    QuestionSaveRequest,
)
from app.services.job_description_service import job_description_service
from app.services.resume_context_service import resume_context_service


POSITION_BASED_QUESTION_TYPE = "position_based"
CANDIDATE_RESUME_BASED_QUESTION_TYPE = "candidate_resume_based"
CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE = "candidate_job_fit_based"


class QuestionService:
    async def generate_questions(self, db: AsyncSession, data: QuestionGenerateRequest) -> list[GeneratedQuestionResponse]:
        generation_input = await self.build_generation_input(db, data)
        return await self.generate_questions_from_input(generation_input)

    async def build_generation_input(
        self,
        db: AsyncSession,
        data: QuestionGenerateRequest,
    ) -> InterviewQuestionGenerationInput:
        resume_context = await resume_context_service.build_context(
            db=db,
            candidate_id=data.candidate_id,
            position_id=data.position_id,
        )
        job_description_context = job_description_service.get_context_for_position(
            resume_context.position,
            data.job_description_section,
        )

        return InterviewQuestionGenerationInput(
            position_name=resume_context.position.position_name,
            question_count=data.question_count,
            additional_request=data.additional_request,
            generation_mode=CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE,
            job_description_context=job_description_context,
            resume_context=resume_context.text,
        )

    async def generate_questions_from_input(
        self,
        generation_input: InterviewQuestionGenerationInput,
    ) -> list[GeneratedQuestionResponse]:
        generation_result = await interview_question_graph.generate(generation_input)
        return self.to_generated_question_responses(generation_result.questions)

    def to_generated_question_responses(
        self,
        generated_questions: list[GeneratedQuestion],
    ) -> list[GeneratedQuestionResponse]:
        return [
            GeneratedQuestionResponse(
                question_text=generated_question.question_text,
                question_type=CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE,
                evaluation_intent=generated_question.evaluation_intent,
                generation_basis=generated_question.generation_basis,
            )
            for generated_question in generated_questions
        ]

    async def generate_questions_for_interviewer(
        self,
        db: AsyncSession,
        interviewer: Interviewer,
        data: QuestionGenerateRequest,
    ) -> list[GeneratedQuestionResponse]:
        if interviewer.position_id is None:
            raise ForbiddenException("Interviewer position is required")

        candidate = await candidate_repository.find_by_id(db, data.candidate_id)
        if not candidate:
            raise NotFoundException("Candidate not found")

        if candidate.position_id != interviewer.position_id:
            raise ForbiddenException("Cannot generate questions for another position")

        interviewer_data = data.model_copy(update={"position_id": interviewer.position_id})
        return await self.generate_questions(db, interviewer_data)

    async def save_position_questions(self, db: AsyncSession, data: QuestionSaveRequest, created_by_user_id: int | None = None, created_by_interviewer_id: int | None = None) -> None:
        resolved_position_id = data.position_id

        if data.candidate_id is not None:
            candidate = await candidate_repository.find_by_id(db, data.candidate_id)
            if not candidate:
                raise NotFoundException("Candidate not found")
            resolved_position_id = await self._resolve_save_position_id(db, candidate, data.position_id)
        elif data.position_id is not None and not await position_repository.find_by_id(db, data.position_id):
            raise NotFoundException("Position not found")

        existing_questions = await question_repository.find_by_target(db, position_id=resolved_position_id, candidate_id=data.candidate_id)
        existing_question_keys: set[tuple[str, str]] = set()
        for existing_question in existing_questions:
            if existing_question.question_text:
                existing_question_keys.add((existing_question.question_type, existing_question.question_text.strip()))

        question_items = self._get_unique_new_questions(data, existing_question_keys, resolved_position_id)
        if not question_items:
            return

        await self._validate_generation_job_questions(
            db=db,
            data=data,
            question_items=question_items,
            resolved_position_id=resolved_position_id,
            created_by_user_id=created_by_user_id,
            created_by_interviewer_id=created_by_interviewer_id,
        )

        questions = [
            Question(
                candidate_id=data.candidate_id,
                position_id=resolved_position_id,
                question_text=question_text,
                question_type=question_type,
                evaluation_intent=evaluation_intent,
                generation_basis=generation_basis,
                created_by_user_id=created_by_user_id,
                created_by_interviewer_id=created_by_interviewer_id,
            )
            for (question_text, question_type, evaluation_intent, generation_basis) in question_items
        ]
        question_repository.save_all(db, questions)
        await db.commit()

    async def save_questions_for_interviewer(self, db: AsyncSession, interviewer: Interviewer, data: QuestionSaveRequest) -> None:
        if interviewer.position_id is None:
            raise ForbiddenException("Interviewer position is required")

        if data.candidate_id is not None:
            candidate = await candidate_repository.find_by_id(db, data.candidate_id)
            if not candidate:
                raise NotFoundException("Candidate not found")
            if candidate.position_id != interviewer.position_id:
                raise ForbiddenException("Cannot create questions for another position")

        interviewer_data = data.model_copy(update={"position_id": interviewer.position_id})
        await self.save_position_questions(
            db,
            interviewer_data,
            created_by_user_id=None,
            created_by_interviewer_id=interviewer.interviewer_id,
        )

    async def get_questions(self, db: AsyncSession, position_id: int | None = None, candidate_id: int | None = None) -> list[Question]:
        if position_id is None and candidate_id is None:
            return await question_repository.find_all(db)
        if position_id is not None and not await position_repository.find_by_id(db, position_id):
            raise NotFoundException("Position not found")
        if candidate_id is not None and not await candidate_repository.find_by_id(db, candidate_id):
            raise NotFoundException("Candidate not found")
        return await question_repository.find_by_target(db, position_id=position_id, candidate_id=candidate_id)

    async def get_questions_for_interviewer(self, db: AsyncSession, interviewer: Interviewer, candidate_id: int | None = None) -> list[Question]:
        if interviewer.position_id is None:
            raise ForbiddenException("Interviewer position is required")
        if candidate_id is not None:
            candidate = await candidate_repository.find_by_id(db, candidate_id)
            if not candidate:
                raise NotFoundException("Candidate not found")
            if candidate.position_id != interviewer.position_id:
                raise ForbiddenException("Cannot access questions for another position")
        return await question_repository.find_by_target(db, position_id=interviewer.position_id, candidate_id=candidate_id)

    async def delete_question(self, db: AsyncSession, question_id: int) -> None:
        question = await question_repository.find_by_id(db, question_id)
        if not question:
            raise NotFoundException("Question not found")
        await question_repository.delete(db, question)
        await db.commit()

    async def delete_question_for_interviewer(self, db: AsyncSession, interviewer: Interviewer, question_id: int) -> None:
        question = await question_repository.find_by_id(db, question_id)
        if not question:
            raise NotFoundException("Question not found")
        if question.position_id != interviewer.position_id:
            raise ForbiddenException("Cannot delete questions from another position")
        if question.created_by_interviewer_id != interviewer.interviewer_id:
            raise ForbiddenException("Can only delete own questions")
        await question_repository.delete(db, question)
        await db.commit()

    async def _resolve_save_position_id(self, db: AsyncSession, candidate: Candidate, fallback_position_id: int | None) -> int | None:
        if candidate.position_id is not None:
            return candidate.position_id
        if fallback_position_id is not None:
            if not await position_repository.find_by_id(db, fallback_position_id):
                raise NotFoundException("Position not found")
            return fallback_position_id
        return None

    def _get_unique_new_questions(self, data: QuestionSaveRequest, existing_question_keys: set[tuple[str, str]], resolved_position_id: int | None) -> list[tuple[str, str, str | None, str | None]]:
        question_items: list[tuple[str, str, str | None, str | None]] = []
        seen_question_keys = set(existing_question_keys)
        default_question_type = self._get_default_save_question_type(data, resolved_position_id)
        for question in data.questions:
            question_type = question.question_type or data.question_type or default_question_type
            question_key = (question_type, question.question_text)
            if question_key in seen_question_keys:
                continue
            seen_question_keys.add(question_key)
            question_items.append((question.question_text, question_type, question.evaluation_intent, question.generation_basis))
        return question_items

    def _get_default_save_question_type(self, data: QuestionSaveRequest, resolved_position_id: int | None) -> str:
        if data.candidate_id is not None:
            if resolved_position_id is not None:
                return CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE
            return CANDIDATE_RESUME_BASED_QUESTION_TYPE
        return POSITION_BASED_QUESTION_TYPE

    async def _validate_generation_job_questions(
        self,
        db: AsyncSession,
        data: QuestionSaveRequest,
        question_items: list[tuple[str, str, str | None, str | None]],
        resolved_position_id: int | None,
        created_by_user_id: int | None,
        created_by_interviewer_id: int | None,
    ) -> None:
        if data.generation_job_id is None:
            return

        job = await question_generation_job_repository.find_by_id(
            db,
            data.generation_job_id,
        )
        if not job:
            raise NotFoundException("질문 생성 작업을 찾을 수 없습니다.")

        self._validate_generation_job_owner(
            job=job,
            created_by_user_id=created_by_user_id,
            created_by_interviewer_id=created_by_interviewer_id,
        )

        if job.status != QUESTION_GENERATION_STATUS_SUCCEEDED:
            raise ConflictException("완료된 질문 생성 작업만 저장할 수 있습니다.")

        if job.candidate_id != data.candidate_id:
            raise ConflictException("질문 생성 작업의 지원자 정보가 일치하지 않습니다.")

        if job.position_id is not None and job.position_id != resolved_position_id:
            raise ConflictException("질문 생성 작업의 직무 정보가 일치하지 않습니다.")

        generated_question_keys = self._get_generated_question_keys(job)
        for question_text, question_type, _, _ in question_items:
            if (question_type, question_text) not in generated_question_keys:
                raise ConflictException(
                    "선택한 질문이 해당 생성 작업의 결과에 포함되어 있지 않습니다."
                )

    def _validate_generation_job_owner(
        self,
        job: QuestionGenerationJob,
        created_by_user_id: int | None,
        created_by_interviewer_id: int | None,
    ) -> None:
        if created_by_user_id is not None:
            if job.created_by_user_id != created_by_user_id:
                raise ForbiddenException("질문 생성 작업에 접근할 수 없습니다.")
            return

        if created_by_interviewer_id is not None:
            if job.created_by_interviewer_id != created_by_interviewer_id:
                raise ForbiddenException("질문 생성 작업에 접근할 수 없습니다.")
            return

        raise ForbiddenException("질문 생성 작업 소유자를 확인할 수 없습니다.")

    def _get_generated_question_keys(
        self,
        job: QuestionGenerationJob,
    ) -> set[tuple[str, str]]:
        generated_question_keys: set[tuple[str, str]] = set()
        for question in job.result_questions or []:
            question_text = (
                question.get("question_text")
                or question.get("questionText")
                or ""
            )
            question_type = (
                question.get("question_type")
                or question.get("questionType")
                or CANDIDATE_JOB_FIT_BASED_QUESTION_TYPE
            )
            stripped_question_text = str(question_text).strip()
            stripped_question_type = str(question_type).strip()
            if stripped_question_text and stripped_question_type:
                generated_question_keys.add(
                    (stripped_question_type, stripped_question_text)
                )

        return generated_question_keys


question_service = QuestionService()
