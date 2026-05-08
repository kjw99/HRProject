from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.common import MessageResponse
from app.schemas.interview_slot import (
    InterviewSlotBatchCreate,
    InterviewSlotCreate,
    InterviewSlotDetailResponse,
    InterviewSlotListItemResponse,
    InterviewSlotResponse,
    InterviewSlotUpdate,
)
from app.services.interview_slot_service import interview_slot_service


router = APIRouter(prefix="/api/interview-slots", tags=["InterviewSlot"])


@router.get(
    "",
    response_model=list[InterviewSlotListItemResponse],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_interview_slots(
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_slot_service.get_interview_slots(db)


@router.get(
    "/{slot_id}",
    response_model=InterviewSlotDetailResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_interview_slot_detail(
    slot_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_slot_service.get_interview_slot_detail(db, slot_id)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=InterviewSlotResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def create_interview_slot(
    data: InterviewSlotCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_slot_service.create_interview_slot(db, data)


@router.post(
    "/batch",
    status_code=status.HTTP_201_CREATED,
    response_model=list[InterviewSlotResponse],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def create_interview_slots_batch(
    data: InterviewSlotBatchCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_slot_service.create_interview_slots_batch(db, data)


@router.patch(
    "/{slot_id}",
    response_model=InterviewSlotResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def update_interview_slot(
    slot_id: int,
    data: InterviewSlotUpdate,
    db: AsyncSession = Depends(get_async_db),
):
    return await interview_slot_service.update_interview_slot(db, slot_id, data)


@router.delete(
    "/{slot_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def delete_interview_slot(
    slot_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    await interview_slot_service.delete_interview_slot(db, slot_id)
    return {"message": "면접 일정이 삭제되었습니다."}
