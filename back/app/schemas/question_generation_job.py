from datetime import datetime

from app.schemas.question import CaseModel, GeneratedQuestionResponse


class QuestionGenerationJobCreateResponse(CaseModel):
    job_id: int
    status: str


class QuestionGenerationJobResponse(CaseModel):
    job_id: int
    status: str
    candidate_id: int
    position_id: int | None
    result_questions: list[GeneratedQuestionResponse] | None = None
    error_message: str | None = None
    created_at: datetime
    started_at: datetime | None = None
    finished_at: datetime | None = None
