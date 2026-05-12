from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

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


resume_repository = ResumeRepository()
