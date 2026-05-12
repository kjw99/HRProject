"""Create interview booking invitations.

Revision ID: 9b2a8fd4c1e6
Revises: 1ea60f2b6109
Create Date: 2026-05-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9b2a8fd4c1e6"
down_revision: Union[str, Sequence[str], None] = "1ea60f2b6109"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "interview_booking_invitations",
        sa.Column(
            "invitation_id",
            sa.Integer(),
            autoincrement=True,
            nullable=False,
            comment="면접 예약 초대 기본키 id",
        ),
        sa.Column(
            "candidate_id",
            sa.Integer(),
            nullable=False,
            comment="초대 대상 지원자 FK",
        ),
        sa.Column(
            "token_hash",
            sa.String(length=64),
            nullable=False,
            comment="초대 링크 토큰 SHA-256 해시",
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
            comment="초대 링크 만료 시각",
        ),
        sa.Column(
            "revoked_at",
            sa.DateTime(timezone=True),
            nullable=True,
            comment="초대 링크 폐기 시각",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
            comment="초대 링크 생성 시각",
        ),
        sa.ForeignKeyConstraint(
            ["candidate_id"],
            ["candidates.candidate_id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("invitation_id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        op.f("ix_interview_booking_invitations_candidate_id"),
        "interview_booking_invitations",
        ["candidate_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_interview_booking_invitations_expires_at"),
        "interview_booking_invitations",
        ["expires_at"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_interview_booking_invitations_expires_at"),
        table_name="interview_booking_invitations",
    )
    op.drop_index(
        op.f("ix_interview_booking_invitations_candidate_id"),
        table_name="interview_booking_invitations",
    )
    op.drop_table("interview_booking_invitations")
