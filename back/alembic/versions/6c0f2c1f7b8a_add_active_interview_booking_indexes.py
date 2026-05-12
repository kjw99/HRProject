"""Add active interview booking indexes.

Revision ID: 6c0f2c1f7b8a
Revises: eca930caef95
Create Date: 2026-05-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6c0f2c1f7b8a"
down_revision: Union[str, Sequence[str], None] = "eca930caef95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(
        "uq_active_interview_booking_candidate",
        "interview_bookings",
        ["candidate_id"],
        unique=True,
        postgresql_where=sa.text("cancelled_at IS NULL"),
    )
    op.create_index(
        "ix_interview_bookings_active_slot",
        "interview_bookings",
        ["slot_id"],
        postgresql_where=sa.text("cancelled_at IS NULL"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        "ix_interview_bookings_active_slot",
        table_name="interview_bookings",
    )
    op.drop_index(
        "uq_active_interview_booking_candidate",
        table_name="interview_bookings",
    )
