from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.concurrency import run_in_threadpool

from app.dependencies.database import get_async_db
from app.schemas.common import MessageResponse
from app.services.mail_service import mail_service


router = APIRouter(prefix="/api", tags=["Email-Send"])


class CandidateMailSendRequest(BaseModel):
    subject: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)


@router.post(
    "/mail-send/{candidate_id}",
    response_model=MessageResponse,
)
async def send_candidate_mail(
    candidate_id: int,
    data: CandidateMailSendRequest,
    db: AsyncSession = Depends(get_async_db),
):
    to_email = await mail_service.get_candidate_email(db, candidate_id)
    await run_in_threadpool(
        mail_service.send_mail,
        to_email,
        data.subject,
        data.content,
    )
    return {"message": "Mail sent successfully."}
