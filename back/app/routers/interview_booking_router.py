from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.schemas.interview_booking import (
    AvailableInterviewSlotResponse,
    InterviewBookingCancelRequest,
    InterviewBookingCreate,
    InterviewBookingResponse,
)
from app.schemas.common import MessageResponse
from app.services.interview_booking_service import interview_booking_service


router = APIRouter(prefix="/api/interview-bookings", tags=["InterviewBooking"])


@router.get(
    "/available-slots",
    response_model=list[AvailableInterviewSlotResponse],
)
async def get_available_interview_slots(
    candidate_id: int = Query(..., alias="candidateId", gt=0),
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_booking_service.get_available_slots(db, candidate_id)


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
