from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator, model_validator
from datetime import datetime
from typing import Literal
from pydantic.alias_generators import to_camel

# 변수명 카멜케이스 - 스네이크케이스 자동 변환
class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )


class InterviewerCreate(CaseModel):
    interviewer_email: EmailStr
    interviewer_name: str
    position_id: int | None = Field(None, gt=0)
    interview_round: Literal["1차", "2차", "3차"] | None = None

    @field_validator("interviewer_name")
    @classmethod
    def strip_interviewer_name(cls, value: str) -> str:
        name = value.strip()
        if not name:
            raise ValueError("면접관 이름을 입력해주세요.")
        return name


class InterviewerUpdate(CaseModel):
    interviewer_email: EmailStr | None = None
    interviewer_name: str | None = None
    position_id: int | None = Field(None, gt=0)
    interview_round: Literal["1차", "2차", "3차"] | None = None

    @field_validator("interviewer_name")
    @classmethod
    def strip_interviewer_name(cls, value: str | None) -> str | None:
        if value is None:
            return value

        name = value.strip()
        if not name:
            raise ValueError("면접관 이름을 입력해주세요.")
        return name

    @model_validator(mode="after")
    def validate_update_fields(self):
        if not self.model_fields_set:
            raise ValueError("수정할 항목을 하나 이상 입력해주세요.")

        return self


class InterviewerResponse(CaseModel):
    interviewer_id: int
    interviewer_email: EmailStr
    interviewer_name: str
    position_id: int | None
    position_name: str | None = None
    interview_round: str | None
    created_at: datetime


class InterviewerListResponse(CaseModel):
    content: list[InterviewerResponse]
    # page: int
    # size: int
    # total_elements: int
    # total_pages: int
