"""Update candidate, resume, and interview table schema.

Revision ID: eca930caef95
Revises: 73744f572cf6
Create Date: 2026-05-07 21:49:42.739049

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "eca930caef95"
down_revision: Union[str, Sequence[str], None] = "73744f572cf6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "candidates",
        sa.Column(
            "experience_level",
            sa.String(length=20),
            server_default="신입",
            nullable=False,
            comment="Experience level",
        ),
    )
    op.add_column(
        "candidates",
        sa.Column(
            "final_status",
            sa.String(length=20),
            server_default="진행중",
            nullable=False,
            comment="Final status",
        ),
    )
    op.add_column(
        "candidates",
        sa.Column(
            "meets_preferred_criteria",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
            comment="Matched preferred criteria",
        ),
    )

    op.drop_constraint(
        "check_booking_status_valid",
        "interview_bookings",
        type_="check",
    )
    op.drop_constraint(
        "check_cancelled_at_consistency",
        "interview_bookings",
        type_="check",
    )
    op.drop_column("interview_bookings", "booking_status")

    op.add_column(
        "interview_slots",
        sa.Column(
            "interview_location",
            sa.String(length=255),
            nullable=True,
            comment="면접 장소",
        ),
    )

    op.drop_constraint(
        "resumes_second_position_id_fkey",
        "resumes",
        type_="foreignkey",
    )
    op.drop_column("resumes", "second_position_id")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "resumes",
        sa.Column(
            "second_position_id",
            sa.Integer(),
            nullable=True,
            comment="2지망 직무 FK",
        ),
    )
    op.create_foreign_key(
        "resumes_second_position_id_fkey",
        "resumes",
        "positions",
        ["second_position_id"],
        ["position_id"],
    )

    op.drop_column("interview_slots", "interview_location")

    op.add_column(
        "interview_bookings",
        sa.Column(
            "booking_status",
            sa.String(length=20),
            nullable=True,
            comment="예약 상태 (booked/cancelled)",
        ),
    )
    op.execute(
        """
        UPDATE interview_bookings
        SET booking_status = CASE
            WHEN cancelled_at IS NULL THEN 'booked'
            ELSE 'cancelled'
        END
        """
    )
    op.alter_column("interview_bookings", "booking_status", nullable=False)
    op.create_check_constraint(
        "check_booking_status_valid",
        "interview_bookings",
        "booking_status IN ('booked', 'cancelled')",
    )
    op.create_check_constraint(
        "check_cancelled_at_consistency",
        "interview_bookings",
        "(booking_status = 'cancelled' AND cancelled_at IS NOT NULL) OR "
        "(booking_status = 'booked' AND cancelled_at IS NULL)",
    )

    op.drop_column("candidates", "meets_preferred_criteria")
    op.drop_column("candidates", "final_status")
    op.drop_column("candidates", "experience_level")
