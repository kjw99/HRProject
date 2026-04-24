from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.resume import Resume

class Qualification(Base):
    """자격사항 테이블"""
    __tablename__ = "qualifications"

    qualification_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="자격사항 테이블 기본키 id",
    )
    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.resume_id", ondelete="CASCADE"),
        nullable=False,
        comment="이력서 FK",
    )
    certificate: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="자격증 명",
    )
    organization: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="발행처",
    )
    issue_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="취득년월",
    )
    certificate_number: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="자격인증번호",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    resume: Mapped["Resume"] = relationship(
        back_populates="qualifications",
    )

    def __repr__(self) -> str:
        return (
            f"<Qualification(id={self.qualification_id}, "
            f"resume_id={self.resume_id}, "
            f"certificate={self.certificate})>"
        )