"""Pydantic: ORM `Candidate`와 검증 공통 필드."""

from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ExperienceLevel = Literal["신입", "경력"]
FinalStatus = Literal["진행중", "최종합격", "탈락"]


class CandidateBase(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=2000)
    phone: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    experience_level: ExperienceLevel = "신입"
    final_status: FinalStatus = "진행중"
    meets_preferred_criteria: list[str] = Field(default_factory=list)


class CandidateCreate(CandidateBase):
    position_id: int


class CandidateRead(CandidateBase):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: int
    position_id: int
    application_status: str
