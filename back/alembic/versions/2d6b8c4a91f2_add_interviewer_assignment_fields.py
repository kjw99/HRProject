"""Add interviewer assignment fields.

Revision ID: 2d6b8c4a91f2
Revises: 9b2a8fd4c1e6
Create Date: 2026-05-12 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2d6b8c4a91f2"
down_revision: Union[str, Sequence[str], None] = "9b2a8fd4c1e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "interviewers",
        sa.Column(
            "position_id",
            sa.Integer(),
            nullable=True,
            comment="면접관 배정 직무 FK",
        ),
    )
    op.add_column(
        "interviewers",
        sa.Column(
            "interview_round",
            sa.String(length=20),
            nullable=True,
            comment="면접관 배정 차수",
        ),
    )
    op.create_index(
        op.f("ix_interviewers_position_id"),
        "interviewers",
        ["position_id"],
        unique=False,
    )
    op.create_foreign_key(
        "interviewers_position_id_fkey",
        "interviewers",
        "positions",
        ["position_id"],
        ["position_id"],
        ondelete="SET NULL",
    )
    op.create_check_constraint(
        "check_interviewer_round_valid",
        "interviewers",
        "interview_round IS NULL OR interview_round IN ('1차', '2차', '3차')",
    )
    op.create_check_constraint(
        "check_interview_slot_round_valid",
        "interview_slots",
        "interview_round IN ('1차', '2차', '3차')",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "check_interview_slot_round_valid",
        "interview_slots",
        type_="check",
    )
    op.drop_constraint(
        "check_interviewer_round_valid",
        "interviewers",
        type_="check",
    )
    op.drop_constraint(
        "interviewers_position_id_fkey",
        "interviewers",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_interviewers_position_id"), table_name="interviewers")
    op.drop_column("interviewers", "interview_round")
    op.drop_column("interviewers", "position_id")
