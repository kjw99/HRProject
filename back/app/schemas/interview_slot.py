from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


InterviewRound = Literal["1차", "2차", "3차"]
SlotStatus = Literal["open", "full", "closed"]


class InterviewSlotCreate(CaseModel):
    position_id: int = Field(..., gt=0)
    interview_round: InterviewRound
    interviewer_ids: list[int] = Field(default_factory=list)
    interview_date: date
    interview_start_time: time
    interview_end_time: time
    interview_location: str = Field(..., min_length=1, max_length=255)
    capacity: int = Field(..., ge=1)

    @field_validator("interview_start_time", "interview_end_time")
    @classmethod
    def validate_plain_time(cls, value: time) -> time:
        if value.tzinfo is not None and value.utcoffset() is not None:
            raise ValueError("면접 시간은 시간대 없이 HH:MM 형식으로 입력해주세요.")

        return value

    @field_validator("interviewer_ids")
    @classmethod
    def validate_interviewer_ids(cls, value: list[int]) -> list[int]:
        if any(interviewer_id <= 0 for interviewer_id in value):
            raise ValueError("면접관 id는 1 이상의 정수여야 합니다.")

        if len(value) != len(set(value)):
            raise ValueError("면접관 id는 중복될 수 없습니다.")

        return value

    @field_validator("interview_location")
    @classmethod
    def strip_interview_location(cls, value: str) -> str:
        location = value.strip()
        if not location:
            raise ValueError("면접 장소를 입력해주세요.")

        return location

    @model_validator(mode="after")
    def validate_time_order(self):
        if self.interview_start_time >= self.interview_end_time:
            raise ValueError("면접 시작 시간은 종료 시간보다 빨라야 합니다.")

        return self


class InterviewSlotBatchCreate(CaseModel):
    slots: list[InterviewSlotCreate] = Field(..., min_length=1)


class InterviewSlotUpdate(CaseModel):
    position_id: int | None = Field(None, gt=0)
    interview_round: InterviewRound | None = None
    interviewer_ids: list[int] | None = None
    interview_date: date | None = None
    interview_start_time: time | None = None
    interview_end_time: time | None = None
    interview_location: str | None = Field(None, min_length=1, max_length=255)
    capacity: int | None = Field(None, ge=1)

    @field_validator("interview_start_time", "interview_end_time")
    @classmethod
    def validate_plain_time(cls, value: time | None) -> time | None:
        if value is None:
            return value

        if value.tzinfo is not None and value.utcoffset() is not None:
            raise ValueError("면접 시간은 시간대 없이 HH:MM 형식으로 입력해주세요.")

        return value

    @field_validator("interviewer_ids")
    @classmethod
    def validate_interviewer_ids(cls, value: list[int] | None) -> list[int] | None:
        if value is None:
            return value

        if any(interviewer_id <= 0 for interviewer_id in value):
            raise ValueError("면접관 id는 1 이상의 정수여야 합니다.")

        if len(value) != len(set(value)):
            raise ValueError("면접관 id는 중복될 수 없습니다.")

        return value

    @field_validator("interview_location")
    @classmethod
    def strip_interview_location(cls, value: str | None) -> str | None:
        if value is None:
            return value

        location = value.strip()
        if not location:
            raise ValueError("면접 장소를 입력해주세요.")

        return location

    @model_validator(mode="after")
    def validate_update_fields(self):
        if not self.model_fields_set:
            raise ValueError("수정할 항목을 하나 이상 입력해주세요.")

        return self


class InterviewSlotResponse(CaseModel):
    slot_id: int
    position_id: int | None
    interview_round: str
    interviewer_ids: list[int]
    interview_starts_at: datetime
    interview_ends_at: datetime
    booking_deadline_at: datetime | None
    interview_location: str | None
    capacity: int
    slot_status: SlotStatus
    created_at: datetime


class InterviewSlotListItemResponse(CaseModel):
    slot_id: int
    position_name: str | None
    interviewer_names: list[str]
    interview_round: str
    interview_starts_at: datetime
    interview_ends_at: datetime
    slot_status: SlotStatus
    interview_location: str | None


class InterviewSlotDetailResponse(CaseModel):
    slot_id: int
    position_name: str | None
    interviewer_names: list[str]
    booked_candidate_names: list[str]
    interview_round: str
    interview_starts_at: datetime
    interview_ends_at: datetime
    booking_deadline_at: datetime | None
    remaining_capacity: int
    slot_status: SlotStatus
    interview_location: str | None
