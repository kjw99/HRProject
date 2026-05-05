from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class QuestionGenerateRequest(CaseModel):
    candidate_id: int = Field(..., gt=0)
    position_id: int | None = Field(default=None, gt=0)
    question_count: int = Field(default=5, ge=1, le=20)
    additional_request: str | None = Field(default=None, max_length=1000)
    job_description_section: str | None = Field(default=None, max_length=20)

    @field_validator("additional_request")
    @classmethod
    def normalize_additional_request(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None

    @field_validator("job_description_section")
    @classmethod
    def normalize_job_description_section(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None


class GeneratedQuestionResponse(CaseModel):
    question_text: str
    question_type: str
    evaluation_intent: str
    generation_basis: str


class QuestionSaveItem(CaseModel):
    question_text: str = Field(..., min_length=1, max_length=1000)
    question_type: str | None = Field(default=None, max_length=30)
    evaluation_intent: str | None = Field(default=None, max_length=2000)
    generation_basis: str | None = Field(default=None, max_length=2000)

    @field_validator("question_text")
    @classmethod
    def normalize_question_text(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("question_text must not be blank.")

        return stripped_value

    @field_validator("question_type")
    @classmethod
    def normalize_question_type(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None

    @field_validator("evaluation_intent", "generation_basis")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None


class QuestionSaveRequest(CaseModel):
    position_id: int | None = Field(default=None, gt=0)
    candidate_id: int | None = Field(default=None, gt=0)
    question_type: str | None = Field(default=None, max_length=30)
    questions: list[QuestionSaveItem] = Field(..., min_length=1, max_length=20)

    @field_validator("question_type")
    @classmethod
    def normalize_question_type(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None

    @model_validator(mode="after")
    def validate_target(self) -> "QuestionSaveRequest":
        if self.position_id is None and self.candidate_id is None:
            raise ValueError("position_id or candidate_id is required.")

        return self


class QuestionResponse(CaseModel):
    question_id: int
    candidate_id: int | None
    position_id: int | None
    question_text: str
    question_type: str
    evaluation_intent: str | None
    generation_basis: str | None
    created_at: datetime
