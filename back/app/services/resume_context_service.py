import json
import re
from dataclasses import dataclass
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.candidate import Candidate
from app.models.position import Position
from app.models.resume import Resume
from app.repositories.candidate_repository import candidate_repository
from app.repositories.position_repository import position_repository
from app.repositories.resume_repository import resume_repository


MAX_RESUME_CONTEXT_LENGTH = 12000
MAX_RAW_TEXT_CONTEXT_LENGTH = 6000
MAX_JSON_CONTEXT_LENGTH = 8000
SENSITIVE_RESUME_KEYS = {
    "address",
    "birth_date",
    "birthDate",
    "contact",
    "dateOfBirth",
    "date_of_birth",
    "disability",
    "email",
    "exemption_reason",
    "gender",
    "military",
    "militaryId",
    "militaryRows",
    "military_end_period_raw",
    "military_rank",
    "military_service",
    "military_start_period_raw",
    "military_type",
    "name",
    "phone",
    "veteranEligibility",
    "veteran_eligibility",
}


@dataclass(frozen=True)
class ResumeQuestionContext:
    candidate: Candidate
    resume: Resume
    position: Position
    text: str


class ResumeContextService:
    async def build_context(
        self,
        db: AsyncSession,
        candidate_id: int,
        position_id: int | None = None,
    ) -> ResumeQuestionContext:
        candidate = await self._find_candidate(db, candidate_id)
        if not candidate:
            raise NotFoundException("지원자를 찾을 수 없습니다.")

        resume = await self._find_resume(db, candidate_id)
        if not resume:
            raise NotFoundException("해당 지원자의 이력서를 찾을 수 없습니다.")

        position = await self._resolve_position(db, candidate, resume, position_id)
        if not position:
            raise NotFoundException("직무를 찾을 수 없습니다.")

        text = self._build_resume_text(resume, position)
        return ResumeQuestionContext(
            candidate=candidate,
            resume=resume,
            position=position,
            text=self._truncate(text, MAX_RESUME_CONTEXT_LENGTH),
        )

    async def _find_candidate(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Candidate | None:
        return await candidate_repository.find_by_id_with_position(
            db,
            candidate_id,
        )

    async def _find_resume(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Resume | None:
        return await resume_repository.find_latest_by_candidate_id_with_second_position(
            db,
            candidate_id,
        )

    async def _resolve_position(
        self,
        db: AsyncSession,
        candidate: Candidate,
        resume: Resume,
        position_id: int | None,
    ) -> Position | None:
        if candidate.position:
            return candidate.position

        if position_id is not None:
            return await position_repository.find_by_id(db, position_id)

        return resume.second_position

    def _build_resume_text(self, resume: Resume, position: Position) -> str:
        lines: list[str] = [
            "# Resume Context",
            "",
            "## Target Position",
            f"- {self._value(position.position_name)}",
            "",
            "## Resume Metadata",
            f"- Desired location: {self._value(resume.desired_location)}",
            f"- Desired salary: {self._value(resume.desired_salary)}",
        ]

        has_resume_content = False
        if resume.ai_profile:
            has_resume_content = True
            lines.extend(
                [
                    "",
                    "## AI Profile",
                    self._format_json_for_context(resume.ai_profile),
                ]
            )

        if self._clean(resume.summary):
            has_resume_content = True
            lines.extend(["", "## Summary", self._clean(resume.summary) or ""])

        if resume.parsed_json:
            has_resume_content = True
            lines.extend(
                [
                    "",
                    "## Parsed Resume JSON",
                    self._format_json_for_context(resume.parsed_json),
                ]
            )

        if self._clean(resume.raw_text) and not has_resume_content:
            has_resume_content = True
            lines.extend(
                [
                    "",
                    "## Raw Resume Text",
                    self._truncate(
                        self._redact_sensitive_text(self._clean(resume.raw_text) or ""),
                        MAX_RAW_TEXT_CONTEXT_LENGTH,
                    ),
                ]
            )

        if not has_resume_content:
            lines.extend(["", "## Resume Content", "- No parsed resume content is stored."])

        lines.extend(
            [
                "",
                "## Interview Focus",
                "- Ask about verifiable job-related experience, skills, decisions, and outcomes.",
                "- Do not ask about age, gender, family, religion, disability, veteran status, address, appearance, or other unrelated personal information.",
                "- Use unclear resume content as a neutral confirmation question, not as an accusation.",
            ]
        )

        return "\n".join(lines).strip()

    def _format_json_for_context(self, value: dict[str, Any]) -> str:
        filtered_value = self._remove_sensitive_fields(value)
        formatted = json.dumps(filtered_value, ensure_ascii=False, indent=2, default=str)
        return self._truncate(formatted, MAX_JSON_CONTEXT_LENGTH)

    def _remove_sensitive_fields(self, value: Any) -> Any:
        if isinstance(value, dict):
            return {
                key: self._remove_sensitive_fields(child)
                for key, child in value.items()
                if key not in SENSITIVE_RESUME_KEYS
            }

        if isinstance(value, list):
            return [self._remove_sensitive_fields(child) for child in value]

        return value

    def _redact_sensitive_text(self, value: str) -> str:
        lines = []
        for line in value.splitlines():
            if any(key.lower() in line.lower() for key in SENSITIVE_RESUME_KEYS):
                continue

            lines.append(line)

        redacted = "\n".join(lines)
        redacted = re.sub(
            r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            "[email]",
            redacted,
        )
        redacted = re.sub(
            r"(?:010|011|016|017|018|019|02|0[3-6]\d|070)[-\s]?\d{3,4}[-\s]?\d{4}",
            "[phone]",
            redacted,
        )
        redacted = re.sub(r"\b\d{6}[-\s]?\d{7}\b", "[personal-id]", redacted)
        redacted = re.sub(r"\b\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\b", "[date]", redacted)
        return redacted.strip()

    def _clean(self, value: object) -> str | None:
        if value is None:
            return None

        stripped_value = str(value).strip()
        return stripped_value or None

    def _value(self, value: object) -> str:
        return self._clean(value) or "Not provided"

    def _truncate(self, value: str, max_length: int) -> str:
        if len(value) <= max_length:
            return value

        return value[:max_length].rstrip()


resume_context_service = ResumeContextService()
