from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.resume import Resume


class Military(Base):
    """병역사항 테이블"""
    __tablename__ = "military"

    military_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="병역사항 테이블 기본키 id",
    )
    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.resume_id", ondelete="CASCADE"),
        nullable=False,
        comment="이력서 FK",
    )
    military_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="병역구분 (미필, 면제, 복무완료 등)",
    )
    military_service: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="군별 (육군, 해군, 공군, 해병대 등)",
    )
    military_start_period: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="복무 기간 시작일",
    )
    military_end_period: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="복무 기간 종료일",
    )
    military_rank: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="계급",
    )
    exemption_reason: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="면제 사유",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    resume: Mapped["Resume"] = relationship(
        back_populates="military",
    )

    def __repr__(self) -> str:
        return (
            f"<Military(id={self.military_id}, "
            f"resume_id={self.resume_id}, "
            f"type={self.military_type})>"
        )