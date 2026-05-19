import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user, require_roles
from app.models.user import User
from app.schemas.interviewer_invite import InterviewerInviteCreateResponse
from app.schemas.interviewer_mail import (
    InterviewerMailSendRequest,
    InterviewerMailSendResponse,
)
from app.services.interviewer_invite_service import interviewer_invite_service
from app.services.interviewer_mail_service import interviewer_mail_service


router = APIRouter(prefix="/api/interviewers", tags=["Interviewer-Email"])
logger = logging.getLogger(__name__)


def _send_interviewer_mail_in_background(
    *,
    to_email: str,
    subject: str,
    content: str,
) -> None:
    try:
        interviewer_mail_service.send_interviewer_mail(
            to_email=to_email,
            subject=subject,
            content=content,
        )
    except Exception:
        logger.exception(
            "Failed to send interviewer mail in background. to=%s",
            to_email,
        )


@router.get(
    "/{interviewer_id}/active-invite",
    response_model=InterviewerInviteCreateResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_active_interviewer_invite(
    interviewer_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    invite = await interviewer_invite_service.get_active_invite(db, interviewer_id)
    if invite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용 가능한 초대 링크가 없습니다.",
        )
    return invite


@router.post(
    "/{interviewer_id}/email",
    response_model=InterviewerMailSendResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def send_interviewer_mail(
    interviewer_id: int,
    data: InterviewerMailSendRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    interviewer_mail = await interviewer_mail_service.create_interviewer_mail(
        db=db,
        interviewer_id=interviewer_id,
        subject=data.subject,
        content=data.content,
        template_id=data.template_id,
        template_variables=data.template_variables,
        expires_in_days=data.expires_in_days,
        created_by_user_id=current_user.user_id,
    )
    background_tasks.add_task(
        _send_interviewer_mail_in_background,
        to_email=interviewer_mail.to_email,
        subject=interviewer_mail.subject,
        content=interviewer_mail.content,
    )
    return {
        "message": "Interviewer mail has been queued for delivery.",
        "invite_url": interviewer_mail.invite.invite_url,
        "expires_at": interviewer_mail.invite.expires_at,
    }
