from datetime import datetime
from typing import Any, TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.candidate import Candidate


class Resume(Base):
    __tablename__ = "resumes"

    resume_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="Resume primary key",
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.candidate_id"),
        nullable=False,
        comment="Candidate foreign key",
    )
    desired_location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="Desired work location",
    )
    desired_salary: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="Desired salary",
    )
    file_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="Original resume file path",
    )
    raw_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="Raw resume text",
    )
    parsed_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="Parsed resume JSON",
    )
    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        comment="AI generated resume summary",
    )
    ai_profile: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="AI profile for interview question generation",
    )
    question_keywords: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="Keywords for interview question generation and reuse",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Created timestamp",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Updated timestamp",
    )

    candidate: Mapped["Candidate"] = relationship(
        back_populates="resumes",
    )

    def __repr__(self) -> str:
        return (
            f"<Resume(id={self.resume_id}, "
            f"candidate_id={self.candidate_id})>"
        )
