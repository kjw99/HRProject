from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str

    model_config = {"json_schema_extra": {"examples": [{"detail": "에러 메시지"}]}}