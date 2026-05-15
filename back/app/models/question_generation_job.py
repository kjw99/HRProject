from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, JSON, String, Text
from sqlalchemy import func, text
from sqlalchemy.orm import Mapped, mapped_column

from app.dependencies.database import Base


QUESTION_GENERATION_STATUS_QUEUED = "queued"
QUESTION_GENERATION_STATUS_RUNNING = "running"
QUESTION_GENERATION_STATUS_SUCCEEDED = "succeeded"
QUESTION_GENERATION_STATUS_FAILED = "failed"
ACTIVE_QUESTION_GENERATION_STATUSES = (
    QUESTION_GENERATION_STATUS_QUEUED,
    QUESTION_GENERATION_STATUS_RUNNING,
)


class QuestionGenerationJob(Base):
    __tablename__ = "question_generation_jobs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed')",
            name="check_question_generation_job_status_valid",
        ),
        Index(
            "ix_question_generation_jobs_active_user",
            "created_by_user_id",
            unique=True,
            postgresql_where=text(
                "created_by_user_id IS NOT NULL "
                "AND status IN ('queued', 'running')"
            ),
        ),
        Index(
            "ix_question_generation_jobs_active_interviewer",
            "created_by_interviewer_id",
            unique=True,
            postgresql_where=text(
                "created_by_interviewer_id IS NOT NULL "
                "AND status IN ('queued', 'running')"
            ),
        ),
    )

    job_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=QUESTION_GENERATION_STATUS_QUEUED,
        server_default=QUESTION_GENERATION_STATUS_QUEUED,
        index=True,
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.candidate_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by_interviewer_id: Mapped[int | None] = mapped_column(
        ForeignKey("interviewers.interviewer_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    request_payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    result_questions: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
