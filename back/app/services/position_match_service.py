import re
import unicodedata
from typing import Any

from app.models.position import Position


BROAD_POSITION_TERMS = {
    "developer",
    "engineer",
    "\uac1c\ubc1c",
    "\uac1c\ubc1c\uc790",
    "\uc5d4\uc9c0\ub2c8\uc5b4",
    "\uc9c1\ubb34",
    "\uc9c0\uc6d0",
}
POSITION_SYNONYM_GROUPS = (
    {
        "backend",
        "backenddeveloper",
        "backendengineer",
        "backended",
        "server",
        "serverdeveloper",
        "\ubc31\uc5d4\ub4dc",
        "\ubc31\uc564\ub4dc",
        "\uc11c\ubc84",
    },
    {
        "frontend",
        "frontenddeveloper",
        "frontendengineer",
        "front",
        "react",
        "vue",
        "\ud504\ub860\ud2b8\uc5d4\ub4dc",
        "\ud504\ub860\ud2b8",
        "\uc6f9\ud504\ub860\ud2b8",
    },
    {
        "fullstack",
        "fullstackdeveloper",
        "\ud480\uc2a4\ud0dd",
        "\ud480\uc2a4\ud14d",
    },
    {
        "data",
        "dataengineer",
        "dataanalyst",
        "analytics",
        "\ub370\uc774\ud130",
        "\ub370\uc774\ud130\ubd84\uc11d",
        "\ub370\uc774\ud130\uc5d4\uc9c0\ub2c8\uc5b4",
    },
    {
        "ai",
        "ml",
        "machinelearning",
        "deeplearning",
        "llm",
        "\uc778\uacf5\uc9c0\ub2a5",
        "\uba38\uc2e0\ub7ec\ub2dd",
        "\ub525\ub7ec\ub2dd",
    },
    {
        "devops",
        "sre",
        "infra",
        "infrastructure",
        "cloud",
        "\ub370\ube0c\uc635\uc2a4",
        "\uc778\ud504\ub77c",
        "\ud074\ub77c\uc6b0\ub4dc",
    },
    {
        "mobile",
        "android",
        "ios",
        "flutter",
        "reactnative",
        "\ubaa8\ubc14\uc77c",
        "\uc548\ub4dc\ub85c\uc774\ub4dc",
    },
    {
        "qa",
        "test",
        "tester",
        "qualityassurance",
        "\ud488\uc9c8",
        "\ud14c\uc2a4\ud2b8",
        "qa\uc5d4\uc9c0\ub2c8\uc5b4",
    },
    {
        "designer",
        "design",
        "ui",
        "ux",
        "productdesigner",
        "\ub514\uc790\uc778",
        "\ub514\uc790\uc774\ub108",
        "uiux",
    },
    {
        "pm",
        "po",
        "productmanager",
        "planner",
        "planning",
        "\uae30\ud68d",
        "\uc11c\ube44\uc2a4\uae30\ud68d",
        "\ud504\ub85c\ub355\ud2b8",
    },
)


class PositionMatchService:
    def match_position(
        self,
        raw_position: str | None,
        positions: list[Position],
    ) -> dict[str, Any]:
        cleaned_position = self._clean(raw_position)
        if not cleaned_position:
            return self._position_match_result(
                status="notProvided",
                raw_position=None,
                reason="이력서에서 지원 직무를 추출하지 못했습니다.",
            )

        if not positions:
            return self._position_match_result(
                status="noPositions",
                raw_position=cleaned_position,
                reason="데이터베이스에 등록된 직무가 없습니다.",
            )

        terms = self._position_terms(cleaned_position)
        scored_positions: list[tuple[int, Position, str]] = []

        for position in positions:
            score, reason = self._score_position_match(terms, position.position_name)
            if score > 0:
                scored_positions.append((score, position, reason))

        if not scored_positions:
            return self._position_match_result(
                status="noMatch",
                raw_position=cleaned_position,
                reason="추출된 직무와 일치하는 데이터베이스 직무가 없습니다.",
            )

        scored_positions.sort(key=lambda item: (-item[0], item[1].position_id))
        best_score = scored_positions[0][0]
        best_positions = [
            item for item in scored_positions if item[0] == best_score
        ]

        if len(best_positions) > 1:
            return self._position_match_result(
                status="ambiguous",
                raw_position=cleaned_position,
                candidates=[
                    self._position_candidate(score, position, reason)
                    for score, position, reason in best_positions[:5]
                ],
                reason="추출된 직무와 일치하는 데이터베이스 직무가 여러 개입니다.",
            )

        score, position, reason = best_positions[0]
        return self._position_match_result(
            status="matched",
            raw_position=cleaned_position,
            matched_position_id=position.position_id,
            matched_position_name=position.position_name,
            candidates=[self._position_candidate(score, position, reason)],
            reason=reason,
        )

    def _score_position_match(
        self,
        terms: set[str],
        position_name: str,
    ) -> tuple[int, str]:
        normalized_position = self._normalize_position(position_name)
        if not normalized_position:
            return 0, ""

        if normalized_position in terms:
            return 100, "정규화된 직무명이 정확히 일치합니다."

        best_score = 0
        best_reason = ""
        for term in terms:
            if not term or term in BROAD_POSITION_TERMS:
                continue

            if normalized_position in term and len(normalized_position) >= 4:
                best_score = max(best_score, 90)
                best_reason = "추출된 직무에 데이터베이스 직무명이 포함되어 있습니다."

            if term in normalized_position and len(term) >= 4:
                best_score = max(best_score, 85)
                best_reason = "데이터베이스 직무명에 추출된 직무가 포함되어 있습니다."

        for synonym_group in POSITION_SYNONYM_GROUPS:
            if (
                any(alias in terms for alias in synonym_group)
                or any(any(alias in term for alias in synonym_group) for term in terms)
            ) and any(alias in normalized_position for alias in synonym_group):
                if best_score < 80:
                    best_score = 80
                    best_reason = "직무 동의어 그룹이 일치합니다."

        return best_score, best_reason

    def _position_terms(self, value: str) -> set[str]:
        raw_terms = {value}
        raw_terms.update(
            term
            for term in re.split(
                "[,/|&()\\[\\]\n\r]+|\\s+\\+\\s+|\\s+\ubc0f\\s+",
                value,
            )
            if term.strip()
        )

        return {
            normalized_term
            for term in raw_terms
            if (normalized_term := self._normalize_position(term))
        }

    def _normalize_position(self, value: str) -> str:
        normalized = unicodedata.normalize("NFKC", value).casefold()
        return re.sub("[^0-9a-zA-Z\\uac00-\\ud7a3]+", "", normalized)

    def _position_match_result(
        self,
        status: str,
        raw_position: str | None,
        matched_position_id: int | None = None,
        matched_position_name: str | None = None,
        candidates: list[dict[str, Any]] | None = None,
        reason: str | None = None,
    ) -> dict[str, Any]:
        return {
            "status": status,
            "rawPosition": raw_position,
            "matchedPositionId": matched_position_id,
            "matchedPositionName": matched_position_name,
            "candidates": candidates or [],
            "reason": reason,
        }

    def _position_candidate(
        self,
        score: int,
        position: Position,
        reason: str,
    ) -> dict[str, Any]:
        return {
            "positionId": position.position_id,
            "positionName": position.position_name,
            "score": score,
            "reason": reason,
        }

    def _clean(self, value: object) -> str | None:
        if value is None:
            return None

        stripped_value = str(value).strip()
        return stripped_value or None


position_match_service = PositionMatchService()
