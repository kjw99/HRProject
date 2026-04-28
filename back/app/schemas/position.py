from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class PositionCreate(CaseModel):
    position_name: str = Field(..., min_length=1, max_length=100)


class PositionUpdate(CaseModel):
    position_name: str | None = Field(None, min_length=1, max_length=100)

    @model_validator(mode="after")
    def validate_update_fields(self):
        if not self.model_fields_set:
            raise ValueError("수정할 항목을 입력해주세요.")

        for field_name in self.model_fields_set:
            if getattr(self, field_name) is None:
                raise ValueError("수정할 항목은 null일 수 없습니다.")

        return self


class PositionResponse(CaseModel):
    position_id: int
    position_name: str
    created_at: datetime
