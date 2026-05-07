import re
from datetime import date
from typing import Any

from app.ai.schemas.resume_parsing import MoneyValue, ParsedResumeJson, ResumeAIProfile


EMPTY_VALUE_MARKERS = {
    "-",
    "n/a",
    "na",
    "none",
    "null",
    "unknown",
    "notprovided",
    "없음",
    "미기재",
    "해당없음",
    "무",
    "알수없음",
    "확인필요",
}
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ResumeValueNormalizerService:
    def clean(self, value: object) -> str | None:
        if value is None:
            return None

        stripped_value = str(value).strip()
        normalized_value = re.sub(r"\s+", "", stripped_value).casefold()
        if normalized_value in EMPTY_VALUE_MARKERS:
            return None

        return stripped_value or None

    def limit(self, value: str | None, max_length: int) -> str | None:
        if value is None:
            return None

        return value[:max_length]

    def email(self, value: object) -> str | None:
        email = self.clean(value)
        if not email:
            return None

        return email if EMAIL_RE.match(email) else None

    def money_amount(self, value: MoneyValue | None) -> int | None:
        if value is None:
            return None

        amount = value.amount
        raw = self.clean(value.raw)
        if amount is None and raw:
            digits = re.sub(r"\D", "", raw)
            amount = int(digits) if digits else None

        if amount is None or amount <= 0:
            return None

        if raw and amount < 100000 and "만" in raw:
            amount *= 10000

        return amount

    def parse_date(self, value: object) -> date | None:
        raw_value = self.clean(value)
        if not raw_value:
            return None

        matched = re.search(
            r"(\d{4})\D?(\d{1,2})\D?(\d{1,2})",
            raw_value.replace(" ", ""),
        )
        if not matched:
            return None

        year = int(matched.group(1))
        month = int(matched.group(2))
        day = int(matched.group(3))
        try:
            return date(year, month, day)
        except ValueError:
            return None

    def model_json(self, value: ParsedResumeJson | ResumeAIProfile) -> dict[str, Any]:
        return value.model_dump(mode="json")


resume_value_normalizer_service = ResumeValueNormalizerService()
