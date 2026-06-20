from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.mail_delivery_log import MailDeliveryLog


class MailDeliveryLogRepository:
    def save(
        self,
        db: AsyncSession,
        mail_delivery_log: MailDeliveryLog,
    ) -> MailDeliveryLog:
        db.add(mail_delivery_log)
        return mail_delivery_log

    async def find_by_id(
        self,
        db: AsyncSession,
        mail_log_id: int,
    ) -> MailDeliveryLog | None:
        return await db.get(MailDeliveryLog, mail_log_id)

    def find_by_id_sync(
        self,
        db: Session,
        mail_log_id: int,
    ) -> MailDeliveryLog | None:
        return db.get(MailDeliveryLog, mail_log_id)

    async def find_by_related_entity(
        self,
        db: AsyncSession,
        mail_type: str,
        related_entity_id: int,
        limit: int = 20,
    ) -> list[MailDeliveryLog]:
        result = await db.scalars(
            select(MailDeliveryLog)
            .where(
                MailDeliveryLog.mail_type == mail_type,
                MailDeliveryLog.related_entity_id == related_entity_id,
            )
            .order_by(MailDeliveryLog.mail_log_id.desc())
            .limit(limit)
        )
        return list(result.all())


mail_delivery_log_repository = MailDeliveryLogRepository()
