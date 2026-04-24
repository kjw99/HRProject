from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.position import Position

class Question(Base):
    """면접 질문 테이블"""
    __tablename__ = "questions"

    question_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="질문 기본키 id",
    )
    candidate_id: Mapped[int | None] = mapped_column(
        ForeignKey("candidates.candidate_id", ondelete="SET NULL"),  # 삭제 시 NULL
        nullable=True,
        comment="지원자 FK (삭제되면 NULL, 질문 데이터는 보존)",
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id", ondelete="SET NULL"),  # 삭제 시 NULL
        nullable=True,
        comment="직무 FK (직무 기반 질문 생성 시)",
    )
    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="질문 내용",
    )
    question_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        comment="질문 유형 (job_based, candidate_based)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    candidate: Mapped["Candidate | None"] = relationship(
        back_populates="questions",
    )
    position: Mapped["Position | None"] = relationship(
        back_populates="questions",
    )

    def __repr__(self) -> str:
        text_preview = (
            (self.question_text[:30] + "...")
            if self.question_text and len(self.question_text) > 30
            else self.question_text
        )
        return (
            f"<Question(id={self.question_id}, "
            f"type={self.question_type}, "
            f"text={text_preview})>"
        )