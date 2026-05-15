from datetime import datetime

from pydantic import BaseModel, Field, model_validator


MailTemplateVariables = dict[str, str | int | float | bool | None]


class InterviewerMailSendRequest(BaseModel):
    subject: str | None = Field(default=None, min_length=1)
    content: str | None = Field(default=None, min_length=1)
    template_id: int | None = Field(default=None, gt=0)
    template_variables: MailTemplateVariables = Field(default_factory=dict)
    expires_in_days: int = Field(default=7, ge=1, le=30)

    @model_validator(mode="after")
    def validate_mail_source(self):
        if self.template_id is None and (self.subject is None or self.content is None):
            raise ValueError("Either template_id or both subject and content are required.")

        return self


class InterviewerMailSendResponse(BaseModel):
    message: str
    invite_url: str
    expires_at: datetime
