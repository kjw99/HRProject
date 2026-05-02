from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.schemas.resume_parsing import (
    ParsedResumeJson,
    PositionText,
    ResumeParseAIOutput,
)
from app.models.candidate import Candidate
from app.models.position import Position
from app.models.resume import Resume
from app.services.position_match_service import (
    PositionMatchService,
    position_match_service,
)
from app.services.resume_value_normalizer_service import (
    ResumeValueNormalizerService,
    resume_value_normalizer_service,
)


DEFAULT_APPLICATION_STATUS = "\uc11c\ub958"


class ResumeParseRepository:
    def __init__(
        self,
        matcher: PositionMatchService | None = None,
        normalizer: ResumeValueNormalizerService | None = None,
    ) -> None:
        self._matcher = matcher or position_match_service
        self._normalizer = normalizer or resume_value_normalizer_service

    async def persist_resume_to_db(
        self,
        session: AsyncSession,
        ai_output: ResumeParseAIOutput,
        raw_text: str,
        file_path: str,
    ) -> dict[str, Any]:
        positions = await self._find_positions(session)
        parsed = ai_output.parsed_json
        personal_info = parsed.personal_info

        primary_match = self._matcher.match_position(
            self._position_text(personal_info.applied_position),
            positions,
        )
        secondary_match = self._matcher.match_position(
            self._position_text(personal_info.second_applied_position),
            positions,
        )

        candidate = await self._find_candidate(session, parsed)
        if candidate is None:
            candidate = self._build_candidate(parsed, primary_match)
            session.add(candidate)
            await session.flush()
        else:
            self._update_candidate(candidate, parsed, primary_match)

        resume = Resume(
            candidate_id=candidate.candidate_id,
            desired_location=self._normalizer.limit(
                self._normalizer.clean(parsed.desired_conditions.desired_location),
                100,
            ),
            second_position_id=secondary_match["matchedPositionId"],
            desired_salary=self._normalizer.money_amount(
                parsed.desired_conditions.desired_salary
            ),
            file_path=self._normalizer.limit(file_path, 500),
            raw_text=raw_text,
            parsed_json=self._normalizer.model_json(parsed),
            summary=self._normalizer.clean(ai_output.summary),
            ai_profile=self._normalizer.model_json(ai_output.ai_profile),
        )
        session.add(resume)
        await session.flush()

        record = {
            "candidateId": candidate.candidate_id,
            "resumeId": resume.resume_id,
            "positionMatch": primary_match,
            "secondPositionMatch": secondary_match,
            "candidate": {
                "candidateId": candidate.candidate_id,
                "positionId": candidate.position_id,
                "name": candidate.name,
                "dateOfBirth": (
                    candidate.date_of_birth.isoformat()
                    if candidate.date_of_birth
                    else None
                ),
                "gender": candidate.gender,
                "address": candidate.address,
                "phone": candidate.phone,
                "email": candidate.email,
                "applicationStatus": candidate.application_status,
            },
            "resume": {
                "resumeId": resume.resume_id,
                "candidateId": resume.candidate_id,
                "desiredLocation": resume.desired_location,
                "secondPositionId": resume.second_position_id,
                "desiredSalary": resume.desired_salary,
                "filePath": resume.file_path,
                "summary": resume.summary,
            },
            "parsedJson": resume.parsed_json,
            "aiProfile": resume.ai_profile,
        }
        await session.commit()
        return record

    async def _find_positions(self, session: AsyncSession) -> list[Position]:
        result = await session.scalars(
            select(Position).order_by(Position.position_id.asc())
        )
        return list(result.all())

    async def _find_candidate(
        self,
        session: AsyncSession,
        parsed: ParsedResumeJson,
    ) -> Candidate | None:
        email = self._normalizer.email(parsed.personal_info.email)
        phone = self._normalizer.clean(parsed.personal_info.phone)
        name = self._normalizer.clean(parsed.personal_info.name)

        if email:
            candidate = await session.scalar(
                select(Candidate)
                .where(Candidate.email == email)
                .order_by(Candidate.candidate_id.asc())
                .limit(1)
            )
            if candidate is not None:
                return candidate

        if phone and name:
            return await session.scalar(
                select(Candidate)
                .where(
                    Candidate.phone == phone,
                    Candidate.name == name,
                )
                .order_by(Candidate.candidate_id.asc())
                .limit(1)
            )

        return None

    def _build_candidate(
        self,
        parsed: ParsedResumeJson,
        position_match: dict[str, Any],
    ) -> Candidate:
        personal_info = parsed.personal_info
        return Candidate(
            position_id=position_match["matchedPositionId"],
            name=self._normalizer.limit(
                self._normalizer.clean(personal_info.name),
                50,
            ),
            date_of_birth=self._normalizer.parse_date(personal_info.birth_date),
            gender=self._normalizer.limit(
                self._normalizer.clean(personal_info.gender),
                10,
            ),
            address=self._normalizer.limit(
                self._normalizer.clean(personal_info.address),
                255,
            ),
            phone=self._normalizer.limit(
                self._normalizer.clean(personal_info.phone),
                20,
            ),
            email=self._normalizer.limit(
                self._normalizer.email(personal_info.email),
                255,
            ),
            application_status=DEFAULT_APPLICATION_STATUS,
        )

    def _update_candidate(
        self,
        candidate: Candidate,
        parsed: ParsedResumeJson,
        position_match: dict[str, Any],
    ) -> None:
        personal_info = parsed.personal_info
        self._set_if_present(candidate, "name", personal_info.name, 50)

        birth_date = self._normalizer.parse_date(personal_info.birth_date)
        if birth_date:
            candidate.date_of_birth = birth_date

        self._set_if_present(candidate, "gender", personal_info.gender, 10)
        self._set_if_present(candidate, "address", personal_info.address, 255)
        self._set_if_present(candidate, "phone", personal_info.phone, 20)

        if not self._normalizer.clean(candidate.email):
            candidate.email = self._normalizer.limit(
                self._normalizer.email(personal_info.email),
                255,
            )

        if candidate.position_id is None and position_match["matchedPositionId"]:
            candidate.position_id = position_match["matchedPositionId"]

    def _set_if_present(
        self,
        target: object,
        attr_name: str,
        value: object,
        max_length: int,
    ) -> None:
        cleaned_value = self._normalizer.limit(
            self._normalizer.clean(value),
            max_length,
        )
        if cleaned_value:
            setattr(target, attr_name, cleaned_value)

    def _position_text(self, value: PositionText | None) -> str | None:
        if value is None:
            return None

        return self._normalizer.clean(value.normalized) or self._normalizer.clean(
            value.raw
        )
