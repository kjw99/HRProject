from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.common import MessageResponse
from app.schemas.interview_booking import (
    ActiveBookingSummaryResponse,
    AvailableInterviewSlotResponse,
    InterviewBookingCancelRequest,
    InterviewBookingCreate,
    InterviewBookingResponse,
)
from app.services.interview_booking_service import interview_booking_service


router = APIRouter(
    prefix="/api/interview-bookings",
    tags=["InterviewBooking"],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)


@router.get(
    "/available-slots",
    response_model=list[AvailableInterviewSlotResponse],
)
async def get_available_interview_slots(
    candidate_id: int = Query(..., alias="candidateId", gt=0),
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_booking_service.get_available_slots(db, candidate_id)


@router.get(
    "/active",
    response_model=list[ActiveBookingSummaryResponse],
)
async def get_active_bookings_by_position(
    position_id: int = Query(..., alias="positionId", gt=0),
    db: AsyncSession = Depends(get_async_db),
):
    """직무에 걸린 활성(미취소) 면접 예약 일괄 조회.

    스케줄 슬롯 상세 모달에서 "다른 슬롯에 배정됨" 라벨을 표시하기 위해 사용합니다.
    """
    return await interview_booking_service.get_active_bookings_by_position(
        db,
        position_id,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=InterviewBookingResponse,
)
async def create_interview_booking(
    data: InterviewBookingCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_booking_service.create_booking(
        db,
        candidate_id=data.candidate_id,
        slot_id=data.slot_id,
    )


@router.patch(
    "/{booking_id}/cancel",
    response_model=MessageResponse,
)
async def cancel_interview_booking(
    booking_id: int,
    data: InterviewBookingCancelRequest,
    db: AsyncSession = Depends(get_async_db),
):
    await interview_booking_service.cancel_booking(
        db,
        candidate_id=data.candidate_id,
        booking_id=booking_id,
    )
    return {"message": "면접 예약이 취소되었습니다."}
