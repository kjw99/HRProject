from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.interview_slot import InterviewSlot
    from app.models.candidate import Candidate

class InterviewBooking(Base):
    """면접 예약 테이블"""
    __tablename__ = "interview_bookings"
    __table_args__ = (
        # 예약 상태 값 제약
        CheckConstraint(
            "booking_status IN ('booked', 'cancelled')",
            name="check_booking_status_valid",
        ),
        # 취소 상태일 때만 cancelled_at 존재 (논리적 일관성)
        CheckConstraint(
            "(booking_status = 'cancelled' AND cancelled_at IS NOT NULL) OR "
            "(booking_status = 'booked' AND cancelled_at IS NULL)",
            name="check_cancelled_at_consistency",
        ),
        # 취소 시각은 생성 시각 이후
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
    booking_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="booked",
        comment="예약 상태 (booked/cancelled)",
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

    # 관계 설정
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
            f"status={self.booking_status})>"
        )