from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ExternalServiceException
from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user, require_roles
from app.models.mail_delivery_log import MAIL_TYPE_INTERVIEWER
from app.models.user import User
from app.schemas.interviewer_invite import InterviewerInviteCreateResponse
from app.schemas.interviewer_mail import (
    InterviewerMailSendRequest,
    InterviewerMailSendResponse,
)
from app.services.interviewer_invite_service import interviewer_invite_service
from app.services.interviewer_mail_service import interviewer_mail_service
from app.services.mail_delivery_service import mail_delivery_service
from app.tasks.mail_tasks import send_mail_delivery
from app.utils.mail_idempotency import (
    build_mail_request_hash,
    normalize_idempotency_key,
)


router = APIRouter(prefix="/api/interviewers", tags=["Interviewer-Email"])


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
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    normalized_idempotency_key = normalize_idempotency_key(idempotency_key)
    recipient_email = await interviewer_mail_service.get_interviewer_email(
        db,
        interviewer_id,
    )
    request_hash = build_mail_request_hash(
        {
            "mail_type": MAIL_TYPE_INTERVIEWER,
            "related_entity_id": interviewer_id,
            "recipient_email": recipient_email,
            "subject": data.subject,
            "content": data.content,
            "template_id": data.template_id,
            "template_variables": data.template_variables,
            "expires_in_days": data.expires_in_days,
        }
    )
    existing_log = await mail_delivery_service.get_log_by_idempotency(
        db,
        mail_type=MAIL_TYPE_INTERVIEWER,
        related_entity_id=interviewer_id,
        idempotency_key=normalized_idempotency_key,
        request_hash=request_hash,
    )
    if existing_log is not None:
        invite = await interviewer_mail_service.get_existing_invite_response(
            db,
            interviewer_id=interviewer_id,
            mail_log=existing_log,
        )
        return {
            "message": "Interviewer mail has already been queued for delivery.",
            "mail_log_id": existing_log.mail_log_id,
            "invite_url": invite.invite_url,
            "expires_at": invite.expires_at,
        }

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
    pending_log = await mail_delivery_service.create_pending_log(
        db,
        mail_type=MAIL_TYPE_INTERVIEWER,
        related_entity_id=interviewer_id,
        recipient_email=interviewer_mail.to_email,
        subject=interviewer_mail.subject,
        body=interviewer_mail.content,
        idempotency_key=normalized_idempotency_key,
        request_hash=request_hash,
    )
    mail_log = pending_log.mail_log
    if not pending_log.created:
        invite = await interviewer_mail_service.get_existing_invite_response(
            db,
            interviewer_id=interviewer_id,
            mail_log=mail_log,
        )
        return {
            "message": "Interviewer mail has already been queued for delivery.",
            "mail_log_id": mail_log.mail_log_id,
            "invite_url": invite.invite_url,
            "expires_at": invite.expires_at,
        }

    try:
        send_mail_delivery.delay(mail_log.mail_log_id)
    except Exception as exc:
        await mail_delivery_service.mark_failed(
            db,
            mail_log.mail_log_id,
            attempt_count=0,
            exc=exc,
        )
        raise ExternalServiceException("Failed to queue email delivery.") from exc
    return {
        "message": "Interviewer mail has been queued for delivery.",
        "mail_log_id": mail_log.mail_log_id,
        "invite_url": interviewer_mail.invite.invite_url,
        "expires_at": interviewer_mail.invite.expires_at,
    }
