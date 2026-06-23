from app.core.celery_app import celery_app
from app.dependencies.database import SyncSessionLocal
from app.services.outbox_service import (
    OUTBOX_PUBLISH_BATCH_SIZE,
    outbox_service,
)
from app.tasks.mail_tasks import send_mail_delivery


@celery_app.task(name="app.tasks.outbox.publish_pending_events")
def publish_pending_outbox_events(limit: int = OUTBOX_PUBLISH_BATCH_SIZE) -> int:
    with SyncSessionLocal() as db:
        events = outbox_service.lock_publishable_events_sync(db, limit=limit)
        if not events:
            db.rollback()
            return 0

        published_count = 0
        for event in events:
            try:
                _publish_event(event)
            except Exception as exc:
                outbox_service.reschedule_publish(event, exc=exc)
            else:
                outbox_service.mark_published(event)
                published_count += 1

        db.commit()
        return published_count


def _publish_event(event) -> None:
    channel = event.payload.get("channel")
    if channel != "email":
        raise ValueError(f"Unsupported outbox channel: {channel}")

    mail_log_id = event.payload.get("mail_log_id")
    if not isinstance(mail_log_id, int):
        raise ValueError("mail_log_id is missing from the outbox payload.")

    send_mail_delivery.delay(mail_log_id)
