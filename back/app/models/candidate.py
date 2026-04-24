from datetime import datetime, date
from sqlalchemy import String, DateTime, func, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.dependencies.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.position import Position
    from app.models.resume import Resume
    from app.models.question import Question
    from app.models.interview_booking import InterviewBooking

class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="지원자 기본키 id",
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id"),
        nullable=True,
        comment="직무명 (positions 테이블 FK)",
    )
    name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="이름",
    )
    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="생년월일",
    )
    gender: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
        comment="성별",
    )
    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="현주소",
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="휴대폰",
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
        comment="이메일",
    )
    application_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="지원단계 (서류, 1차, 2차 등)",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="생성일",
    )

    position: Mapped["Position | None"] = relationship(
        back_populates="candidates",
    )

    resumes: Mapped[list["Resume"]] = relationship(
        back_populates="candidate",
        cascade="all, delete-orphan",
    )
    questions: Mapped[list["Question"]] = relationship(
        back_populates="candidate",
        # cascade 설정하지 않음 (질문 데이터는 보존)
    )
    booking: Mapped["InterviewBooking | None"] = relationship(
        back_populates="candidate",
        uselist=False,
    )

    def __repr__(self) -> str:
        return (
            f"<Candidate(id={self.candidate_id}, "
            f"name={self.name}, "
            f"status={self.application_status})>"
        )