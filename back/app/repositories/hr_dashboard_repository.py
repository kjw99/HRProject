from datetime import datetime

from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.candidate import Candidate
from app.models.interview_booking import InterviewBooking
from app.models.interview_slot import InterviewSlot
from app.models.position import Position


class HrDashboardRepository:
    async def count_active_recruiting_slots(
        self,
        db: AsyncSession,
        now: datetime,
    ) -> int:
        query = select(func.count()).select_from(InterviewSlot).where(
            InterviewSlot.interview_ends_at > now,
        )
        return await db.scalar(query) or 0

    async def count_today_interviewees(
        self,
        db: AsyncSession,
        today_start: datetime,
        tomorrow_start: datetime,
    ) -> int:
        query = (
            select(func.count(distinct(InterviewBooking.candidate_id)))
            .select_from(InterviewBooking)
            .join(InterviewSlot, InterviewBooking.slot_id == InterviewSlot.slot_id)
            .where(
                InterviewBooking.cancelled_at.is_(None),
                InterviewSlot.interview_starts_at >= today_start,
                InterviewSlot.interview_starts_at < tomorrow_start,
            )
        )
        return await db.scalar(query) or 0

    async def find_today_interview_bookings(
        self,
        db: AsyncSession,
        today_start: datetime,
        tomorrow_start: datetime,
    ) -> list[InterviewBooking]:
        result = await db.scalars(
            select(InterviewBooking)
            .options(
                selectinload(InterviewBooking.slot).selectinload(InterviewSlot.position),
                selectinload(InterviewBooking.candidate),
            )
            .join(InterviewSlot, InterviewBooking.slot_id == InterviewSlot.slot_id)
            .join(Candidate, InterviewBooking.candidate_id == Candidate.candidate_id)
            .outerjoin(Position, InterviewSlot.position_id == Position.position_id)
            .where(
                InterviewBooking.cancelled_at.is_(None),
                InterviewSlot.interview_starts_at >= today_start,
                InterviewSlot.interview_starts_at < tomorrow_start,
            )
            .order_by(
                InterviewSlot.interview_starts_at.asc(),
                InterviewBooking.booking_id.asc(),
            )
        )
        return result.all()

    # async def count_active_positions(
    #     self,
    #     db: AsyncSession,
    #     now: datetime,
    # ) -> int:
    #     query = (
    #         select(func.count(distinct(InterviewSlot.position_id)))
    #         .select_from(InterviewSlot)
    #         .where(
    #             InterviewSlot.interview_ends_at > now,
    #             InterviewSlot.position_id.is_not(None),
    #         )
    #     )
    #     return await db.scalar(query) or 0


hr_dashboard_repository = HrDashboardRepository()
