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


interviewer_invite_repository = InterviewerInviteRepository()
