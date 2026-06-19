from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class MailDeliveryLogResponse(CaseModel):
    mail_log_id: int
    mail_type: str
    related_entity_id: int
    recipient_email: str
    subject: str
    body: str
    status: str
    attempt_count: int
    error_message: str | None
    queued_at: datetime
    sent_at: datetime | None
    created_at: datetime
    updated_at: datetime
