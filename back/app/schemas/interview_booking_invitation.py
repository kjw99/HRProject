from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class InterviewBookingInvitationCreate(CaseModel):
    candidate_id: int = Field(..., gt=0)
    expires_at: datetime | None = None
    slot_ids: list[int] = Field(default_factory=list)

    @field_validator("expires_at")
    @classmethod
    def validate_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("만료 시각은 시간대 정보를 포함해야 합니다.")

        return value

    @field_validator("slot_ids")
    @classmethod
    def validate_slot_ids(cls, value: list[int]) -> list[int]:
        if any(slot_id <= 0 for slot_id in value):
            raise ValueError("면접 슬롯 id는 1 이상의 정수여야 합니다.")

        if len(value) != len(set(value)):
            raise ValueError("면접 슬롯 id는 중복될 수 없습니다.")

        return value


class InterviewBookingInvitationCreateResponse(CaseModel):
    invitation_id: int
    candidate_id: int
    slot_ids: list[int]
    invitation_url: str
    expires_at: datetime
    created_at: datetime


class InterviewBookingInvitationTokenBookingCreate(CaseModel):
    slot_id: int = Field(..., gt=0)
