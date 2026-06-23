"""Add outbox events and processing mail status.

Revision ID: b8f9c2d4e6a1
Revises: 6a4d8b7c2f11
Create Date: 2026-06-23 16:40:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b8f9c2d4e6a1"
down_revision: Union[str, Sequence[str], None] = "6a4d8b7c2f11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        "check_mail_delivery_logs_status_valid",
        "mail_delivery_logs",
        type_="check",
    )
    op.create_check_constraint(
        "check_mail_delivery_logs_status_valid",
        "mail_delivery_logs",
        "status IN ('pending', 'processing', 'sent', 'failed')",
    )

    op.create_table(
        "outbox_events",
        sa.Column("event_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("aggregate_type", sa.String(length=50), nullable=False),
        sa.Column("aggregate_id", sa.Integer(), nullable=False),
        sa.Column("channel", sa.String(length=20), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("retry_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column(
            "next_retry_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "channel IN ('email', 'sms', 'kakao')",
            name="check_outbox_events_channel_valid",
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'published')",
            name="check_outbox_events_status_valid",
        ),
        sa.PrimaryKeyConstraint("event_id"),
    )
    op.create_index(op.f("ix_outbox_events_aggregate_type"), "outbox_events", ["aggregate_type"], unique=False)
    op.create_index(op.f("ix_outbox_events_aggregate_id"), "outbox_events", ["aggregate_id"], unique=False)
    op.create_index(op.f("ix_outbox_events_channel"), "outbox_events", ["channel"], unique=False)
    op.create_index(op.f("ix_outbox_events_event_type"), "outbox_events", ["event_type"], unique=False)
    op.create_index(op.f("ix_outbox_events_next_retry_at"), "outbox_events", ["next_retry_at"], unique=False)
    op.create_index(op.f("ix_outbox_events_status"), "outbox_events", ["status"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_outbox_events_status"), table_name="outbox_events")
    op.drop_index(op.f("ix_outbox_events_next_retry_at"), table_name="outbox_events")
    op.drop_index(op.f("ix_outbox_events_event_type"), table_name="outbox_events")
    op.drop_index(op.f("ix_outbox_events_channel"), table_name="outbox_events")
    op.drop_index(op.f("ix_outbox_events_aggregate_id"), table_name="outbox_events")
    op.drop_index(op.f("ix_outbox_events_aggregate_type"), table_name="outbox_events")
    op.drop_table("outbox_events")

    op.drop_constraint(
        "check_mail_delivery_logs_status_valid",
        "mail_delivery_logs",
        type_="check",
    )
    op.create_check_constraint(
        "check_mail_delivery_logs_status_valid",
        "mail_delivery_logs",
        "status IN ('pending', 'sent', 'failed')",
    )
