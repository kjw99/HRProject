from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.interview_slot import InterviewSlot
    from app.models.interviewer import Interviewer

class InterviewSlotInterviewer(Base):
    """면접관 배정 테이블 (InterviewSlot ↔ Interviewer M:N)"""
    __tablename__ = "interview_slot_interviewers"
    __table_args__ = (
        # 같은 슬롯에 같은 면접관 중복 배정 방지
        UniqueConstraint(
            "slot_id",
            "interviewer_id",
            name="uq_slot_interviewer",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="면접관 배정 기본키 id",
    )
    slot_id: Mapped[int] = mapped_column(
        ForeignKey("interview_slots.slot_id", ondelete="CASCADE"),
        nullable=False,
        comment="배정된 면접 슬롯 FK",
    )
    interviewer_id: Mapped[int] = mapped_column(
        ForeignKey("interviewers.interviewer_id", ondelete="RESTRICT"),
        nullable=False,
        comment="배정된 면접관 FK",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="면접관 배정 시각",
    )

    # 관계 설정
    slot: Mapped["InterviewSlot"] = relationship(
        back_populates="slot_interviewers",
    )
    interviewer: Mapped["Interviewer"] = relationship(
        back_populates="slot_interviewers",
    )

    def __repr__(self) -> str:
        return (
            f"<InterviewSlotInterviewer(id={self.id}, "
            f"slot_id={self.slot_id}, "
            f"interviewer_id={self.interviewer_id})>"
        )