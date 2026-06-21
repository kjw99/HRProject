from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ExternalServiceException
from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.models.mail_delivery_log import MAIL_TYPE_CANDIDATE
from app.schemas.common import MessageResponse
from app.schemas.candidate_mail import CandidateMailSendRequest
from app.services.candidate_mail_service import candidate_mail_service
from app.services.mail_delivery_service import mail_delivery_service
from app.tasks.mail_tasks import send_mail_delivery


router = APIRouter(prefix="/api", tags=["Email-Send"])


@router.post(
    "/mail-send/{candidate_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def send_candidate_mail(
    candidate_id: int,
    data: CandidateMailSendRequest,
    db: AsyncSession = Depends(get_async_db),
):
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
    )
    mail_log = pending_log.mail_log
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
    return {"message": "Mail has been queued for delivery."}
