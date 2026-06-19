"""create mail delivery logs

Revision ID: 7f4d2c8a1b90
Revises: 3c7d9b2e4a11
Create Date: 2026-06-19 12:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f4d2c8a1b90"
down_revision: Union[str, Sequence[str], None] = "3c7d9b2e4a11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "mail_delivery_logs",
        sa.Column("mail_log_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("mail_type", sa.String(length=30), nullable=False),
        sa.Column("related_entity_id", sa.Integer(), nullable=False),
        sa.Column("recipient_email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("attempt_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("queued_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "mail_type IN ('candidate', 'interviewer')",
            name="check_mail_delivery_logs_type_valid",
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'sent', 'failed')",
            name="check_mail_delivery_logs_status_valid",
        ),
        sa.PrimaryKeyConstraint("mail_log_id"),
    )
    op.create_index(
        op.f("ix_mail_delivery_logs_mail_type"),
        "mail_delivery_logs",
        ["mail_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_mail_delivery_logs_related_entity_id"),
        "mail_delivery_logs",
        ["related_entity_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_mail_delivery_logs_status"),
        "mail_delivery_logs",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_mail_delivery_logs_status"), table_name="mail_delivery_logs")
    op.drop_index(op.f("ix_mail_delivery_logs_related_entity_id"), table_name="mail_delivery_logs")
    op.drop_index(op.f("ix_mail_delivery_logs_mail_type"), table_name="mail_delivery_logs")
    op.drop_table("mail_delivery_logs")
