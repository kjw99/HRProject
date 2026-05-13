"""add interviewer invites and question authors

Revision ID: 4f3c2a1d9b77
Revises: 2d6b8c4a91f2
Create Date: 2026-05-13 10:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4f3c2a1d9b77"
down_revision: Union[str, Sequence[str], None] = "2d6b8c4a91f2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interviewer_invites",
        sa.Column("invite_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("interviewer_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["created_by_user_id"],
            ["users.user_id"],
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["interviewer_id"],
            ["interviewers.interviewer_id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("invite_id"),
    )
    op.create_index(
        op.f("ix_interviewer_invites_interviewer_id"),
        "interviewer_invites",
        ["interviewer_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_interviewer_invites_created_by_user_id"),
        "interviewer_invites",
        ["created_by_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_interviewer_invites_token_hash"),
        "interviewer_invites",
        ["token_hash"],
        unique=True,
    )

    op.add_column(
        "questions",
        sa.Column("created_by_user_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "questions",
        sa.Column("created_by_interviewer_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "questions_created_by_user_id_fkey",
        "questions",
        "users",
        ["created_by_user_id"],
        ["user_id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "questions_created_by_interviewer_id_fkey",
        "questions",
        "interviewers",
        ["created_by_interviewer_id"],
        ["interviewer_id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint(
        "questions_created_by_interviewer_id_fkey",
        "questions",
        type_="foreignkey",
    )
    op.drop_constraint(
        "questions_created_by_user_id_fkey",
        "questions",
        type_="foreignkey",
    )
    op.drop_column("questions", "created_by_interviewer_id")
    op.drop_column("questions", "created_by_user_id")

    op.drop_index(op.f("ix_interviewer_invites_token_hash"), table_name="interviewer_invites")
    op.drop_index(op.f("ix_interviewer_invites_created_by_user_id"), table_name="interviewer_invites")
    op.drop_index(op.f("ix_interviewer_invites_interviewer_id"), table_name="interviewer_invites")
    op.drop_table("interviewer_invites")
