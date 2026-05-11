# app/repositories/interviewer_repository.py

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interviewer import Interviewer


class InterviewerRepository:

    async def create(
        self,
        db: AsyncSession,
        interviewer: Interviewer
    ):
        db.add(interviewer)

        await db.commit()
        await db.refresh(interviewer)

        return interviewer

    async def get_by_id(
        self,
        db: AsyncSession,
        interviewer_id: int
    ):
        query = select(Interviewer).where(
            Interviewer.interviewer_id == interviewer_id
        )

        result = await db.execute(query)

        return result.scalar_one_or_none()

    async def get_by_email(
        self,
        db: AsyncSession,
        interviewer_email: str
    ):
        query = select(Interviewer).where(
            Interviewer.interviewer_email == interviewer_email
        )

        result = await db.execute(query)

        return result.scalar_one_or_none()

    async def get_list(
        self,
        db: AsyncSession,
        page: int,
        size: int,
        keyword: str | None
    ):
        query = select(Interviewer)

        if keyword:
            query = query.where(
                Interviewer.interviewer_name.ilike(f"%{keyword}%")
            )

        count_query = select(func.count()).select_from(
            query.subquery()
        )

        total = await db.scalar(count_query)

        query = (
            query
            .offset(page * size)
            .limit(size)
            .order_by(Interviewer.interviewer_id.desc())
        )

        result = await db.execute(query)

        return result.scalars().all(), total

    async def delete(
        self,
        db: AsyncSession,
        interviewer: Interviewer
    ):
        await db.delete(interviewer)
        await db.commit()


interviewer_repository = InterviewerRepository()