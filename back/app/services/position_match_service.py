import re
import unicodedata
from typing import Any

from app.models.position import Position

from dataclasses import dataclass, field




BROAD_POSITION_TERMS = {
    "developer",
    "engineer",
    "개발",
    "개발자",
    "엔지니어",
    "직무",
    "지원",
}
POSITION_SYNONYM_GROUPS = (
    {
        "backend",
        "backenddeveloper",
        "backendengineer",
        "backended",
        "server",
        "serverdeveloper",
        "백엔드",
        "백앤드",
        "서버",
    },
    {
        "frontend",
        "frontenddeveloper",
        "frontendengineer",
        "front",
        "react",
        "vue",
        "프론트엔드",
        "프론트",
        "웹프론트",
    },
    {
        "fullstack",
        "fullstackdeveloper",
        "풀스택",
        "풀스텍",
    },
    {
        "data",
        "dataengineer",
        "dataanalyst",
        "analytics",
        "데이터",
        "데이터분석",
        "데이터엔지니어",
    },
    {
        "ai",
        "ml",
        "machinelearning",
        "deeplearning",
        "llm",
        "인공지능",
        "머신러닝",
        "딥러닝",
    },
    {
        "devops",
        "sre",
        "infra",
        "infrastructure",
        "cloud",
        "데브옵스",
        "인프라",
        "클라우드",
    },
    {
        "mobile",
        "android",
        "ios",
        "flutter",
        "reactnative",
        "모바일",
        "안드로이드",
    },
    {
        "qa",
        "test",
        "tester",
        "qualityassurance",
        "품질",
        "테스트",
        "qa엔지니어",
    },
    {
        "designer",
        "design",
        "ui",
        "ux",
        "productdesigner",
        "디자인",
        "디자이너",
        "uiux",
    },
    {
        "pm",
        "po",
        "productmanager",
        "planner",
        "planning",
        "기획",
        "서비스기획",
        "프로덕트",
    },
)

#####사비카 코드#######
@dataclass(frozen=True)
class PositionMatchInput:
    applied_position: str | None = None
    target_position: str | None = None
    career_positions: list[str] = field(default_factory=list)
    skills: list[str] = field(default_factory=list)
    responsibilities: list[str] = field(default_factory=list)
    filename: str | None = None
###################

class PositionMatchService:
    
    ####사비카 코드########
    def match_resume_position(
        self,
        match_input: PositionMatchInput,
        positions: list[Position],
    ) -> dict[str, Any]:
        evidence = self._collect_evidence(match_input)

        if not evidence:
            return self._position_match_result(
                status="notProvided",
                raw_position=None,
                reason="No usable position evidence was extracted from the resume.",
            )

        if not positions:
            return self._position_match_result(
                status="noPositions",
                raw_position=", ".join(evidence[:5]),
                reason="No positions are registered in the database.",
            )

        scored_positions = []

        for position in positions:
            score, reasons = self._score_position_with_evidence(position, evidence)
            if score > 0:
                scored_positions.append((score, position, reasons))

        if not scored_positions:
            return self._position_match_result(
                status="noMatch",
                raw_position=", ".join(evidence[:5]),
                reason="No database position matched the extracted resume evidence.",
            )

        scored_positions.sort(key=lambda item: (-item[0], item[1].position_id))
        best_score, best_position, best_reasons = scored_positions[0]

        candidates = [
            self._position_candidate(score, position, "; ".join(reasons))
            for score, position, reasons in scored_positions[:5]
        ]

        if best_score < 80:
            return self._position_match_result(
                status="lowConfidence",
                raw_position=", ".join(evidence[:5]),
                candidates=candidates,
                reason="Only weak position evidence matched.",
            )

        tied_best = [item for item in scored_positions if item[0] == best_score]
        if len(tied_best) > 1:
            return self._position_match_result(
                status="ambiguous",
                raw_position=", ".join(evidence[:5]),
                candidates=candidates,
                reason="Multiple positions received the same best score.",
            )

        return self._position_match_result(
            status="matched",
            raw_position=", ".join(evidence[:5]),
            matched_position_id=best_position.position_id,
            matched_position_name=best_position.position_name,
            candidates=candidates,
            reason="; ".join(best_reasons),
        )
    ##################################

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
        best_positions = [item for item in scored_positions if item[0] == best_score]

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

    #####사비카 코드######
    def _collect_evidence(self, match_input: PositionMatchInput) -> list[str]:
        values = []

        if match_input.applied_position:
            values.append(match_input.applied_position)

        if match_input.target_position:
            values.append(match_input.target_position)

        values.extend(match_input.career_positions)
        values.extend(match_input.skills)
        values.extend(match_input.responsibilities)

        if match_input.filename:
            values.append(match_input.filename)

        return [value for value in values if self._clean(value)]

    def _score_position_with_evidence(
        self,
        position: Position,
        evidence: list[str],
    ) -> tuple[int, list[str]]:
        best_score = 0
        reasons = []

        for index, text in enumerate(evidence):
            terms = self._position_terms(text)
            score, reason = self._score_position_match(terms, position.position_name)

            if score <= 0:
                continue

            if index == 0:
                weighted_score = score
            elif index == 1:
                weighted_score = min(score, 90)
            else:
                weighted_score = min(score, 75)

            if weighted_score > best_score:
                best_score = weighted_score

            reasons.append(f"{text}: {reason}")

        return best_score, reasons

    ####################

    def _position_terms(self, value: str) -> set[str]:
        raw_terms = {value}
        raw_terms.update(
            term
            for term in re.split(
                "[,/|&()\\[\\]\n\r]+|\\s+\\+\\s+|\\s+및\\s+",
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
        return re.sub("[^0-9a-zA-Z가-힣]+", "", normalized)

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


# def _position_match_input(
#         self,
#         parsed: ParsedResumeJson,
#         ai_output: ResumeParseAIOutput,
#     ) -> PositionMatchInput:
#         return PositionMatchInput(
#             applied_position=self._position_text(parsed.personal_info.applied_position),
#             target_position=ai_output.ai_profile.target_position,
#             career_positions=[
#                 career.position
#                 for career in parsed.careers
#                 if self._normalizer.clean(career.position)
#             ],
#             skills=parsed.skills,
#             responsibilities=[
#                 responsibility
#                 for career in parsed.careers
#                 for responsibility in career.responsibilities
#             ],
#         )

#     def match_resume_position(
#         self,
#         match_input: PositionMatchInput,
#         positions: list[Position],
#     ) -> dict[str, Any]:
#         evidence = self._collect_evidence(match_input)

#         if not evidence:
#             return self._position_match_result(
#                 status="notProvided",
#                 raw_position=None,
#                 reason="No usable position evidence was extracted from the resume.",
#             )

#         scored_positions = []

#         for position in positions:
#             score, reasons = self._score_position_with_evidence(position, evidence)
#             if score > 0:
#                 scored_positions.append((score, position, reasons))

#         if not scored_positions:
#             return self._position_match_result(
#                 status="noMatch",
#                 raw_position=", ".join(evidence[:5]),
#                 reason="No database position matched the extracted resume evidence.",
#             )

#         scored_positions.sort(key=lambda item: (-item[0], item[1].position_id))
#         best_score, best_position, best_reasons = scored_positions[0]

#         candidates = [
#             self._position_candidate(score, position, "; ".join(reasons))
#             for score, position, reasons in scored_positions[:5]
#         ]

#         if best_score < 70:
#             return self._position_match_result(
#                 status="lowConfidence",
#                 raw_position=", ".join(evidence[:5]),
#                 candidates=candidates,
#                 reason="Only weak position evidence matched.",
#             )

#         tied_best = [item for item in scored_positions if item[0] == best_score]
#         if len(tied_best) > 1:
#             return self._position_match_result(
#                 status="ambiguous",
#                 raw_position=", ".join(evidence[:5]),
#                 candidates=candidates,
#                 reason="Multiple positions received the same best score.",
#             )

#         return self._position_match_result(
#             status="matched",
#             raw_position=", ".join(evidence[:5]),
#             matched_position_id=best_position.position_id,
#             matched_position_name=best_position.position_name,
#             candidates=candidates,
#             reason="; ".join(best_reasons),
#         )

#     def _collect_evidence(self, match_input: PositionMatchInput) -> list[str]:
#         values = []

#         if match_input.applied_position:
#             values.append(match_input.applied_position)

#         if match_input.target_position:
#             values.append(match_input.target_position)

#         values.extend(match_input.career_positions or [])
#         values.extend(match_input.skills or [])
#         values.extend(match_input.responsibilities or [])

#         return [value for value in values if self._clean(value)]


#     def _score_position_with_evidence(
#         self,
#         position: Position,
#         evidence: list[str],
#     ) -> tuple[int, list[str]]:
#         best_score = 0
#         reasons = []

#         for index, text in enumerate(evidence):
#             terms = self._position_terms(text)
#             score, reason = self._score_position_match(terms, position.position_name)

#             if score <= 0:
#                 continue

#             # Applied position / target position should matter more than skills.
#             if index == 0:
#                 weighted_score = score
#             elif index == 1:
#                 weighted_score = min(score, 90)
#             else:
#                 weighted_score = min(score, 75)

#             if weighted_score > best_score:
#                 best_score = weighted_score

#             reasons.append(f"{text}: {reason}")

#         return best_score, reasons
