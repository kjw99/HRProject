import os

from celery import Celery
from dotenv import load_dotenv


load_dotenv()


celery_app = Celery(
    "hrproject",
    broker=os.getenv("CELERY_BROKER_URL"),
    backend=os.getenv("CELERY_RESULT_BACKEND"),
    include=["app.tasks.health_tasks", "app.tasks.mail_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone=os.getenv("CELERY_TIMEZONE", "Asia/Seoul"),
    enable_utc=True,
)
