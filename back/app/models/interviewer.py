from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.interview_slot_interviewer import InterviewSlotInterviewer
    from app.models.interview_slot import InterviewSlot

class Interviewer(Base):
    __tablename__ = "interviewers"

    interviewer_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="면접관 기본키 id",
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일. 현재 시간으로 자동 생성",
    )

    # 관계 설정
    # 중간 테이블 관계
    slot_interviewers: Mapped[list["InterviewSlotInterviewer"]] = relationship(
        back_populates="interviewer",
    )
    # 편의 관계
    slots: Mapped[list["InterviewSlot"]] = relationship(
        secondary="interview_slot_interviewers",
        back_populates="interviewers",
        viewonly=True,
    )

    def __repr__(self) -> str:
        return (
            f"<Interviewer(id={self.interviewers_id}, "
            f"name={self.interviewers_name}, "
            f"email={self.interviewers_email})>"
        )