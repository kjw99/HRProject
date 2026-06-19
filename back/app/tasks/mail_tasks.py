import asyncio

from app.core.celery_app import celery_app
from app.dependencies.database import AsyncSessionLocal
from app.services.mail_delivery_service import mail_delivery_service
from app.services.mail_service import mail_service


MAX_MAIL_DELIVERY_ATTEMPTS = 3


@celery_app.task(
    name="app.tasks.mail.send_delivery",
    bind=True,
    max_retries=MAX_MAIL_DELIVERY_ATTEMPTS - 1,
)
def send_mail_delivery(self, mail_log_id: int) -> None:
    try:
        asyncio.run(_send_logged_mail(mail_log_id))
    except Exception as exc:
        if self.request.retries >= self.max_retries:
            asyncio.run(
                _mark_mail_failed(
                    mail_log_id,
                    attempt_count=self.request.retries + 1,
                    exc=exc,
                )
            )
            raise

        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    else:
        asyncio.run(
            _mark_mail_sent(
                mail_log_id,
                attempt_count=self.request.retries + 1,
            )
        )


async def _send_logged_mail(mail_log_id: int) -> None:
    async with AsyncSessionLocal() as db:
        mail_log = await mail_delivery_service.get_log(db, mail_log_id)
        mail_service.send_mail(
            mail_log.recipient_email,
            mail_log.subject,
            mail_log.body,
        )


async def _mark_mail_sent(mail_log_id: int, *, attempt_count: int) -> None:
    async with AsyncSessionLocal() as db:
        await mail_delivery_service.mark_sent(
            db,
            mail_log_id,
            attempt_count=attempt_count,
        )


async def _mark_mail_failed(
    mail_log_id: int,
    *,
    attempt_count: int,
    exc: Exception,
) -> None:
    async with AsyncSessionLocal() as db:
        await mail_delivery_service.mark_failed(
            db,
            mail_log_id,
            attempt_count=attempt_count,
            exc=exc,
        )
