from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.models.outbox_event import (
    OUTBOX_AGGREGATE_TYPE_MAIL_DELIVERY_LOG,
    OUTBOX_CHANNEL_EMAIL,
    OUTBOX_EVENT_TYPE_DELIVERY_REQUESTED,
    OUTBOX_STATUS_PENDING,
    OUTBOX_STATUS_PUBLISHED,
    OutboxEvent,
)
from app.repositories.outbox_event_repository import outbox_event_repository


OUTBOX_MAX_PUBLISH_RETRIES = 10
OUTBOX_PUBLISH_BATCH_SIZE = 20


class OutboxService:
    @dataclass(frozen=True)
    class PublishDecision:
        publishable_events: list[OutboxEvent]

    def create_mail_delivery_requested_event(
        self,
        db: AsyncSession,
        *,
        mail_log_id: int,
    ) -> OutboxEvent:
        event = OutboxEvent(
            aggregate_type=OUTBOX_AGGREGATE_TYPE_MAIL_DELIVERY_LOG,
            aggregate_id=mail_log_id,
            channel=OUTBOX_CHANNEL_EMAIL,
            event_type=OUTBOX_EVENT_TYPE_DELIVERY_REQUESTED,
            payload={
                "version": 1,
                "channel": OUTBOX_CHANNEL_EMAIL,
                "mail_log_id": mail_log_id,
            },
            status=OUTBOX_STATUS_PENDING,
            next_retry_at=self._now(),
        )
        return outbox_event_repository.save(db, event)

    def lock_publishable_events_sync(
        self,
        db: Session,
        *,
        limit: int = OUTBOX_PUBLISH_BATCH_SIZE,
    ) -> list[OutboxEvent]:
        return outbox_event_repository.lock_pending_batch_sync(
            db,
            now=self._now(),
            limit=limit,
        )

    def mark_published(self, event: OutboxEvent) -> None:
        event.status = OUTBOX_STATUS_PUBLISHED
        event.published_at = self._now()
        event.last_error = None
        event.next_retry_at = None

    def reschedule_publish(self, event: OutboxEvent, *, exc: Exception) -> None:
        next_retry_count = event.retry_count + 1
        event.retry_count = next_retry_count
        event.last_error = str(exc) or "Failed to publish outbox event."

        if next_retry_count >= OUTBOX_MAX_PUBLISH_RETRIES:
            event.next_retry_at = None
            return

        event.next_retry_at = self._now() + timedelta(
            seconds=self._retry_delay_seconds(next_retry_count)
        )

    def _retry_delay_seconds(self, retry_count: int) -> int:
        if retry_count <= 1:
            return 10
        if retry_count == 2:
            return 30
        if retry_count == 3:
            return 60
        return 300

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)


outbox_service = OutboxService()
