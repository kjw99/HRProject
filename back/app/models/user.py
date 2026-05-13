from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.interviewer_invite import InterviewerInvite
    from app.models.question import Question


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    pw_hash: Mapped[str] = mapped_column(String, nullable=False)
    user_name: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    created_questions: Mapped[list["Question"]] = relationship(
        back_populates="created_by_user"
    )
    created_interviewer_invites: Mapped[list["InterviewerInvite"]] = relationship(
        back_populates="created_by_user"
    )
