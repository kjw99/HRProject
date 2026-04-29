from dataclasses import dataclass
from datetime import date

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.models.candidate import Candidate
from app.models.position import Position
from app.models.resume import Resume


MAX_STATEMENT_ANSWER_LENGTH = 1500
MAX_RESUME_CONTEXT_LENGTH = 12000


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
        resume_id: int | None = None,
        position_id: int | None = None,
    ) -> ResumeQuestionContext:
        candidate = await self._find_candidate(db, candidate_id)
        if not candidate:
            raise NotFoundException("Candidate not found.")

        resume = await self._find_resume(db, candidate_id, resume_id)
        if not resume:
            raise NotFoundException("Resume not found for candidate.")

        position = await self._resolve_position(db, candidate, resume, position_id)
        if not position:
            raise NotFoundException("Position not found.")

        text = self._build_resume_text(resume, position)
        return ResumeQuestionContext(
            candidate=candidate,
            resume=resume,
            position=position,
            text=self._truncate(text),
        )

    async def _find_candidate(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Candidate | None:
        result = await db.scalars(
            select(Candidate)
            .where(Candidate.candidate_id == candidate_id)
            .options(selectinload(Candidate.position))
        )
        return result.one_or_none()

    async def _find_resume(
        self,
        db: AsyncSession,
        candidate_id: int,
        resume_id: int | None,
    ) -> Resume | None:
        query = (
            select(Resume)
            .where(Resume.candidate_id == candidate_id)
            .options(
                selectinload(Resume.position),
                selectinload(Resume.second_position),
                selectinload(Resume.educations),
                selectinload(Resume.experiences),
                selectinload(Resume.qualifications),
                selectinload(Resume.statements),
            )
        )

        if resume_id is not None:
            query = query.where(Resume.resume_id == resume_id)
        else:
            query = query.order_by(
                desc(Resume.created_at),
                desc(Resume.resume_id),
            ).limit(1)

        result = await db.scalars(query)
        return result.one_or_none()

    async def _resolve_position(
        self,
        db: AsyncSession,
        candidate: Candidate,
        resume: Resume,
        position_id: int | None,
    ) -> Position | None:
        if position_id is not None:
            return await db.get(Position, position_id)

        if resume.position:
            return resume.position

        if candidate.position:
            return candidate.position

        return None

    def _build_resume_text(self, resume: Resume, position: Position) -> str:
        lines: list[str] = [
            "# Resume Context",
            "",
            "## Target Position",
            f"- {self._value(position.position_name)}",
            "",
            "## Experiences",
        ]

        if resume.experiences:
            for index, experience in enumerate(resume.experiences, 1):
                lines.extend(
                    [
                        f"### Experience {index}",
                        f"- Company: {self._value(experience.company)}",
                        f"- Role: {self._value(experience.role)}",
                        f"- Job title: {self._value(experience.job_title)}",
                        "- Period: "
                        f"{self._period(experience.employment_start_period, experience.employment_end_period)}",
                    ]
                )
                if self._clean(experience.reason_for_leaving):
                    lines.append(
                        f"- Reason for leaving: {self._clean(experience.reason_for_leaving)}"
                    )
        else:
            lines.append("- No extracted experience.")

        lines.extend(["", "## Education"])
        if resume.educations:
            for education in resume.educations:
                parts = [
                    self._clean(education.department),
                    self._clean(education.completion_status),
                    self._period(
                        education.attendance_start_period,
                        education.attendance_end_period,
                    ),
                ]
                lines.append(f"- {self._join_values(parts)}")
        else:
            lines.append("- No extracted education.")

        lines.extend(["", "## Qualifications"])
        if resume.qualifications:
            for qualification in resume.qualifications:
                parts = [
                    self._clean(qualification.certificate),
                    self._clean(qualification.organization),
                    self._format_date(qualification.issue_date),
                ]
                lines.append(f"- {self._join_values(parts)}")
        else:
            lines.append("- No extracted qualifications.")

        lines.extend(["", "## Statements"])
        if resume.statements:
            for index, statement in enumerate(resume.statements, 1):
                question = self._clean(statement.question) or f"Statement {index}"
                answer = self._truncate_statement(self._clean(statement.answer))
                if not answer:
                    continue

                lines.extend(
                    [
                        f"### {question}",
                        answer,
                    ]
                )
        else:
            lines.append("- No extracted statements.")

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

    def _clean(self, value: object) -> str | None:
        if value is None:
            return None

        stripped_value = str(value).strip()
        return stripped_value or None

    def _value(self, value: object) -> str:
        return self._clean(value) or "Not provided"

    def _join_values(self, values: list[str | None]) -> str:
        cleaned_values = [value for value in values if value]
        if not cleaned_values:
            return "Not provided"

        return " / ".join(cleaned_values)

    def _format_date(self, value: date | None) -> str | None:
        return value.isoformat() if value else None

    def _period(self, start: date | None, end: date | None) -> str:
        start_value = self._format_date(start) or "unknown"
        end_value = self._format_date(end) or "unknown"
        return f"{start_value} ~ {end_value}"

    def _truncate_statement(self, value: str | None) -> str | None:
        if not value:
            return None

        if len(value) <= MAX_STATEMENT_ANSWER_LENGTH:
            return value

        return value[:MAX_STATEMENT_ANSWER_LENGTH].rstrip()

    def _truncate(self, value: str) -> str:
        if len(value) <= MAX_RESUME_CONTEXT_LENGTH:
            return value

        return value[:MAX_RESUME_CONTEXT_LENGTH].rstrip()


resume_context_service = ResumeContextService()
