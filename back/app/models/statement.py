from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.resume import Resume

class Statement(Base):
    """자기소개서 테이블"""
    __tablename__ = "statements"

    statement_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="자기소개서 테이블 기본키 id",
    )
    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.resume_id", ondelete="CASCADE"),
        nullable=False,
        comment="이력서 FK",
    )
    question: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="자기소개서 질문",
    )
    answer: Mapped[str | None] = mapped_column(
        Text,  # varchar → Text (긴 텍스트 대응)
        nullable=True,
        comment="자기소개서 답변",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    resume: Mapped["Resume"] = relationship(
        back_populates="statements",
    )

    def __repr__(self) -> str:
        question_preview = (
            (self.question[:30] + "...") if self.question and len(self.question) > 30
            else self.question
        )
        return (
            f"<Statement(id={self.statement_id}, "
            f"resume_id={self.resume_id}, "
            f"question={question_preview})>"
        )