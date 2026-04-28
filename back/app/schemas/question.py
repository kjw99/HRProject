from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class QuestionGenerateRequest(CaseModel):
    position_id: int = Field(..., gt=0)
    question_count: int = Field(default=5, ge=1, le=20)
    additional_request: str | None = Field(default=None, max_length=1000)

    @field_validator("additional_request")
    @classmethod
    def normalize_additional_request(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None


class GeneratedQuestionResponse(CaseModel):
    question_text: str
    question_type: str


class QuestionSaveItem(CaseModel):
    question_text: str = Field(..., min_length=1, max_length=1000)

    @field_validator("question_text")
    @classmethod
    def normalize_question_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("question_text must not be blank.")

        return stripped_value


class QuestionSaveRequest(CaseModel):
    position_id: int = Field(..., gt=0)
    questions: list[QuestionSaveItem] = Field(..., min_length=1, max_length=20)


class QuestionResponse(CaseModel):
    question_id: int
    candidate_id: int | None
    position_id: int | None
    question_text: str
    question_type: str
    created_at: datetime
