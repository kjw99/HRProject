"""Add allowed slot ids to interview booking invitations.

Revision ID: c8f1a2b3d4e5
Revises: 4f3c2a1d9b77
Create Date: 2026-05-14 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c8f1a2b3d4e5"
down_revision: Union[str, Sequence[str], None] = "4f3c2a1d9b77"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "interview_booking_invitations",
        sa.Column(
            "allowed_slot_ids",
            sa.JSON(),
            nullable=True,
            comment="초대 링크로 선택 가능한 면접 슬롯 id 목록",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("interview_booking_invitations", "allowed_slot_ids")
