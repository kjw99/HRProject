"""Drop unique constraint on candidates.email.

Revision ID: f2d4a7b9c123
Revises: eca930caef95
Create Date: 2026-05-18 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "f2d4a7b9c123"
down_revision: Union[str, Sequence[str], None] = "eca930caef95"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint("candidates_email_key", "candidates", type_="unique")


def downgrade() -> None:
    """Downgrade schema."""
    op.create_unique_constraint(
        "candidates_email_key",
        "candidates",
        ["email"],
    )
