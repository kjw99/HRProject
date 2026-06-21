from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, ConflictException, NotFoundException
from app.models.mail_delivery_log import (
    MAIL_DELIVERY_STATUS_FAILED,
    MAIL_DELIVERY_STATUS_PENDING,
    MAIL_DELIVERY_STATUS_SENT,
    MailDeliveryLog,
)
from app.repositories.mail_delivery_log_repository import mail_delivery_log_repository
from app.schemas.mail_delivery_log import MailDeliveryLogResponse


class MailDeliveryService:
    @dataclass(frozen=True)
    class CreatePendingLogResult:
        mail_log: MailDeliveryLog
        created: bool

    async def create_pending_log(
        self,
        db: AsyncSession,
        *,
        mail_type: str,
        related_entity_id: int,
        recipient_email: str,
        subject: str,
        body: str,
        idempotency_key: str | None = None,
        request_hash: str | None = None,
    ) -> CreatePendingLogResult:
        if idempotency_key and not request_hash:
            raise ValueError("request_hash is required when idempotency_key is set.")

        mail_log = MailDeliveryLog(
            mail_type=mail_type,
            related_entity_id=related_entity_id,
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            idempotency_key=idempotency_key,
            request_hash=request_hash,
            status=MAIL_DELIVERY_STATUS_PENDING,
        )
        mail_delivery_log_repository.save(db, mail_log)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            if not idempotency_key:
                raise

            existing = await self.get_log_by_idempotency(
                db,
                mail_type=mail_type,
                related_entity_id=related_entity_id,
                idempotency_key=idempotency_key,
                request_hash=request_hash,
            )
            if existing is None:
                raise
            return self.CreatePendingLogResult(mail_log=existing, created=False)

        await db.refresh(mail_log)
        return self.CreatePendingLogResult(mail_log=mail_log, created=True)

    async def get_log_by_idempotency(
        self,
        db: AsyncSession,
        *,
        mail_type: str,
        related_entity_id: int,
        idempotency_key: str | None,
        request_hash: str | None = None,
    ) -> MailDeliveryLog | None:
        if not idempotency_key:
            return None

        mail_log = await mail_delivery_log_repository.find_by_idempotency_key(
            db,
            mail_type=mail_type,
            related_entity_id=related_entity_id,
            idempotency_key=idempotency_key,
        )
        if mail_log is None:
            return None

        if request_hash is not None and mail_log.request_hash != request_hash:
            raise ConflictException(
                "Idempotency-Key has already been used with a different mail request."
            )
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

    def get_log_sync(
        self,
        db: Session,
        mail_log_id: int,
    ) -> MailDeliveryLog:
        mail_log = mail_delivery_log_repository.find_by_id_sync(db, mail_log_id)
        if not mail_log:
            raise NotFoundException("Mail delivery log not found.")
        return mail_log

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

    def mark_sent_sync(
        self,
        db: Session,
        mail_log_id: int,
        *,
        attempt_count: int,
    ) -> None:
        mail_log = mail_delivery_log_repository.find_by_id_sync(db, mail_log_id)
        if not mail_log:
            return

        mail_log.status = MAIL_DELIVERY_STATUS_SENT
        mail_log.attempt_count = attempt_count
        mail_log.error_message = None
        mail_log.sent_at = self._now()
        db.commit()

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

    def mark_failed_sync(
        self,
        db: Session,
        mail_log_id: int,
        *,
        attempt_count: int,
        exc: Exception,
    ) -> None:
        mail_log = mail_delivery_log_repository.find_by_id_sync(db, mail_log_id)
        if not mail_log:
            return

        mail_log.status = MAIL_DELIVERY_STATUS_FAILED
        mail_log.attempt_count = attempt_count
        mail_log.error_message = self._get_error_message(exc)
        db.commit()

    def _get_error_message(self, exc: Exception) -> str:
        if isinstance(exc, AppException):
            return exc.detail
        return str(exc) or "Failed to send email."

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)


mail_delivery_service = MailDeliveryService()
