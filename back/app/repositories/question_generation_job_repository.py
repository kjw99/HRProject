from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.question_generation_job import (
    ACTIVE_QUESTION_GENERATION_STATUSES,
    QuestionGenerationJob,
)


class QuestionGenerationJobRepository:
    def save(
        self,
        db: AsyncSession,
        job: QuestionGenerationJob,
    ) -> QuestionGenerationJob:
        db.add(job)
        return job

    async def find_by_id(
        self,
        db: AsyncSession,
        job_id: int,
    ) -> QuestionGenerationJob | None:
        return await db.get(QuestionGenerationJob, job_id)

    async def find_active_by_user_id(
        self,
        db: AsyncSession,
        user_id: int,
    ) -> QuestionGenerationJob | None:
        result = await db.scalars(
            select(QuestionGenerationJob)
            .where(
                QuestionGenerationJob.created_by_user_id == user_id,
                QuestionGenerationJob.status.in_(ACTIVE_QUESTION_GENERATION_STATUSES),
            )
            .order_by(QuestionGenerationJob.job_id.desc())
            .limit(1)
        )
        return result.one_or_none()

    async def find_active_by_interviewer_id(
        self,
        db: AsyncSession,
        interviewer_id: int,
    ) -> QuestionGenerationJob | None:
        result = await db.scalars(
            select(QuestionGenerationJob)
            .where(
                QuestionGenerationJob.created_by_interviewer_id == interviewer_id,
                QuestionGenerationJob.status.in_(ACTIVE_QUESTION_GENERATION_STATUSES),
            )
            .order_by(QuestionGenerationJob.job_id.desc())
            .limit(1)
        )
        return result.one_or_none()


question_generation_job_repository = QuestionGenerationJobRepository()
