from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interviewer import Interviewer


class InterviewerRepository:
    async def find_by_ids(
        self,
        db: AsyncSession,
        interviewer_ids: list[int],
    ) -> list[Interviewer]:
        result = await db.scalars(
            select(Interviewer)
            .where(Interviewer.interviewer_id.in_(interviewer_ids))
            .order_by(Interviewer.interviewer_id)
        )
        return result.all()


interviewer_repository = InterviewerRepository()
