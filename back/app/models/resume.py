from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.candidate import Candidate
    from app.models.position import Position
    from app.models.military import Military
    from app.models.education import Education
    from app.models.qualification import Qualification
    from app.models.experience import Experience
    from app.models.statement import Statement

class Resume(Base):
    """이력서 테이블"""
    __tablename__ = "resumes"

    resume_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="이력서 기본키 id",
    )
    position_id: Mapped[int] = mapped_column(
        ForeignKey("positions.position_id"),
        nullable=False,
        comment="지원분야 (1지망 직무 FK)",
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.candidate_id"),
        nullable=False,
        comment="지원자 FK",
    )
    desired_location: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
        comment="희망근무지",
    )
    second_position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id"),
        nullable=True,
        comment="2지망 직무 FK",
    )
    desired_salary: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
        comment="희망직급/희망연봉",
    )
    veteran_eligibility: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="보훈여부 (보훈 번호 작성)",
    )
    disability: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="장애여부",
    )
    file_path: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
        comment="원본 이력서 저장 경로",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    # 관계 설정
    candidate: Mapped["Candidate"] = relationship(
        back_populates="resumes",
    )
    position: Mapped["Position"] = relationship(
        foreign_keys=[position_id],
        back_populates="resumes_as_first",
    )
    second_position: Mapped["Position | None"] = relationship(
        foreign_keys=[second_position_id],
        back_populates="resumes_as_second",
    )
    military: Mapped["Military | None"] = relationship(
        back_populates="resume",
        uselist=False,  # 1:1 관계 명시
        cascade="all, delete-orphan",
    )
    educations: Mapped[list["Education"]] = relationship(
        back_populates="resume",
        cascade="all, delete-orphan",
    )
    qualifications: Mapped[list["Qualification"]] = relationship(
        back_populates="resume",
        order_by="Qualification.issue_date.desc()",  # 최신순 정렬
        cascade="all, delete-orphan",
    )
    experiences: Mapped[list["Experience"]] = relationship(
        back_populates="resume",
        order_by="Experience.employment_start_period.desc()",  # 최신 경력 우선
        cascade="all, delete-orphan",
    )
    statements: Mapped[list["Statement"]] = relationship(
        back_populates="resume",
        order_by="Statement.statement_id.asc()",  # 문항 순서대로
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Resume(id={self.resume_id}, "
            f"candidate_id={self.candidate_id}, "
            f"position_id={self.position_id})>"
        )
