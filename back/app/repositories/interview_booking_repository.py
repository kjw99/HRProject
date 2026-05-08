from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview_booking import InterviewBooking


class InterviewBookingRepository:
    async def has_active_bookings(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> bool:
        active_booking_id = await db.scalar(
            select(InterviewBooking.booking_id)
            .where(
                InterviewBooking.slot_id == slot_id,
                InterviewBooking.cancelled_at.is_(None),
            )
            .limit(1)
        )
        return active_booking_id is not None


interview_booking_repository = InterviewBookingRepository()
