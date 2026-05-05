"""Update candidates/resumes and remove resume child tables.

Revision ID: 73744f572cf6
Revises: b1ed92ca04e1
Create Date: 2026-05-01 23:46:11.827533

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "73744f572cf6"
down_revision: Union[str, Sequence[str], None] = "b1ed92ca04e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("military")
    op.drop_table("qualifications")
    op.drop_table("statements")
    op.drop_table("experiences")
    op.drop_table("educations")

    op.add_column(
        "candidates",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
            comment="Updated timestamp",
        ),
    )

    op.add_column(
        "resumes",
        sa.Column("raw_text", sa.Text(), nullable=True, comment="Raw resume text"),
    )
    op.add_column(
        "resumes",
        sa.Column(
            "parsed_json",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="Parsed resume JSON",
        ),
    )
    op.add_column(
        "resumes",
        sa.Column("summary", sa.Text(), nullable=True, comment="AI generated resume summary"),
    )
    op.add_column(
        "resumes",
        sa.Column(
            "ai_profile",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="AI profile for interview question generation",
        ),
    )
    op.add_column(
        "resumes",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
            comment="Updated timestamp",
        ),
    )

    op.drop_constraint(op.f("resumes_position_id_fkey"), "resumes", type_="foreignkey")
    op.drop_column("resumes", "veteran_eligibility")
    op.drop_column("resumes", "position_id")
    op.drop_column("resumes", "disability")


def downgrade() -> None:
    op.add_column(
        "resumes",
        sa.Column("disability", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "resumes",
        sa.Column("position_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "resumes",
        sa.Column("veteran_eligibility", sa.String(length=50), nullable=True),
    )
    op.create_foreign_key(
        op.f("resumes_position_id_fkey"),
        "resumes",
        "positions",
        ["position_id"],
        ["position_id"],
    )

    op.drop_column("resumes", "updated_at")
    op.drop_column("resumes", "ai_profile")
    op.drop_column("resumes", "summary")
    op.drop_column("resumes", "parsed_json")
    op.drop_column("resumes", "raw_text")
    op.drop_column("candidates", "updated_at")

    op.create_table(
        "educations",
        sa.Column("education_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("school_name", sa.String(length=100), nullable=True),
        sa.Column("department", sa.String(length=100), nullable=True),
        sa.Column("completion_status", sa.String(length=50), nullable=True),
        sa.Column("attendance_start_period", sa.Date(), nullable=True),
        sa.Column("attendance_end_period", sa.Date(), nullable=True),
        sa.Column("location", sa.String(length=100), nullable=True),
        sa.Column("grade", sa.String(length=20), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "attendance_end_period >= attendance_start_period",
            name=op.f("check_attendance_period_valid"),
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.resume_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("education_id"),
    )
    op.create_table(
        "experiences",
        sa.Column("experience_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("company", sa.String(length=200), nullable=True),
        sa.Column("role", sa.String(length=200), nullable=True),
        sa.Column("job_title", sa.String(length=100), nullable=True),
        sa.Column("salary", sa.Integer(), nullable=True),
        sa.Column("reason_for_leaving", sa.String(length=500), nullable=True),
        sa.Column("employment_start_period", sa.Date(), nullable=True),
        sa.Column("employment_end_period", sa.Date(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "employment_end_period >= employment_start_period",
            name=op.f("check_employment_period_valid"),
        ),
        sa.CheckConstraint("salary >= 0", name=op.f("check_salary_non_negative")),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.resume_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("experience_id"),
    )
    op.create_table(
        "military",
        sa.Column("military_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("military_type", sa.String(length=50), nullable=True),
        sa.Column("military_service", sa.String(length=50), nullable=True),
        sa.Column("military_start_period", sa.Date(), nullable=True),
        sa.Column("military_end_period", sa.Date(), nullable=True),
        sa.Column("military_rank", sa.String(length=50), nullable=True),
        sa.Column("exemption_reason", sa.String(length=200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.resume_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("military_id"),
    )
    op.create_table(
        "qualifications",
        sa.Column("qualification_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("certificate", sa.String(length=200), nullable=True),
        sa.Column("organization", sa.String(length=200), nullable=True),
        sa.Column("issue_date", sa.Date(), nullable=True),
        sa.Column("certificate_number", sa.String(length=100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.resume_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("qualification_id"),
    )
    op.create_table(
        "statements",
        sa.Column("statement_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("question", sa.String(length=500), nullable=True),
        sa.Column("answer", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.resume_id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("statement_id"),
    )
