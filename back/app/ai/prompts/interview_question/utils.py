import json
from typing import Any

from pydantic import BaseModel


def optional_text(value: str | None) -> str:
    if not value:
        return "제공된 정보 없음."

    return value.strip() or "제공된 정보 없음."


def model_to_json(value: Any) -> str:
    if isinstance(value, BaseModel):
        value = value.model_dump()
    elif isinstance(value, list):
        value = [
            item.model_dump() if isinstance(item, BaseModel) else item
            for item in value
        ]

    return json.dumps(value, ensure_ascii=False, indent=2, default=str)


def optional_list(values: list[str]) -> str:
    normalized_values = [str(value).strip() for value in values if str(value).strip()]
    if not normalized_values:
        return "?쒓났???뺣낫 ?놁쓬."

    return "\n".join(f"- {value}" for value in normalized_values)
