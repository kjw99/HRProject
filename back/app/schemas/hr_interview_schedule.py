from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


AttendanceStatus = Literal["응시 전", "응시 중", "응시 완료"]


class TodayInterviewScheduleItemResponse(CaseModel):
    slot_id: int
    booking_id: int
    candidate_id: int
    interview_starts_at: datetime
    interview_ends_at: datetime
    interview_time_label: str
    candidate_name: str
    position_name: str | None
    interview_round: str
    attendance_status: AttendanceStatus


class TodayInterviewScheduleListResponse(CaseModel):
    items: list[TodayInterviewScheduleItemResponse]
