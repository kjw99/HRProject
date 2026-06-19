from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.mail_delivery_log import MailDeliveryLogResponse
from app.services.mail_delivery_service import mail_delivery_service


router = APIRouter(prefix="/api/mail-delivery-logs", tags=["Mail-Delivery"])


@router.get(
    "/{mail_log_id}",
    response_model=MailDeliveryLogResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_mail_delivery_log(
    mail_log_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    return await mail_delivery_service.get_log_response(db, mail_log_id)
