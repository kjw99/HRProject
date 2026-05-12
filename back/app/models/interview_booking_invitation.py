from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.candidate import Candidate


class InterviewBookingInvitation(Base):
    """면접 예약 초대 링크 테이블"""

    __tablename__ = "interview_booking_invitations"

    invitation_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="면접 예약 초대 기본키 id",
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.candidate_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="초대 대상 지원자 FK",
    )
    token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
        comment="초대 링크 토큰 SHA-256 해시",
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        comment="초대 링크 만료 시각",
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="초대 링크 폐기 시각",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="초대 링크 생성 시각",
    )

    candidate: Mapped["Candidate"] = relationship(
        back_populates="booking_invitations",
    )

    def __repr__(self) -> str:
        return (
            f"<InterviewBookingInvitation(id={self.invitation_id}, "
            f"candidate_id={self.candidate_id}, "
            f"expires_at={self.expires_at}, "
            f"revoked_at={self.revoked_at})>"
        )
