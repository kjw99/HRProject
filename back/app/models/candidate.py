from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.dependencies.database import Base

if TYPE_CHECKING:
    from app.models.interview_booking import InterviewBooking
    from app.models.position import Position
    from app.models.question import Question
    from app.models.resume import Resume


class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        comment="Candidate primary key",
    )
    position_id: Mapped[int | None] = mapped_column(
        ForeignKey("positions.position_id"),
        nullable=True,
        comment="Position foreign key",
    )
    name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        comment="Name",
    )
    date_of_birth: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        comment="Date of birth",
    )
    gender: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
        comment="Gender",
    )
    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        comment="Address",
    )
    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="Phone",
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
        comment="Email",
    )
    application_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Application status",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Created timestamp",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Updated timestamp",
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
