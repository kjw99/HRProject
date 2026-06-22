"""Add mail idempotency fields.

Revision ID: 6a4d8b7c2f11
Revises: f2d4a7b9c123
Create Date: 2026-06-21 15:10:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6a4d8b7c2f11"
down_revision: Union[str, Sequence[str], None] = "7f4d2c8a1b90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "mail_delivery_logs",
        sa.Column("idempotency_key", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "mail_delivery_logs",
        sa.Column("request_hash", sa.String(length=64), nullable=True),
    )
    op.create_index(
        op.f("ix_mail_delivery_logs_idempotency_key"),
        "mail_delivery_logs",
        ["idempotency_key"],
        unique=False,
    )
    op.create_unique_constraint(
        "uq_mail_delivery_logs_idempotency_key",
        "mail_delivery_logs",
        ["mail_type", "related_entity_id", "idempotency_key"],
    )

    op.add_column(
        "interview_booking_invitations",
        sa.Column("raw_token", sa.String(length=256), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("interview_booking_invitations", "raw_token")

    op.drop_constraint(
        "uq_mail_delivery_logs_idempotency_key",
        "mail_delivery_logs",
        type_="unique",
    )
    op.drop_index(
        op.f("ix_mail_delivery_logs_idempotency_key"),
        table_name="mail_delivery_logs",
    )
    op.drop_column("mail_delivery_logs", "request_hash")
    op.drop_column("mail_delivery_logs", "idempotency_key")
