from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.question import Question
    from app.models.interview_slot import InterviewSlot

class Position(Base):
    __tablename__ = "positions"

    position_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="직무 테이블 기본키 id",
    )
    position_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="직무명",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    candidates: Mapped[list["Candidate"]] = relationship(
        back_populates="position",
    )

    questions: Mapped[list["Question"]] = relationship(
        back_populates="position",
    )
    interview_slots: Mapped[list["InterviewSlot"]] = relationship(
        back_populates="position",
    )

    def __repr__(self) -> str:
        return (
            f"<Position(id={self.position_id}, "
            f"name={self.position_name})>"
        )
