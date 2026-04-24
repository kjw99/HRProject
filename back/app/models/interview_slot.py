from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    String,
    Integer,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.position import Position
    from app.models.interview_booking import InterviewBooking
    from app.models.interview_slot_interviewer import InterviewSlotInterviewer
    from app.models.interviewer import Interviewer

class InterviewSlot(Base):
    """면접 시간 테이블"""
    __tablename__ = "interview_slots"
    __table_args__ = (
        # 슬롯 상태 값 제약
        CheckConstraint(
            "slot_status IN ('open', 'full', 'closed')",
            name="check_slot_status_valid",
        ),
        # 시작 < 종료 시간 보장
        CheckConstraint(
            "interview_starts_at < interview_ends_at",
            name="check_interview_time_order",
        ),
        # 예약 마감 <= 면접 시작 시간
        CheckConstraint(
            "booking_deadline_at IS NULL OR booking_deadline_at <= interview_starts_at",
            name="check_booking_deadline_before_start",
        ),
    )

    slot_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="면접 시간 기본키 id",
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id", ondelete="SET NULL"),
        nullable=True,
        comment="직무 FK (공고/전형 테이블이 생기면 변경 예정)",
    )
    interview_round: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="면접 라운드 (1차/2차/3차/최종)",
    )
    interview_starts_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="실제 면접 시작 시간",
    )
    interview_ends_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="실제 면접 종료 시간",
    )
    booking_deadline_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="예약 마감 시각",
    )
    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="예약 가능 인원",
    )
    slot_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="open",
        comment="슬롯 상태 (open/full/closed)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    position: Mapped["Position | None"] = relationship(
        back_populates="interview_slots",
    )
    bookings: Mapped[list["InterviewBooking"]] = relationship(
        back_populates="slot",
    )

    # 중간 테이블 관계
    slot_interviewers: Mapped[list["InterviewSlotInterviewer"]] = relationship(
        back_populates="slot",
        cascade="all, delete-orphan",
    )
    # 편의 관계 (직접 면접관 목록 조회)
    interviewers: Mapped[list["Interviewer"]] = relationship(
        secondary="interview_slot_interviewers",
        back_populates="slots",
        viewonly=True,  # 중간 테이블로만 수정
    )

    def __repr__(self) -> str:
        return (
            f"<InterviewSlot(id={self.slot_id}, "
            f"round={self.interview_round}, "
            f"starts_at={self.interview_starts_at}, "
            f"status={self.slot_status})>"
        )