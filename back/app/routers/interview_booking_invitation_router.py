from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.common import MessageResponse
from app.schemas.interview_booking import (
    AvailableInterviewSlotResponse,
    InterviewBookingResponse,
)
from app.schemas.interview_booking_invitation import (
    InterviewBookingInvitationCreate,
    InterviewBookingInvitationCreateResponse,
    InterviewBookingInvitationTokenBookingCreate,
)
from app.services.interview_booking_invitation_service import (
    interview_booking_invitation_service,
)
from app.services.interview_booking_service import interview_booking_service


router = APIRouter(
    prefix="/api/interview-booking-invitations",
    tags=["InterviewBookingInvitation"],
)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=InterviewBookingInvitationCreateResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def create_interview_booking_invitation(
    data: InterviewBookingInvitationCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_booking_invitation_service.create_invitation(
        db,
        candidate_id=data.candidate_id,
        expires_at=data.expires_at,
        slot_ids=data.slot_ids,
    )


@router.patch(
    "/{invitation_id}/revoke",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def revoke_interview_booking_invitation(
    invitation_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    await interview_booking_invitation_service.revoke_invitation(
        db,
        invitation_id,
    )
    return {"message": "면접 예약 초대 링크가 폐기되었습니다."}


@router.get(
    "/{token}/available-slots",
    response_model=list[AvailableInterviewSlotResponse],
)
async def get_available_interview_slots_by_invitation(
    token: str,
    db: AsyncSession = Depends(get_async_db),
):
    invitation = await interview_booking_invitation_service.validate_usable_invitation(
        db,
        token,
    )
    return await interview_booking_invitation_service.get_available_slots_for_invitation(
        db,
        invitation,
    )


@router.post(
    "/{token}/bookings",
    status_code=status.HTTP_201_CREATED,
    response_model=InterviewBookingResponse,
)
async def create_interview_booking_by_invitation(
    token: str,
    data: InterviewBookingInvitationTokenBookingCreate,
    db: AsyncSession = Depends(get_async_db),
):
    invitation = await interview_booking_invitation_service.validate_usable_invitation(
        db,
        token,
    )
    interview_booking_invitation_service.validate_slot_allowed_for_invitation(
        invitation,
        data.slot_id,
    )
    return await interview_booking_service.create_booking(
        db,
        candidate_id=invitation.candidate_id,
        slot_id=data.slot_id,
    )
