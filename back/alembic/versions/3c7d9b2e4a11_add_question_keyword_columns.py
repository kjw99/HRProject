"""add question keyword columns

Revision ID: 3c7d9b2e4a11
Revises: 955d32368288
Create Date: 2026-06-17 12:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "3c7d9b2e4a11"
down_revision: Union[str, Sequence[str], None] = "955d32368288"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "resumes",
        sa.Column(
            "question_keywords",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
            comment="Keywords for interview question generation and reuse",
        ),
    )
    op.add_column(
        "question_generation_jobs",
        sa.Column(
            "generation_keywords",
            sa.JSON(),
            nullable=True,
        ),
    )
    op.add_column(
        "questions",
        sa.Column(
            "question_keywords",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'[]'::jsonb"),
        ),
    )


def downgrade() -> None:
    op.drop_column("questions", "question_keywords")
    op.drop_column("question_generation_jobs", "generation_keywords")
    op.drop_column("resumes", "question_keywords")
