from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class CandidateBase(BaseModel):
    position_id: int | None = None
    name: str | None = Field(default=None, max_length=255)
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=2000)
    phone: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    experience_level: str = "신입"
    final_status: str = "진행중"
    meets_preferred_criteria: list[str] = Field(default_factory=list)


class CandidateCreate(CandidateBase):
    position_id: int
    application_status: str


class CandidateRead(CandidateBase):
    model_config = ConfigDict(from_attributes=True)

    candidate_id: int
    position_id: int | None
    application_status: str
    position_name: str | None = None


class CandidateInvitationHistoryRead(BaseModel):
    invitation_id: int
    candidate_id: int
    slot_ids: list[int] = Field(default_factory=list)
    expires_at: datetime | None = None
    created_at: datetime | None = None
    revoked_at: datetime | None = None


class CandidateBookingRead(BaseModel):
    booking_id: int
    candidate_id: int
    slot_id: int
    interview_round: str | None = None
    interview_starts_at: datetime | None = None
    interview_ends_at: datetime | None = None
    interview_location: str | None = None
    position_name: str | None = None
    created_at: datetime | None = None
    cancelled_at: datetime | None = None


class CandidateDetailRead(CandidateRead):
    position_name: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    current_booking: CandidateBookingRead | None = None
    booking_invitations: list[CandidateInvitationHistoryRead] = Field(
        default_factory=list
    )


class CandidateUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    date_of_birth: date | None = None
    gender: str | None = Field(None, max_length=100)
    address: str | None = Field(None, max_length=2000)
    phone: str | None = Field(None, max_length=100)
    email: str | None = Field(None, max_length=255)
    experience_level: str | None = None
    application_status: str | None = None
    final_status: str | None = None
    meets_preferred_criteria: list[str] | None = None
