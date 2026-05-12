from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.interview_slot import InterviewSlot
    from app.models.interview_slot_interviewer import InterviewSlotInterviewer
    from app.models.position import Position


class Interviewer(Base):
    __tablename__ = "interviewers"
    __table_args__ = (
        CheckConstraint(
            "interview_round IS NULL OR interview_round IN ('1차', '2차', '3차')",
            name="check_interviewer_round_valid",
        ),
    )

    interviewer_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="면접관 기본 id",
    )
    interviewer_email: Mapped[str] = mapped_column(
        String,
        nullable=False,
        comment="면접관 이메일",
    )
    interviewer_name: Mapped[str] = mapped_column(
        String,
        nullable=False,
        comment="면접관 이름",
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="면접관 배정 직무 FK",
    )
    interview_round: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="면접관 배정 차수",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성 시각",
    )

    slot_interviewers: Mapped[list["InterviewSlotInterviewer"]] = relationship(
        back_populates="interviewer",
    )
    slots: Mapped[list["InterviewSlot"]] = relationship(
        secondary="interview_slot_interviewers",
        back_populates="interviewers",
        viewonly=True,
    )
    position: Mapped["Position | None"] = relationship(
        back_populates="interviewers",
    )

    @property
    def position_name(self) -> str | None:
        return self.position.position_name if self.position else None

    def __repr__(self) -> str:
        return (
            f"<Interviewer(id={self.interviewer_id}, "
            f"name={self.interviewer_name}, "
            f"email={self.interviewer_email})>"
        )
