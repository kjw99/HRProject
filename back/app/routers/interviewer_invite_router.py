from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.interviewer_invite import (
    InterviewerInviteAcceptRequest,
    InterviewerInviteCreateRequest,
    InterviewerInviteCreateResponse,
    InterviewerTokenResponse,
)
from app.services.interviewer_invite_service import interviewer_invite_service


router = APIRouter(prefix="/api/interviewer-invites", tags=["Interviewer Invite"])


@router.post(
    "",
    response_model=InterviewerInviteCreateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def create_interviewer_invite(
    data: InterviewerInviteCreateRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    return await interviewer_invite_service.create_invite(
        db=db,
        data=data,
        created_by_user_id=current_user.user_id,
    )


@router.post("/accept", response_model=InterviewerTokenResponse)
async def accept_interviewer_invite(
    data: InterviewerInviteAcceptRequest,
    db: AsyncSession = Depends(get_async_db),
):
    return await interviewer_invite_service.accept_invite(db, data.token)
