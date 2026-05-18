import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, UnauthorizedException
from app.core.security import create_interviewer_access_token
from app.models.interviewer_invite import InterviewerInvite
from app.repositories.interviewer_invite_repository import interviewer_invite_repository
from app.repositories.interviewer_repository import interviewer_repository
from app.schemas.interviewer_invite import (
    InterviewerInviteCreateRequest,
    InterviewerInviteCreateResponse,
    InterviewerTokenResponse,
)


class InterviewerInviteService:
    @staticmethod
    def _hash_token(raw_token: str) -> str:
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    @staticmethod
    def _frontend_base_url() -> str:
        return os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/")

    @classmethod
    def _build_invite_url(cls, raw_token: str) -> str:
        return f"{cls._frontend_base_url()}/interviewer-invite?token={raw_token}"

    @classmethod
    def _to_response(
        cls,
        invite: InterviewerInvite,
        *,
        reused: bool = False,
    ) -> InterviewerInviteCreateResponse:
        if not invite.raw_token:
            raise ValueError("Invite is missing raw_token.")

        return InterviewerInviteCreateResponse(
            invite_id=invite.invite_id,
            interviewer_id=invite.interviewer_id,
            expires_at=invite.expires_at,
            invite_url=cls._build_invite_url(invite.raw_token),
            reused=reused,
        )

    async def get_active_invite(
        self,
        db: AsyncSession,
        interviewer_id: int,
    ) -> InterviewerInviteCreateResponse | None:
        invite = await interviewer_invite_repository.find_active_by_interviewer_id(
            db,
            interviewer_id,
        )
        if invite is None:
            return None
        return self._to_response(invite, reused=True)

    async def get_or_create_invite(
        self,
        db: AsyncSession,
        data: InterviewerInviteCreateRequest,
        created_by_user_id: int,
    ) -> InterviewerInviteCreateResponse:
        active = await self.get_active_invite(db, data.interviewer_id)
        if active is not None:
            return active
        return await self.create_invite(db, data, created_by_user_id)

    async def create_invite(
        self,
        db: AsyncSession,
        data: InterviewerInviteCreateRequest,
        created_by_user_id: int,
    ) -> InterviewerInviteCreateResponse:
        interviewer = await interviewer_repository.get_by_id(db, data.interviewer_id)
        if not interviewer:
            raise NotFoundException("면접관을 찾을 수 없습니다.")

        raw_token = secrets.token_urlsafe(48)
        token_hash = self._hash_token(raw_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=data.expires_in_days)

        invite = InterviewerInvite(
            interviewer_id=interviewer.interviewer_id,
            token_hash=token_hash,
            raw_token=raw_token,
            expires_at=expires_at,
            created_by_user_id=created_by_user_id,
        )
        interviewer_invite_repository.save(db, invite)
        await db.commit()
        await db.refresh(invite)

        return self._to_response(invite, reused=False)

    async def accept_invite(
        self,
        db: AsyncSession,
        raw_token: str,
    ) -> InterviewerTokenResponse:
        token_hash = self._hash_token(raw_token)
        invite = await interviewer_invite_repository.find_by_token_hash(db, token_hash)

        if not invite:
            raise UnauthorizedException("유효하지 않은 초대 토큰입니다.")

        now = datetime.now(timezone.utc)
        if invite.revoked_at is not None:
            raise UnauthorizedException("폐기된 초대 토큰입니다.")
        if invite.expires_at < now:
            raise UnauthorizedException("만료된 초대 토큰입니다.")

        interviewer = invite.interviewer
        if interviewer is None:
            raise UnauthorizedException("유효하지 않은 초대 토큰입니다.")

        invite.last_used_at = now
        await db.commit()

        access_token = create_interviewer_access_token(interviewer)
        return InterviewerTokenResponse(
            access_token=access_token,
            interviewer=interviewer,
        )


interviewer_invite_service = InterviewerInviteService()
