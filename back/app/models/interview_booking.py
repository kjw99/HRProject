from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.interview_slot import InterviewSlot


class InterviewBooking(Base):
    """면접 예약 테이블"""

    __tablename__ = "interview_bookings"
    __table_args__ = (
        CheckConstraint(
            "cancelled_at IS NULL OR cancelled_at >= created_at",
            name="check_cancelled_after_created",
        ),
    )

    booking_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="면접 예약 기본키 id",
    )
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("interview_slots.slot_id", ondelete="RESTRICT"),
        nullable=False,
        comment="예약한 면접 시간 FK",
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.candidate_id", ondelete="CASCADE"),
        nullable=False,
        comment="예약한 지원자 FK",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="예약 확정 시간",
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="취소 시각",
    )

    slot: Mapped["InterviewSlot"] = relationship(
        back_populates="bookings",
    )
    candidate: Mapped["Candidate"] = relationship(
        back_populates="booking",
    )

    def __repr__(self) -> str:
        return (
            f"<InterviewBooking(id={self.booking_id}, "
            f"slot_id={self.slot_id}, "
            f"candidate_id={self.candidate_id}, "
            f"cancelled_at={self.cancelled_at})>"
        )
