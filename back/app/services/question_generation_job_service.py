from datetime import datetime, timezone

from fastapi import BackgroundTasks
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    AppException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.dependencies.database import AsyncSessionLocal
from app.models.interviewer import Interviewer
from app.models.question_generation_job import (
    ACTIVE_QUESTION_GENERATION_STATUSES,
    QUESTION_GENERATION_STATUS_FAILED,
    QUESTION_GENERATION_STATUS_QUEUED,
    QUESTION_GENERATION_STATUS_RUNNING,
    QUESTION_GENERATION_STATUS_SUCCEEDED,
    QuestionGenerationJob,
)
from app.repositories.candidate_repository import candidate_repository
from app.repositories.position_repository import position_repository
from app.repositories.question_generation_job_repository import (
    question_generation_job_repository,
)
from app.schemas.question import GeneratedQuestionResponse, QuestionGenerateRequest
from app.schemas.question_generation_job import (
    QuestionGenerationJobCreateResponse,
    QuestionGenerationJobResponse,
)
from app.services.question_service import question_service


class QuestionGenerationJobService:
    async def create_job_for_user(
        self,
        db: AsyncSession,
        data: QuestionGenerateRequest,
        user_id: int,
        background_tasks: BackgroundTasks,
    ) -> QuestionGenerationJobCreateResponse:
        active_job = await question_generation_job_repository.find_active_by_user_id(
            db,
            user_id,
        )
        if active_job:
            raise ConflictException("이미 진행 중인 질문 생성 작업이 있습니다.")

        job_data = await self._resolve_user_job_data(db, data)
        job = QuestionGenerationJob(
            status=QUESTION_GENERATION_STATUS_QUEUED,
            candidate_id=job_data.candidate_id,
            position_id=job_data.position_id,
            created_by_user_id=user_id,
            request_payload=job_data.model_dump(mode="json"),
        )

        await self._save_job(db, job)
        background_tasks.add_task(self.run_job, job.job_id)
        return QuestionGenerationJobCreateResponse.model_validate(job)

    async def create_job_for_interviewer(
        self,
        db: AsyncSession,
        data: QuestionGenerateRequest,
        interviewer: Interviewer,
        background_tasks: BackgroundTasks,
    ) -> QuestionGenerationJobCreateResponse:
        if interviewer.position_id is None:
            raise ForbiddenException("Interviewer position is required")

        active_job = (
            await question_generation_job_repository.find_active_by_interviewer_id(
                db,
                interviewer.interviewer_id,
            )
        )
        if active_job:
            raise ConflictException("이미 진행 중인 질문 생성 작업이 있습니다.")

        candidate = await candidate_repository.find_by_id(db, data.candidate_id)
        if not candidate:
            raise NotFoundException("Candidate not found")

        if candidate.position_id != interviewer.position_id:
            raise ForbiddenException("Cannot generate questions for another position")

        job_data = data.model_copy(update={"position_id": interviewer.position_id})
        job = QuestionGenerationJob(
            status=QUESTION_GENERATION_STATUS_QUEUED,
            candidate_id=job_data.candidate_id,
            position_id=job_data.position_id,
            created_by_interviewer_id=interviewer.interviewer_id,
            request_payload=job_data.model_dump(mode="json"),
        )

        await self._save_job(db, job)
        background_tasks.add_task(self.run_job, job.job_id)
        return QuestionGenerationJobCreateResponse.model_validate(job)

    async def get_job_for_user(
        self,
        db: AsyncSession,
        job_id: int,
        user_id: int,
    ) -> QuestionGenerationJobResponse:
        job = await self._get_owned_job_for_user(db, job_id, user_id)
        return self.to_response(job)

    async def get_active_job_for_user(
        self,
        db: AsyncSession,
        user_id: int,
    ) -> QuestionGenerationJobResponse | None:
        job = await question_generation_job_repository.find_active_by_user_id(
            db,
            user_id,
        )
        return self.to_response(job) if job else None

    async def get_job_for_interviewer(
        self,
        db: AsyncSession,
        job_id: int,
        interviewer_id: int,
    ) -> QuestionGenerationJobResponse:
        job = await self._get_owned_job_for_interviewer(db, job_id, interviewer_id)
        return self.to_response(job)

    async def get_active_job_for_interviewer(
        self,
        db: AsyncSession,
        interviewer_id: int,
    ) -> QuestionGenerationJobResponse | None:
        job = await question_generation_job_repository.find_active_by_interviewer_id(
            db,
            interviewer_id,
        )
        return self.to_response(job) if job else None

    async def run_job(self, job_id: int) -> None:
        try:
            async with AsyncSessionLocal() as db:
                generation_input = await self._mark_running_and_build_input(
                    db,
                    job_id,
                )

            if generation_input is None:
                return

            generated_questions = await question_service.generate_questions_from_input(
                generation_input,
            )
            await self._mark_succeeded(
                job_id,
                generated_questions,
                generation_input.generation_keywords,
            )
        except Exception as exc:
            await self._mark_failed(job_id, exc)

    def to_response(
        self,
        job: QuestionGenerationJob,
    ) -> QuestionGenerationJobResponse:
        return QuestionGenerationJobResponse.model_validate(job)

    async def _resolve_user_job_data(
        self,
        db: AsyncSession,
        data: QuestionGenerateRequest,
    ) -> QuestionGenerateRequest:
        candidate = await candidate_repository.find_by_id(db, data.candidate_id)
        if not candidate:
            raise NotFoundException("Candidate not found")

        position_id = candidate.position_id or data.position_id
        if position_id is None:
            raise NotFoundException("Position not found")

        position = await position_repository.find_by_id(db, position_id)
        if not position:
            raise NotFoundException("Position not found")

        return data.model_copy(update={"position_id": position_id})

    async def _save_job(
        self,
        db: AsyncSession,
        job: QuestionGenerationJob,
    ) -> None:
        question_generation_job_repository.save(db, job)
        try:
            await db.commit()
        except IntegrityError as exc:
            await db.rollback()
            raise ConflictException(
                "이미 진행 중인 질문 생성 작업이 있습니다."
            ) from exc

        await db.refresh(job)

    async def _get_owned_job_for_user(
        self,
        db: AsyncSession,
        job_id: int,
        user_id: int,
    ) -> QuestionGenerationJob:
        job = await question_generation_job_repository.find_by_id(db, job_id)
        if not job:
            raise NotFoundException("질문 생성 작업을 찾을 수 없습니다.")

        if job.created_by_user_id != user_id:
            raise ForbiddenException("질문 생성 작업에 접근할 수 없습니다.")

        return job

    async def _get_owned_job_for_interviewer(
        self,
        db: AsyncSession,
        job_id: int,
        interviewer_id: int,
    ) -> QuestionGenerationJob:
        job = await question_generation_job_repository.find_by_id(db, job_id)
        if not job:
            raise NotFoundException("질문 생성 작업을 찾을 수 없습니다.")

        if job.created_by_interviewer_id != interviewer_id:
            raise ForbiddenException("질문 생성 작업에 접근할 수 없습니다.")

        return job

    async def _mark_running_and_build_input(
        self,
        db: AsyncSession,
        job_id: int,
    ):
        job = await question_generation_job_repository.find_by_id(db, job_id)
        if not job:
            return None

        if job.status not in ACTIVE_QUESTION_GENERATION_STATUSES:
            return None

        job.status = QUESTION_GENERATION_STATUS_RUNNING
        job.started_at = job.started_at or self._now()
        job.error_message = None
        await db.commit()

        data = QuestionGenerateRequest.model_validate(job.request_payload)
        return await question_service.build_generation_input(db, data)

    async def _mark_succeeded(
        self,
        job_id: int,
        generated_questions: list[GeneratedQuestionResponse],
        generation_keywords: dict | None,
    ) -> None:
        async with AsyncSessionLocal() as db:
            job = await question_generation_job_repository.find_by_id(db, job_id)
            if not job:
                return

            job.status = QUESTION_GENERATION_STATUS_SUCCEEDED
            job.generation_keywords = generation_keywords
            job.result_questions = [
                question.model_dump(mode="json")
                for question in generated_questions
            ]
            job.error_message = None
            job.finished_at = self._now()
            await db.commit()

    async def _mark_failed(self, job_id: int, exc: Exception) -> None:
        async with AsyncSessionLocal() as db:
            job = await question_generation_job_repository.find_by_id(db, job_id)
            if not job:
                return

            job.status = QUESTION_GENERATION_STATUS_FAILED
            job.error_message = self._get_error_message(exc)
            job.finished_at = self._now()
            await db.commit()

    def _get_error_message(self, exc: Exception) -> str:
        if isinstance(exc, AppException):
            return exc.detail

        return "질문 생성 중 오류가 발생했습니다."

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)


question_generation_job_service = QuestionGenerationJobService()
