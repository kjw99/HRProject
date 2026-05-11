# Split mailsend.py into router/service structure.
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field
from starlette.concurrency import run_in_threadpool

from app.dependencies.dependencies import require_roles
from app.schemas.common import MessageResponse
from app.services.mail_service import mail_service


router = APIRouter(prefix="/api/mail", tags=["Mail"])


class MailSendRequest(BaseModel):
    to_email: EmailStr = Field(..., alias="toEmail")
    subject: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)


@router.post(
    "/send",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def send_mail(data: MailSendRequest):
    await run_in_threadpool(
        mail_service.send_mail,
        str(data.to_email),
        data.subject,
        data.content,
    )
    return {"message": "Mail sent successfully."}