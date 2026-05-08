from pydantic import BaseModel, EmailStr, ConfigDict
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


class InterviewerUpdate(CaseModel):
    interviewer_email: EmailStr | None = None
    interviewer_name: str | None = None


class InterviewerResponse(CaseModel):
    interviewer_id: int
    interviewer_email: EmailStr
    interviewer_name: str
    created_at: datetime


class InterviewerListResponse(CaseModel):
    content: list[InterviewerResponse]
    # page: int
    # size: int
    # total_elements: int
    # total_pages: int