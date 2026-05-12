# app/repositories/interviewer_repository.py

from sqlalchemy import delete, select, func

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.interviewer import Interviewer
from app.models.interview_slot import InterviewSlot
from app.models.interview_slot_interviewer import InterviewSlotInterviewer


class InterviewerRepository:

    async def create(
        self,
        db: AsyncSession,
        interviewer: Interviewer
    ):
        db.add(interviewer)

        # await db.commit()
        # await db.refresh(interviewer)

        return interviewer


    async def get_by_id(
        self,
        db: AsyncSession,
        interviewer_id: int
    ):
        query = select(Interviewer).where(
            Interviewer.interviewer_id == interviewer_id
        ).options(selectinload(Interviewer.position))

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
        keyword: str | None,
        position_id: int | None = None,
        interview_round: str | None = None,
    ):
        query = select(Interviewer).options(selectinload(Interviewer.position))

        if keyword:
            query = query.where(
                Interviewer.interviewer_name.ilike(f"%{keyword}%")
            )

        if position_id is not None:
            query = query.where(Interviewer.position_id == position_id)

        if interview_round is not None:
            query = query.where(Interviewer.interview_round == interview_round)

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
        # await db.commit()


    async def delete_assignments_by_interviewer_id(
        self,
        db: AsyncSession,
        interviewer_id: int,
    ) -> None:
        await db.execute(
            delete(InterviewSlotInterviewer).where(
                InterviewSlotInterviewer.interviewer_id == interviewer_id
            ).execution_options(synchronize_session=False)
        )


    async def delete_assignments_by_position_id(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> None:
        await db.execute(
            delete(InterviewSlotInterviewer).where(
                InterviewSlotInterviewer.interviewer_id.in_(
                    select(Interviewer.interviewer_id).where(
                        Interviewer.position_id == position_id
                    )
                )
            ).execution_options(synchronize_session=False)
        )


    async def delete_invalid_assignments_for_interviewer(
        self,
        db: AsyncSession,
        interviewer: Interviewer,
    ) -> None:
        if interviewer.position_id is None or interviewer.interview_round is None:
            await self.delete_assignments_by_interviewer_id(
                db,
                interviewer.interviewer_id,
            )
            return

        await db.execute(
            delete(InterviewSlotInterviewer).where(
                InterviewSlotInterviewer.interviewer_id == interviewer.interviewer_id,
                InterviewSlotInterviewer.slot_id.in_(
                    select(InterviewSlot.slot_id).where(
                        (InterviewSlot.position_id != interviewer.position_id)
                        | (InterviewSlot.interview_round != interviewer.interview_round)
                        | (InterviewSlot.position_id.is_(None))
                    )
                ),
            ).execution_options(synchronize_session=False)
        )


    async def find_by_ids(
        self,
        db: AsyncSession,
        interviewer_ids: list[int],
    ) -> list[Interviewer]:
        result = await db.scalars(
            select(Interviewer)
            .where(Interviewer.interviewer_id.in_(interviewer_ids))
            .options(selectinload(Interviewer.position))
            .order_by(Interviewer.interviewer_id)
        )
        return result.all()

interviewer_repository = InterviewerRepository()
