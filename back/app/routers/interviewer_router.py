from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.services.interviewer_service import interviewer_service
from app.schemas.interviewer import InterviewerCreate,InterviewerResponse,InterviewerListResponse,InterviewerUpdate

router = APIRouter(prefix="/api/interviewers", tags=["Interviewer"])



@router.post(
    "",
    response_model=InterviewerResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))]
)
async def create_interviewer(
    data: InterviewerCreate,
    db: AsyncSession = Depends(get_async_db),
    # admin = Depends(require_admin)
):
    return await interviewer_service.create_interviewer(db, data)



@router.get(
    "",
    response_model=InterviewerListResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))]
)
async def get_interviewers(
    # page: int = 0,
    # size: int = 20,
    page: int = Query(default=0, ge=0),
    size: int = Query(default=20, ge=1, le=100),
    keyword: str | None = None,
    position_id: int | None = Query(default=None, alias="positionId", gt=0),
    interview_round: Literal["1차", "2차", "3차"] | None = Query(
        default=None,
        alias="interviewRound",
    ),
    db: AsyncSession = Depends(get_async_db),
):
    return await interviewer_service.get_interviewers(
        db,
        page,
        size,
        keyword,
        position_id,
        interview_round,
    )




@router.get(
    "/{interviewer_id}",
    response_model=InterviewerResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))]
)
async def get_interviewer(
    interviewer_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    return await interviewer_service.get_interviewer(
        db,
        interviewer_id
    )




@router.patch(
    "/{interviewer_id}",
    response_model=InterviewerResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))]
)
async def update_interviewer(
    interviewer_id: int,
    data: InterviewerUpdate,
    db: AsyncSession = Depends(get_async_db),
):
    return await interviewer_service.update_interviewer(
        db,
        interviewer_id,
        data
    )



@router.delete(
        "/{interviewer_id}", 
        dependencies=[Depends(require_roles(("admin", "hr")))]
)
async def delete_interviewer(
    interviewer_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    await interviewer_service.delete_interviewer(
        db,
        interviewer_id
    )

    return {
        "message": "면접관 계정이 삭제되었습니다."
    }
