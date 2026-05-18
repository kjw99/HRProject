"""merge multiple heads into single head

Revision ID: 955d32368288
Revises: a7e4b2c91d03, c8f1a2b3d4e5, f2d4a7b9c123
Create Date: 2026-05-18 17:35:07.735766

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '955d32368288'
down_revision: Union[str, Sequence[str], None] = ('a7e4b2c91d03', 'c8f1a2b3d4e5', 'f2d4a7b9c123')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
