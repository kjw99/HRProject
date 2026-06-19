from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.dependencies.database import Base


MAIL_TYPE_CANDIDATE = "candidate"
MAIL_TYPE_INTERVIEWER = "interviewer"
MAIL_DELIVERY_STATUS_PENDING = "pending"
MAIL_DELIVERY_STATUS_SENT = "sent"
MAIL_DELIVERY_STATUS_FAILED = "failed"


class MailDeliveryLog(Base):
    __tablename__ = "mail_delivery_logs"
    __table_args__ = (
        CheckConstraint(
            "mail_type IN ('candidate', 'interviewer')",
            name="check_mail_delivery_logs_type_valid",
        ),
        CheckConstraint(
            "status IN ('pending', 'sent', 'failed')",
            name="check_mail_delivery_logs_status_valid",
        ),
    )

    mail_log_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )
    mail_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    related_entity_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )
    recipient_email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=MAIL_DELIVERY_STATUS_PENDING,
        server_default=MAIL_DELIVERY_STATUS_PENDING,
        index=True,
    )
    attempt_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    queued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    sent_at: Mapped[datetime | None] = mapped_column(
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
