from pydantic import BaseModel, ConfigDict, Field, field_validator


class PreferredCriteriaMatchOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    meets_preferred_criteria: list[str] = Field(default_factory=list)

    @field_validator("meets_preferred_criteria", mode="before")
    @classmethod
    def normalize_criteria(cls, value: object) -> list[str]:
        if value is None:
            return []

        if not isinstance(value, list):
            return []

        criteria: list[str] = []
        seen: set[str] = set()
        for item in value:
            text = str(item).strip()
            if not text:
                continue

            key = text.casefold()
            if key in seen:
                continue

            seen.add(key)
            criteria.append(text[:200])

        return criteria
