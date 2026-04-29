from pydantic import BaseModel, Field, field_validator


class InterviewQuestionGenerationInput(BaseModel):
    position_name: str = Field(..., min_length=1, max_length=100)
    question_count: int = Field(default=5, ge=1, le=20)
    additional_request: str | None = Field(default=None, max_length=1000)

    @field_validator("position_name")
    @classmethod
    def strip_position_name(cls, value: str) -> str:
        stripped_value = value.strip()
        if not stripped_value:
            raise ValueError("position_name must not be blank.")

        return stripped_value

    @field_validator("additional_request")
    @classmethod
    def normalize_additional_request(cls, value: str | None) -> str | None:
        if value is None:
            return None

        stripped_value = value.strip()
        return stripped_value or None


class GeneratedQuestion(BaseModel):
    question_text: str = Field(..., min_length=1)


class InterviewQuestionGenerationOutput(BaseModel):
    questions: list[GeneratedQuestion] = Field(..., min_length=1)
