from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.interviewer_invite import InterviewerInvite


class InterviewerInviteRepository:
    def save(self, db: AsyncSession, invite: InterviewerInvite) -> InterviewerInvite:
        db.add(invite)
        return invite

    async def find_by_token_hash(
        self,
        db: AsyncSession,
        token_hash: str,
    ) -> InterviewerInvite | None:
        result = await db.scalars(
            select(InterviewerInvite)
            .where(InterviewerInvite.token_hash == token_hash)
            .options(selectinload(InterviewerInvite.interviewer))
        )
        return result.one_or_none()

    async def find_active_by_interviewer_id(
        self,
        db: AsyncSession,
        interviewer_id: int,
        *,
        now: datetime | None = None,
    ) -> InterviewerInvite | None:
        current = now or datetime.now(timezone.utc)
        result = await db.scalars(
            select(InterviewerInvite)
            .where(
                InterviewerInvite.interviewer_id == interviewer_id,
                InterviewerInvite.revoked_at.is_(None),
                InterviewerInvite.expires_at > current,
                InterviewerInvite.raw_token.is_not(None),
            )
            .order_by(InterviewerInvite.created_at.desc())
            .limit(1)
        )
        return result.first()


interviewer_invite_repository = InterviewerInviteRepository()
