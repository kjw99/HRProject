from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.models.outbox_event import OutboxEvent, OUTBOX_STATUS_PENDING


class OutboxEventRepository:
    def save(
        self,
        db: AsyncSession,
        outbox_event: OutboxEvent,
    ) -> OutboxEvent:
        db.add(outbox_event)
        return outbox_event

    def lock_pending_batch_sync(
        self,
        db: Session,
        *,
        now: datetime,
        limit: int,
    ) -> list[OutboxEvent]:
        result = db.scalars(
            select(OutboxEvent)
            .where(
                OutboxEvent.status == OUTBOX_STATUS_PENDING,
                OutboxEvent.next_retry_at.is_not(None),
                OutboxEvent.next_retry_at <= now,
            )
            .order_by(OutboxEvent.created_at, OutboxEvent.event_id)
            .limit(limit)
            .with_for_update(skip_locked=True)
        )
        return list(result.all())


outbox_event_repository = OutboxEventRepository()
