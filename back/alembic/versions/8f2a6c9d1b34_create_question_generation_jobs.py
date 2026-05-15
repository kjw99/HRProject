"""create question generation jobs

Revision ID: 8f2a6c9d1b34
Revises: 4f3c2a1d9b77
Create Date: 2026-05-15 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8f2a6c9d1b34"
down_revision: Union[str, Sequence[str], None] = "4f3c2a1d9b77"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "question_generation_jobs",
        sa.Column("job_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column(
            "status",
            sa.String(length=20),
            server_default="queued",
            nullable=False,
        ),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("position_id", sa.Integer(), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column("created_by_interviewer_id", sa.Integer(), nullable=True),
        sa.Column("request_payload", sa.JSON(), nullable=False),
        sa.Column("result_questions", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed')",
            name="check_question_generation_job_status_valid",
        ),
        sa.ForeignKeyConstraint(
            ["candidate_id"],
            ["candidates.candidate_id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_interviewer_id"],
            ["interviewers.interviewer_id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.user_id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["position_id"],
            ["positions.position_id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("job_id"),
    )
    op.create_index(
        op.f("ix_question_generation_jobs_candidate_id"),
        "question_generation_jobs",
        ["candidate_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_question_generation_jobs_created_by_interviewer_id"),
        "question_generation_jobs",
        ["created_by_interviewer_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_question_generation_jobs_created_by_user_id"),
        "question_generation_jobs",
        ["created_by_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_question_generation_jobs_position_id"),
        "question_generation_jobs",
        ["position_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_question_generation_jobs_status"),
        "question_generation_jobs",
        ["status"],
        unique=False,
    )
    op.create_index(
        "ix_question_generation_jobs_active_interviewer",
        "question_generation_jobs",
        ["created_by_interviewer_id"],
        unique=True,
        postgresql_where=sa.text(
            "created_by_interviewer_id IS NOT NULL "
            "AND status IN ('queued', 'running')"
        ),
    )
    op.create_index(
        "ix_question_generation_jobs_active_user",
        "question_generation_jobs",
        ["created_by_user_id"],
        unique=True,
        postgresql_where=sa.text(
            "created_by_user_id IS NOT NULL "
            "AND status IN ('queued', 'running')"
        ),
    )


def downgrade() -> None:
    op.drop_index(
        "ix_question_generation_jobs_active_user",
        table_name="question_generation_jobs",
    )
    op.drop_index(
        "ix_question_generation_jobs_active_interviewer",
        table_name="question_generation_jobs",
    )
    op.drop_index(
        op.f("ix_question_generation_jobs_status"),
        table_name="question_generation_jobs",
    )
    op.drop_index(
        op.f("ix_question_generation_jobs_position_id"),
        table_name="question_generation_jobs",
    )
    op.drop_index(
        op.f("ix_question_generation_jobs_created_by_user_id"),
        table_name="question_generation_jobs",
    )
    op.drop_index(
        op.f("ix_question_generation_jobs_created_by_interviewer_id"),
        table_name="question_generation_jobs",
    )
    op.drop_index(
        op.f("ix_question_generation_jobs_candidate_id"),
        table_name="question_generation_jobs",
    )
    op.drop_table("question_generation_jobs")
