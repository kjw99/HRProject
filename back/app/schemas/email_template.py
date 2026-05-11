from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel


class CaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class EmailTemplateCreate(CaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    subject: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)


class EmailTemplateUpdate(CaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    subject: str | None = Field(None, min_length=1, max_length=255)
    body: str | None = Field(None, min_length=1)

    @model_validator(mode="after")
    def validate_update_fields(self):
        if not self.model_fields_set:
            raise ValueError("Update field is required.")

        for field_name in self.model_fields_set:
            if getattr(self, field_name) is None:
                raise ValueError("Update field cannot be null.")

        return self


class EmailTemplateResponse(CaseModel):
    id: int
    name: str
    subject: str
    body: str


class EmailTemplateRenderRequest(CaseModel):
    variables: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class EmailTemplateRenderResponse(CaseModel):
    subject: str
    body: str
