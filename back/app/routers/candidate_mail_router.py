from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ExternalServiceException
from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.models.mail_delivery_log import MAIL_TYPE_CANDIDATE
from app.schemas.candidate_mail import (
    CandidateMailSendRequest,
    CandidateMailSendResponse,
)
from app.services.candidate_mail_service import candidate_mail_service
from app.services.mail_delivery_service import mail_delivery_service
from app.tasks.mail_tasks import send_mail_delivery
from app.utils.mail_idempotency import (
    build_mail_request_hash,
    normalize_idempotency_key,
)


router = APIRouter(prefix="/api/candidates", tags=["Candidate-Email"])


@router.post(
    "/{candidate_id}/email",
    response_model=CandidateMailSendResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def send_candidate_mail(
    candidate_id: int,
    data: CandidateMailSendRequest,
    db: AsyncSession = Depends(get_async_db),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
):
    normalized_idempotency_key = normalize_idempotency_key(idempotency_key)
    recipient_email = await candidate_mail_service.get_candidate_email(db, candidate_id)
    request_hash = build_mail_request_hash(
        {
            "mail_type": MAIL_TYPE_CANDIDATE,
            "related_entity_id": candidate_id,
            "recipient_email": recipient_email,
            "subject": data.subject,
            "content": data.content,
            "template_id": data.template_id,
            "template_variables": data.template_variables,
            "expires_at": data.expires_at,
        }
    )
    existing_log = await mail_delivery_service.get_log_by_idempotency(
        db,
        mail_type=MAIL_TYPE_CANDIDATE,
        related_entity_id=candidate_id,
        idempotency_key=normalized_idempotency_key,
        request_hash=request_hash,
    )
    if existing_log is not None:
        invitation = await candidate_mail_service.get_existing_invitation_response(
            db,
            candidate_id=candidate_id,
            mail_log=existing_log,
        )
        return {
            "message": "Candidate mail has already been queued for delivery.",
            "mail_log_id": existing_log.mail_log_id,
            "invitation_url": invitation.invitation_url,
            "expires_at": invitation.expires_at,
        }

    candidate_mail = await candidate_mail_service.create_candidate_mail(
        db,
        candidate_id=candidate_id,
        subject=data.subject,
        content=data.content,
        template_id=data.template_id,
        template_variables=data.template_variables,
        expires_at=data.expires_at,
    )
    pending_log = await mail_delivery_service.create_pending_log(
        db,
        mail_type=MAIL_TYPE_CANDIDATE,
        related_entity_id=candidate_id,
        recipient_email=candidate_mail.to_email,
        subject=candidate_mail.subject,
        body=candidate_mail.content,
        idempotency_key=normalized_idempotency_key,
        request_hash=request_hash,
    )
    mail_log = pending_log.mail_log
    if not pending_log.created:
        invitation = await candidate_mail_service.get_existing_invitation_response(
            db,
            candidate_id=candidate_id,
            mail_log=mail_log,
        )
        return {
            "message": "Candidate mail has already been queued for delivery.",
            "mail_log_id": mail_log.mail_log_id,
            "invitation_url": invitation.invitation_url,
            "expires_at": invitation.expires_at,
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
        "message": "Candidate mail has been queued for delivery.",
        "mail_log_id": mail_log.mail_log_id,
        "invitation_url": candidate_mail.invitation.invitation_url,
        "expires_at": candidate_mail.invitation.expires_at,
    }
