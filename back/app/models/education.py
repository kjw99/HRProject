from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, Date, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.resume import Resume

class Education(Base):
    """학력사항 테이블"""
    __tablename__ = "educations"
    
    __table_args__ = (
        CheckConstraint(
            "attendance_end_period >= attendance_start_period",
            name="check_attendance_period_valid",
        ),
    )

    education_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="학력사항 테이블 기본키 id",
    )
    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.resume_id", ondelete="CASCADE"),
        nullable=False,
        comment="이력서 FK",
    )
    school_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="학교명",
    )
    department: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="전공",
    )
    completion_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="학력 구분 (고등학교, 대학교, 대학원 등)",
    )
    attendance_start_period: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="재학기간 시작일",
    )
    attendance_end_period: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="재학기간 종료일",
    )
    location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="소재지",
    )
    grade: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="학점",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    resume: Mapped["Resume"] = relationship(
        back_populates="educations",
    )

    def __repr__(self) -> str:
        return (
            f"<Education(id={self.education_id}, "
            f"resume_id={self.resume_id}, "
            f"university={self.school_name})>"
        )