from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.candidate_mail import (
    CandidateMailSendRequest,
    CandidateMailSendResponse,
)
from app.services.candidate_mail_service import candidate_mail_service


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
    await run_in_threadpool(
        candidate_mail_service.send_candidate_mail,
        candidate_mail.to_email,
        candidate_mail.subject,
        candidate_mail.content,
    )
    return {
        "message": "Candidate mail sent successfully.",
        "invitation_url": candidate_mail.invitation.invitation_url,
        "expires_at": candidate_mail.invitation.expires_at,
    }
