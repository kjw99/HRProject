"""add raw_token to interviewer_invites for invite reuse

Revision ID: a7e4b2c91d03
Revises: 8f2a6c9d1b34
Create Date: 2026-05-15 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a7e4b2c91d03"
down_revision: Union[str, Sequence[str], None] = "8f2a6c9d1b34"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "interviewer_invites",
        sa.Column("raw_token", sa.String(length=256), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("interviewer_invites", "raw_token")
