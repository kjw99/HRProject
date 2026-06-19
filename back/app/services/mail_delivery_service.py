from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, NotFoundException
from app.models.mail_delivery_log import (
    MAIL_DELIVERY_STATUS_FAILED,
    MAIL_DELIVERY_STATUS_PENDING,
    MAIL_DELIVERY_STATUS_SENT,
    MailDeliveryLog,
)
from app.repositories.mail_delivery_log_repository import mail_delivery_log_repository
from app.schemas.mail_delivery_log import MailDeliveryLogResponse


class MailDeliveryService:
    async def create_pending_log(
        self,
        db: AsyncSession,
        *,
        mail_type: str,
        related_entity_id: int,
        recipient_email: str,
        subject: str,
        body: str,
    ) -> MailDeliveryLog:
        mail_log = MailDeliveryLog(
            mail_type=mail_type,
            related_entity_id=related_entity_id,
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            status=MAIL_DELIVERY_STATUS_PENDING,
        )
        mail_delivery_log_repository.save(db, mail_log)
        await db.commit()
        await db.refresh(mail_log)
        return mail_log

    async def get_log(
        self,
        db: AsyncSession,
        mail_log_id: int,
    ) -> MailDeliveryLog:
        mail_log = await mail_delivery_log_repository.find_by_id(db, mail_log_id)
        if not mail_log:
            raise NotFoundException("Mail delivery log not found.")
        return mail_log

    async def get_log_response(
        self,
        db: AsyncSession,
        mail_log_id: int,
    ) -> MailDeliveryLogResponse:
        return MailDeliveryLogResponse.model_validate(
            await self.get_log(db, mail_log_id)
        )

    async def mark_sent(
        self,
        db: AsyncSession,
        mail_log_id: int,
        *,
        attempt_count: int,
    ) -> None:
        mail_log = await mail_delivery_log_repository.find_by_id(db, mail_log_id)
        if not mail_log:
            return

        mail_log.status = MAIL_DELIVERY_STATUS_SENT
        mail_log.attempt_count = attempt_count
        mail_log.error_message = None
        mail_log.sent_at = self._now()
        await db.commit()

    async def mark_failed(
        self,
        db: AsyncSession,
        mail_log_id: int,
        *,
        attempt_count: int,
        exc: Exception,
    ) -> None:
        mail_log = await mail_delivery_log_repository.find_by_id(db, mail_log_id)
        if not mail_log:
            return

        mail_log.status = MAIL_DELIVERY_STATUS_FAILED
        mail_log.attempt_count = attempt_count
        mail_log.error_message = self._get_error_message(exc)
        await db.commit()

    def _get_error_message(self, exc: Exception) -> str:
        if isinstance(exc, AppException):
            return exc.detail
        return str(exc) or "Failed to send email."

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)


mail_delivery_service = MailDeliveryService()
