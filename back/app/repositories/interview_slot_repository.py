from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.interview_booking import InterviewBooking
from app.models.interview_slot import InterviewSlot


class InterviewSlotRepository:
    def save(self, db: AsyncSession, slot: InterviewSlot) -> InterviewSlot:
        db.add(slot)
        return slot

    async def find_by_id(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot | None:
        return await db.get(InterviewSlot, slot_id)

    async def find_by_id_for_update(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot | None:
        return await db.scalar(
            select(InterviewSlot)
            .where(InterviewSlot.slot_id == slot_id)
            .with_for_update()
        )

    async def find_by_id_with_interviewers(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot | None:
        result = await db.scalars(
            select(InterviewSlot)
            .options(selectinload(InterviewSlot.slot_interviewers))
            .where(InterviewSlot.slot_id == slot_id)
        )
        return result.first()

    async def find_all_with_details(
        self,
        db: AsyncSession,
        starts_at_from: datetime | None = None,
        starts_at_to: datetime | None = None,
        position_id: int | None = None,
    ) -> list[InterviewSlot]:
        query = (
            select(InterviewSlot)
            .options(
                selectinload(InterviewSlot.position),
                selectinload(InterviewSlot.interviewers),
                selectinload(InterviewSlot.bookings).selectinload(
                    InterviewBooking.candidate
                ),
            )
        )

        if starts_at_from is not None:
            query = query.where(InterviewSlot.interview_starts_at >= starts_at_from)

        if starts_at_to is not None:
            query = query.where(InterviewSlot.interview_starts_at < starts_at_to)

        if position_id is not None:
            query = query.where(InterviewSlot.position_id == position_id)

        result = await db.scalars(
            query.order_by(InterviewSlot.interview_starts_at, InterviewSlot.slot_id)
        )
        return result.all()

    async def find_by_id_with_details(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> InterviewSlot | None:
        result = await db.scalars(
            select(InterviewSlot)
            .options(
                selectinload(InterviewSlot.position),
                selectinload(InterviewSlot.interviewers),
                selectinload(InterviewSlot.bookings).selectinload(
                    InterviewBooking.candidate
                ),
            )
            .where(InterviewSlot.slot_id == slot_id)
        )
        return result.first()

    async def delete(
        self,
        db: AsyncSession,
        slot: InterviewSlot,
    ) -> None:
        await db.delete(slot)


interview_slot_repository = InterviewSlotRepository()
