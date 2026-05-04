from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.resume import Resume


class ResumeRepository:
    def save(self, db: AsyncSession, resume: Resume) -> Resume:
        db.add(resume)
        return resume

    async def find_latest_by_candidate_id(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Resume | None:
        result = await db.scalars(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .order_by(
                desc(Resume.created_at),
                desc(Resume.resume_id),
            )
            .limit(1)
        )
        return result.one_or_none()

    async def find_latest_by_candidate_id_with_second_position(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Resume | None:
        result = await db.scalars(
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .options(selectinload(Resume.second_position))
            .order_by(
                desc(Resume.created_at),
                desc(Resume.resume_id),
            )
            .limit(1)
        )
        return result.one_or_none()

    async def find_latest_second_position_id(
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


resume_repository = ResumeRepository()
