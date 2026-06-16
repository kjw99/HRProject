from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.question_generation_job import (
    ACTIVE_QUESTION_GENERATION_STATUSES,
    QUESTION_GENERATION_STATUS_SUCCEEDED,
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

    async def find_recent_succeeded_by_position_id(
        self,
        db: AsyncSession,
        position_id: int,
        limit: int = 20,
    ) -> list[QuestionGenerationJob]:
        result = await db.scalars(
            select(QuestionGenerationJob)
            .where(
                QuestionGenerationJob.position_id == position_id,
                QuestionGenerationJob.status == QUESTION_GENERATION_STATUS_SUCCEEDED,
            )
            .order_by(QuestionGenerationJob.job_id.desc())
            .limit(limit)
        )
        return list(result.all())


question_generation_job_repository = QuestionGenerationJobRepository()
