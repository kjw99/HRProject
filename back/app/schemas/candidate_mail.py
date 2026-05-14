from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator


MailTemplateVariables = dict[str, str | int | float | bool | None]


class CandidateMailSendRequest(BaseModel):
    subject: str | None = Field(default=None, min_length=1)
    content: str | None = Field(default=None, min_length=1)
    template_id: int | None = Field(default=None, gt=0)
    template_variables: MailTemplateVariables = Field(default_factory=dict)
    expires_at: datetime | None = None

    @model_validator(mode="after")
    def validate_mail_source(self):
        if self.template_id is None and (self.subject is None or self.content is None):
            raise ValueError("Either template_id or both subject and content are required.")

        return self

    @field_validator("expires_at")
    @classmethod
    def validate_timezone(cls, value: datetime | None) -> datetime | None:
        if value is not None and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("expires_at must include timezone information.")

        return value


class CandidateMailSendResponse(BaseModel):
    message: str
    invitation_url: str
    expires_at: datetime
