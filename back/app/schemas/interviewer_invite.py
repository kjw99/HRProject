from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class InterviewerInviteCreateRequest(CaseModel):
    interviewer_id: int = Field(..., gt=0)
    expires_in_days: int = Field(default=7, ge=1, le=30)


class InterviewerInviteCreateResponse(CaseModel):
    invite_id: int
    interviewer_id: int
    expires_at: datetime
    invite_url: str


class InterviewerInviteAcceptRequest(CaseModel):
    token: str = Field(..., min_length=1)


class InterviewerAuthInfo(CaseModel):
    interviewer_id: int
    interviewer_email: str
    interviewer_name: str
    position_id: int | None
    interview_round: str | None


class InterviewerTokenResponse(CaseModel):
    access_token: str
    token_type: str = "bearer"
    interviewer: InterviewerAuthInfo
