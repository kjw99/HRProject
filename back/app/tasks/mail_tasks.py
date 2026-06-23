from app.core.celery_app import celery_app
from app.dependencies.database import SyncSessionLocal
from app.services.mail_delivery_service import mail_delivery_service
from app.services.mail_service import mail_service


MAX_MAIL_DELIVERY_ATTEMPTS = 3


@celery_app.task(
    name="app.tasks.mail.send_delivery",
    bind=True,
    max_retries=MAX_MAIL_DELIVERY_ATTEMPTS - 1,
)
def send_mail_delivery(self, mail_log_id: int) -> None:
    mail_log = _claim_mail_for_delivery(mail_log_id)
    if mail_log is None:
        return

    try:
        _send_logged_mail(mail_log)
    except Exception as exc:
        if self.request.retries >= self.max_retries:
            _mark_mail_failed(
                mail_log_id,
                attempt_count=self.request.retries + 1,
                exc=exc,
            )
            raise

        _mark_mail_pending_for_retry(
            mail_log_id,
            attempt_count=self.request.retries + 1,
            exc=exc,
        )
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    else:
        _mark_mail_sent(
            mail_log_id,
            attempt_count=self.request.retries + 1,
        )


def _claim_mail_for_delivery(mail_log_id: int):
    with SyncSessionLocal() as db:
        return mail_delivery_service.claim_pending_for_delivery_sync(db, mail_log_id)


def _send_logged_mail(mail_log) -> None:
    mail_service.send_mail(
        mail_log.recipient_email,
        mail_log.subject,
        mail_log.body,
    )


def _mark_mail_sent(mail_log_id: int, *, attempt_count: int) -> None:
    with SyncSessionLocal() as db:
        mail_delivery_service.mark_sent_sync(
            db,
            mail_log_id,
            attempt_count=attempt_count,
        )


def _mark_mail_pending_for_retry(
    mail_log_id: int,
    *,
    attempt_count: int,
    exc: Exception,
) -> None:
    with SyncSessionLocal() as db:
        mail_delivery_service.mark_retry_pending_sync(
            db,
            mail_log_id,
            attempt_count=attempt_count,
            exc=exc,
        )


def _mark_mail_failed(
    mail_log_id: int,
    *,
    attempt_count: int,
    exc: Exception,
) -> None:
    with SyncSessionLocal() as db:
        mail_delivery_service.mark_failed_sync(
            db,
            mail_log_id,
            attempt_count=attempt_count,
            exc=exc,
        )
