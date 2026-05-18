import hashlib
import os
import secrets
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ConflictException, NotFoundException
from app.models.interview_booking_invitation import InterviewBookingInvitation
from app.repositories.candidate_repository import candidate_repository
from app.repositories.interview_booking_invitation_repository import (
    interview_booking_invitation_repository,
)
from app.repositories.interview_booking_repository import interview_booking_repository
from app.schemas.interview_booking_invitation import (
    InterviewBookingInvitationCreateResponse,
)
from app.services.interview_booking_service import interview_booking_service


KST = ZoneInfo("Asia/Seoul")
DEFAULT_INVITATION_EXPIRES_IN_DAYS = 3


def _as_kst(dt: datetime) -> datetime:
    """응답 직렬화 시 naive/다른 TZ datetime을 KST로 통일"""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=KST)
    return dt.astimezone(KST)


class InterviewBookingInvitationService:
    async def create_invitation(
        self,
        db: AsyncSession,
        candidate_id: int,
        expires_at: datetime | None = None,
        slot_ids: list[int] | None = None,
    ) -> InterviewBookingInvitationCreateResponse:
        candidate = await candidate_repository.find_by_id(db, candidate_id)
        if not candidate:
            raise NotFoundException("지원자를 찾을 수 없습니다.")

        now = datetime.now(KST)
        expires_at = expires_at or now + timedelta(
            days=DEFAULT_INVITATION_EXPIRES_IN_DAYS
        )
        if expires_at <= now:
            raise BadRequestException("초대 링크 만료 시각은 현재보다 이후여야 합니다.")

        allowed_slot_ids = await self._validate_allowed_slot_ids(
            db,
            candidate_id,
            slot_ids or [],
        )

        active_invitations = (
            await interview_booking_invitation_repository.find_active_by_candidate_id(
                db,
                candidate_id,
                now,
            )
        )
        for invitation in active_invitations:
            invitation.revoked_at = now

        raw_token = self._generate_raw_token()
        token_hash = self._hash_token(raw_token)
        invitation = InterviewBookingInvitation(
            candidate_id=candidate_id,
            token_hash=token_hash,
            expires_at=expires_at,
            allowed_slot_ids=allowed_slot_ids,
        )
        interview_booking_invitation_repository.save(db, invitation)

        try:
            await db.commit()
            await db.refresh(invitation)
        except IntegrityError:
            await db.rollback()
            raise ConflictException(
                "초대 링크를 저장하지 못했습니다. 이미 유효한 초대가 있거나 데이터가 충돌했을 수 있습니다.",
            ) from None

        return InterviewBookingInvitationCreateResponse(
            invitation_id=invitation.invitation_id,
            candidate_id=invitation.candidate_id,
            slot_ids=invitation.allowed_slot_ids or [],
            invitation_url=self._build_invitation_url(raw_token),
            expires_at=_as_kst(invitation.expires_at),
            created_at=_as_kst(invitation.created_at),
        )

    async def validate_usable_invitation(
        self,
        db: AsyncSession,
        token: str,
    ) -> InterviewBookingInvitation:
        token = token.strip()
        if not token:
            raise BadRequestException("초대 링크 토큰을 입력해주세요.")

        invitation = await interview_booking_invitation_repository.find_by_token_hash(
            db,
            self._hash_token(token),
        )
        if not invitation:
            raise NotFoundException("유효하지 않은 초대 링크입니다.")

        now = datetime.now(KST)
        if invitation.revoked_at is not None:
            raise ConflictException("폐기된 초대 링크입니다.")

        if invitation.expires_at <= now:
            raise ConflictException("만료된 초대 링크입니다.")

        active_booking = (
            await interview_booking_repository.find_active_by_candidate_id(
                db,
                invitation.candidate_id,
            )
        )
        if active_booking:
            raise ConflictException("이미 예약된 면접 일정이 있습니다.")

        return invitation

    async def get_available_slots_for_invitation(
        self,
        db: AsyncSession,
        invitation: InterviewBookingInvitation,
    ):
        slots = await interview_booking_service.get_available_slots(
            db,
            invitation.candidate_id,
        )
        if not invitation.allowed_slot_ids:
            return slots

        allowed_slot_id_set = set(invitation.allowed_slot_ids)
        return [slot for slot in slots if slot.slot_id in allowed_slot_id_set]

    def validate_slot_allowed_for_invitation(
        self,
        invitation: InterviewBookingInvitation,
        slot_id: int,
    ) -> None:
        if not invitation.allowed_slot_ids:
            return

        if slot_id not in set(invitation.allowed_slot_ids):
            raise ConflictException("이 초대 링크에서 선택할 수 없는 면접 슬롯입니다.")

    async def revoke_invitation(
        self,
        db: AsyncSession,
        invitation_id: int,
    ) -> None:
        invitation = await interview_booking_invitation_repository.find_by_id(
            db,
            invitation_id,
        )
        if not invitation:
            raise NotFoundException("초대 링크를 찾을 수 없습니다.")

        if invitation.revoked_at is not None:
            raise ConflictException("이미 폐기된 초대 링크입니다.")

        invitation.revoked_at = datetime.now(KST)
        await db.commit()

    def _generate_raw_token(self) -> str:
        return secrets.token_urlsafe(32)

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def _build_invitation_url(self, raw_token: str) -> str:
        frontend_base_url = os.getenv(
            "FRONTEND_BASE_URL",
            "http://localhost:3000",
        ).rstrip("/")
        return f"{frontend_base_url}/interview-booking?token={raw_token}"

    async def _validate_allowed_slot_ids(
        self,
        db: AsyncSession,
        candidate_id: int,
        slot_ids: list[int],
    ) -> list[int] | None:
        if not slot_ids:
            return None

        available_slots = await interview_booking_service.get_available_slots(
            db,
            candidate_id,
        )
        available_slot_ids = {slot.slot_id for slot in available_slots}
        invalid_slot_ids = [
            slot_id for slot_id in slot_ids if slot_id not in available_slot_ids
        ]
        if invalid_slot_ids:
            raise ConflictException(
                "지원자가 예약할 수 없는 면접 슬롯이 포함되어 있습니다: "
                f"{', '.join(map(str, invalid_slot_ids))}"
            )

        return slot_ids


interview_booking_invitation_service = InterviewBookingInvitationService()
