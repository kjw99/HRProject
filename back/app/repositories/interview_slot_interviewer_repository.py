from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview_slot import InterviewSlot
from app.models.interview_slot_interviewer import InterviewSlotInterviewer


class InterviewSlotInterviewerRepository:
    async def find_interviewer_time_conflicts(
        self,
        db: AsyncSession,
        interviewer_ids: list[int],
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[tuple[int, int]]:
        result = await db.execute(
            select(
                InterviewSlotInterviewer.interviewer_id,
                InterviewSlot.slot_id,
            )
            .join(
                InterviewSlot,
                InterviewSlot.slot_id == InterviewSlotInterviewer.slot_id,
            )
            .where(
                InterviewSlotInterviewer.interviewer_id.in_(interviewer_ids),
                InterviewSlot.interview_starts_at < ends_at,
                InterviewSlot.interview_ends_at > starts_at,
            )
            .order_by(
                InterviewSlotInterviewer.interviewer_id,
                InterviewSlot.slot_id,
            )
        )
        return [(row[0], row[1]) for row in result.all()]

    async def find_interviewer_time_conflicts_excluding_slot(
        self,
        db: AsyncSession,
        interviewer_ids: list[int],
        starts_at: datetime,
        ends_at: datetime,
        excluded_slot_id: int,
    ) -> list[tuple[int, int]]:
        result = await db.execute(
            select(
                InterviewSlotInterviewer.interviewer_id,
                InterviewSlot.slot_id,
            )
            .join(
                InterviewSlot,
                InterviewSlot.slot_id == InterviewSlotInterviewer.slot_id,
            )
            .where(
                InterviewSlotInterviewer.interviewer_id.in_(interviewer_ids),
                InterviewSlot.interview_starts_at < ends_at,
                InterviewSlot.interview_ends_at > starts_at,
                InterviewSlot.slot_id != excluded_slot_id,
            )
            .order_by(
                InterviewSlotInterviewer.interviewer_id,
                InterviewSlot.slot_id,
            )
        )
        return [(row[0], row[1]) for row in result.all()]

    async def delete_by_slot_id(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> None:
        slot_interviewers = await db.scalars(
            select(InterviewSlotInterviewer).where(
                InterviewSlotInterviewer.slot_id == slot_id
            )
        )

        for slot_interviewer in slot_interviewers.all():
            await db.delete(slot_interviewer)

    async def find_interviewer_ids_by_slot_id(
        self,
        db: AsyncSession,
        slot_id: int,
    ) -> list[int]:
        result = await db.scalars(
            select(InterviewSlotInterviewer.interviewer_id)
            .where(InterviewSlotInterviewer.slot_id == slot_id)
            .order_by(InterviewSlotInterviewer.interviewer_id)
        )
        return result.all()


interview_slot_interviewer_repository = InterviewSlotInterviewerRepository()
