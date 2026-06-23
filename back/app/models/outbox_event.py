from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.dependencies.database import Base


OUTBOX_CHANNEL_EMAIL = "email"
OUTBOX_CHANNEL_SMS = "sms"
OUTBOX_CHANNEL_KAKAO = "kakao"

OUTBOX_STATUS_PENDING = "pending"
OUTBOX_STATUS_PUBLISHED = "published"

OUTBOX_EVENT_TYPE_DELIVERY_REQUESTED = "delivery.requested"

OUTBOX_AGGREGATE_TYPE_MAIL_DELIVERY_LOG = "mail_delivery_log"


class OutboxEvent(Base):
    __tablename__ = "outbox_events"
    __table_args__ = (
        CheckConstraint(
            "channel IN ('email', 'sms', 'kakao')",
            name="check_outbox_events_channel_valid",
        ),
        CheckConstraint(
            "status IN ('pending', 'published')",
            name="check_outbox_events_status_valid",
        ),
    )

    event_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    aggregate_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    aggregate_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )
    channel: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    payload: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=OUTBOX_STATUS_PENDING,
        server_default=OUTBOX_STATUS_PENDING,
        index=True,
    )
    retry_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    next_retry_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        server_default=func.now(),
        index=True,
    )
    last_error: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
