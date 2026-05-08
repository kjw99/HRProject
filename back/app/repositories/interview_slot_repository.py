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
    ) -> list[InterviewSlot]:
        result = await db.scalars(
            select(InterviewSlot)
            .options(
                selectinload(InterviewSlot.position),
                selectinload(InterviewSlot.interviewers),
                selectinload(InterviewSlot.bookings),
            )
            .order_by(InterviewSlot.interview_starts_at, InterviewSlot.slot_id)
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
