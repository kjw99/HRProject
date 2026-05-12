from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interview_booking_invitation import InterviewBookingInvitation


class InterviewBookingInvitationRepository:
    def save(
        self,
        db: AsyncSession,
        invitation: InterviewBookingInvitation,
    ) -> InterviewBookingInvitation:
        db.add(invitation)
        return invitation

    async def find_by_id(
        self,
        db: AsyncSession,
        invitation_id: int,
    ) -> InterviewBookingInvitation | None:
        return await db.get(InterviewBookingInvitation, invitation_id)

    async def find_by_token_hash(
        self,
        db: AsyncSession,
        token_hash: str,
    ) -> InterviewBookingInvitation | None:
        return await db.scalar(
            select(InterviewBookingInvitation).where(
                InterviewBookingInvitation.token_hash == token_hash
            )
        )

    async def find_active_by_candidate_id(
        self,
        db: AsyncSession,
        candidate_id: int,
        now: datetime,
    ) -> list[InterviewBookingInvitation]:
        result = await db.scalars(
            select(InterviewBookingInvitation)
            .where(
                InterviewBookingInvitation.candidate_id == candidate_id,
                InterviewBookingInvitation.revoked_at.is_(None),
                InterviewBookingInvitation.expires_at > now,
            )
            .order_by(InterviewBookingInvitation.created_at.desc())
        )
        return result.all()


interview_booking_invitation_repository = InterviewBookingInvitationRepository()
