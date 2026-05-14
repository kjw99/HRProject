from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.interviewer import Interviewer
    from app.models.position import Position
    from app.models.user import User


class Question(Base):
    __tablename__ = "questions"

    question_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    candidate_id: Mapped[int | None] = mapped_column(
        ForeignKey("candidates.candidate_id", ondelete="SET NULL"),
        nullable=True,
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id", ondelete="SET NULL"),
        nullable=True,
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(30), nullable=False)
    evaluation_intent: Mapped[str | None] = mapped_column(Text, nullable=True)
    generation_basis: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    created_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by_interviewer_id: Mapped[int | None] = mapped_column(
        ForeignKey("interviewers.interviewer_id", ondelete="SET NULL"),
        nullable=True,
    )

    candidate: Mapped["Candidate | None"] = relationship(back_populates="questions")
    position: Mapped["Position | None"] = relationship(back_populates="questions")
    created_by_user: Mapped["User | None"] = relationship(
        back_populates="created_questions"
    )
    created_by_interviewer: Mapped["Interviewer | None"] = relationship(
        back_populates="created_questions"
    )
