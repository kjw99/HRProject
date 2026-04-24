from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.resume import Resume

class Experience(Base):
    """경력사항 테이블"""
    __tablename__ = "experiences"
    
    __table_args__ = (
        CheckConstraint(
            "employment_end_period >= employment_start_period",
            name="check_employment_period_valid",
        ),
        CheckConstraint(
            "salary >= 0",
            name="check_salary_non_negative",
        ),
    )

    experience_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="경력사항 테이블 기본키 id",
    )
    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.resume_id", ondelete="CASCADE"),
        nullable=False,
        comment="이력서 FK",
    )
    company: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="회사명",
    )
    role: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
        comment="근무부서 / 담당업무",
    )
    job_title: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="직위",
    )
    salary: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="연봉 (단위: 원)",
    )
    reason_for_leaving: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="퇴직사유",
    )
    employment_start_period: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="근무기간 시작일",
    )
    employment_end_period: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="근무기간 종료일",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    resume: Mapped["Resume"] = relationship(
        back_populates="experiences",
    )

    def __repr__(self) -> str:
        return (
            f"<Experience(id={self.experience_id}, "
            f"resume_id={self.resume_id}, "
            f"company={self.company})>"
        )