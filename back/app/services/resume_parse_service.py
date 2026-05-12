import re
from datetime import date
from typing import Any

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.generators.preferred_criteria_matcher import (
    PreferredCriteriaMatcher,
    preferred_criteria_matcher,
)
from app.ai.generators.resume_parser import resume_parser
from app.ai.schemas.resume_parsing import (
    CareerItem,
    ParsedResumeJson,
    PeriodValue,
    PositionText,
    ResumeParseAIOutput,
)
from app.core.exceptions import NotFoundException
from app.models.candidate import Candidate
from app.models.position import Position
from app.models.resume import Resume
from app.repositories.candidate_repository import (
    CandidateRepository,
    candidate_repository,
)
from app.repositories.position_repository import position_repository
from app.repositories.resume_repository import ResumeRepository, resume_repository
from app.services.job_description_service import (
    JobDescriptionService,
    job_description_service,
)
from app.schemas.resume_parse import (
    ResumeParseFileError,
    ResumeParseItem,
    ResumeParseResponse,
)
from app.services.position_match_service import (
    PositionMatchService,
    position_match_service,
)
from app.services.resume_file_storage_service import (
    StoredResumeFile,
    resume_file_storage_service,
)
from app.services.resume_text_extractor_service import (
    resume_text_extractor_service,
)
from app.services.resume_value_normalizer_service import (
    ResumeValueNormalizerService,
    resume_value_normalizer_service,
)


DEFAULT_APPLICATION_STATUS = "서류"

DEFAULT_EXPERIENCE_LEVEL = "신입"
EXPERIENCED_EXPERIENCE_LEVEL = "경력"
DEFAULT_FINAL_STATUS = "진행중"
EXPERIENCED_THRESHOLD_MONTHS = 12
PERIOD_MONTH_PATTERN = re.compile(r"(\d{4})\D{0,4}(\d{1,2})")
EXCLUDED_COMPANY_CAREER_KEYWORDS = (
    "인턴",
    "아르바이트",
    "파트타임",
    "교육",
    "훈련",
    "부트캠프",
    "프로젝트",
    "포트폴리오",
    "intern",
    "internship",
    "parttime",
    "part-time",
    "bootcamp",
    "project",
    "training",
)
PRESENT_PERIOD_MARKERS = (
    "현재",
    "재직중",
    "현재재직",
    "present",
    "current",
    "ongoing",
    "now",
)


class ResumeParseService:
    def __init__(
        self,
        candidate_repo: CandidateRepository | None = None,
        resume_repo: ResumeRepository | None = None,
        matcher: PositionMatchService | None = None,
        normalizer: ResumeValueNormalizerService | None = None,
        preferred_matcher: PreferredCriteriaMatcher | None = None,
        jd_service: JobDescriptionService | None = None,
    ) -> None:
        self._candidate_repo = candidate_repo or candidate_repository
        self._resume_repo = resume_repo or resume_repository
        self._matcher = matcher or position_match_service
        self._normalizer = normalizer or resume_value_normalizer_service
        self._preferred_matcher = preferred_matcher or preferred_criteria_matcher
        self._jd_service = jd_service or job_description_service

    async def parse_resumes(
        self,
        session: AsyncSession,
        files: list[UploadFile],
    ) -> ResumeParseResponse:
        items: list[ResumeParseItem] = []
        errors: list[ResumeParseFileError] = []

        for upload in files:
            original = upload.filename or "unnamed"
            stored_file: StoredResumeFile | None = None
            try:
                stored_file = await resume_file_storage_service.save_upload_file(upload)
                raw_text = resume_text_extractor_service.extract_text(
                    stored_file.absolute_path
                )
                ai_output = await resume_parser.parse(raw_text, filename=original)
                record = await self._persist_parsed_resume(
                    session=session,
                    ai_output=ai_output,
                    raw_text=raw_text,
                    file_path=stored_file.db_path,
                )
                await session.commit()
                items.append(ResumeParseItem(filename=original, record=record))
            except Exception as exc:  # noqa: BLE001
                await session.rollback()
                if stored_file is not None:
                    resume_file_storage_service.remove_silent(
                        stored_file.absolute_path
                    )

                errors.append(
                    ResumeParseFileError(
                        filename=original,
                        detail=str(exc),
                    )
                )

        return ResumeParseResponse(
            items=items,
            errors=errors,
            excel_base64=None,
            excel_file_name=None,
        )

    async def _persist_parsed_resume(
        self,
        session: AsyncSession,
        ai_output: ResumeParseAIOutput,
        raw_text: str,
        file_path: str,
    ) -> dict[str, Any]:
        positions = await position_repository.find_all(session)
        parsed = ai_output.parsed_json
        personal_info = parsed.personal_info

        primary_match = self._matcher.match_position(
            self._position_text(personal_info.applied_position),
            positions,
        )
        experience_level = self._resolve_experience_level(parsed)
        meets_preferred_criteria = await self._match_preferred_criteria(
            parsed=parsed,
            ai_output=ai_output,
            primary_match=primary_match,
            positions=positions,
        )

        candidate = await self._candidate_repo.find_by_identity(
            db=session,
            email=self._normalizer.email(personal_info.email),
            phone=self._normalizer.clean(personal_info.phone),
            name=self._normalizer.clean(personal_info.name),
        )
        if candidate is None:
            candidate = self._build_candidate(
                parsed=parsed,
                position_match=primary_match,
                experience_level=experience_level,
                meets_preferred_criteria=meets_preferred_criteria,
            )
            self._candidate_repo.save(session, candidate)
            await session.flush()
        else:
            self._update_candidate(
                candidate=candidate,
                parsed=parsed,
                position_match=primary_match,
                experience_level=experience_level,
                meets_preferred_criteria=meets_preferred_criteria,
            )

        resume = self._build_resume(
            candidate=candidate,
            ai_output=ai_output,
            raw_text=raw_text,
            file_path=file_path,
        )
        self._resume_repo.save(session, resume)
        await session.flush()

        return self._build_response_record(
            candidate=candidate,
            resume=resume,
            primary_match=primary_match,
        )

    def _build_candidate(
        self,
        parsed: ParsedResumeJson,
        position_match: dict[str, Any],
        experience_level: str,
        meets_preferred_criteria: list[str],
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
            experience_level=experience_level,
            application_status=DEFAULT_APPLICATION_STATUS,
            final_status=DEFAULT_FINAL_STATUS,
            meets_preferred_criteria=meets_preferred_criteria,
        )

    def _update_candidate(
        self,
        candidate: Candidate,
        parsed: ParsedResumeJson,
        position_match: dict[str, Any],
        experience_level: str,
        meets_preferred_criteria: list[str],
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

        candidate.experience_level = experience_level
        candidate.meets_preferred_criteria = meets_preferred_criteria

    def _build_resume(
        self,
        candidate: Candidate,
        ai_output: ResumeParseAIOutput,
        raw_text: str,
        file_path: str,
    ) -> Resume:
        parsed = ai_output.parsed_json
        return Resume(
            candidate_id=candidate.candidate_id,
            desired_location=self._normalizer.limit(
                self._normalizer.clean(parsed.desired_conditions.desired_location),
                100,
            ),
            desired_salary=self._normalizer.money_amount(
                parsed.desired_conditions.desired_salary
            ),
            file_path=self._normalizer.limit(file_path, 500),
            raw_text=raw_text,
            parsed_json=self._normalizer.model_json(parsed),
            summary=self._normalizer.clean(ai_output.summary),
            ai_profile=self._normalizer.model_json(ai_output.ai_profile),
        )

    def _build_response_record(
        self,
        candidate: Candidate,
        resume: Resume,
        primary_match: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "candidateId": candidate.candidate_id,
            "resumeId": resume.resume_id,
            "positionMatch": primary_match,
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
                "experienceLevel": candidate.experience_level,
                "applicationStatus": candidate.application_status,
                "finalStatus": candidate.final_status,
                "meetsPreferredCriteria": (
                    candidate.meets_preferred_criteria or []
                ),
            },
            "resume": {
                "resumeId": resume.resume_id,
                "candidateId": resume.candidate_id,
                "desiredLocation": resume.desired_location,
                "desiredSalary": resume.desired_salary,
                "filePath": resume.file_path,
                "summary": resume.summary,
            },
            "parsedJson": resume.parsed_json,
            "aiProfile": resume.ai_profile,
        }

    async def _match_preferred_criteria(
        self,
        parsed: ParsedResumeJson,
        ai_output: ResumeParseAIOutput,
        primary_match: dict[str, Any],
        positions: list[Position],
    ) -> list[str]:
        position = self._find_position_by_match(primary_match, positions)
        if position is None:
            return []

        try:
            jd_context = self._jd_service.get_context_for_position(position)
        except NotFoundException:
            return []

        return await self._preferred_matcher.match(
            job_description_context=jd_context,
            parsed_resume=parsed,
            position_name=position.position_name,
            resume_summary=ai_output.summary,
        )

    def _find_position_by_match(
        self,
        position_match: dict[str, Any],
        positions: list[Position],
    ) -> Position | None:
        matched_position_id = position_match.get("matchedPositionId")
        if matched_position_id is None:
            return None

        for position in positions:
            if position.position_id == matched_position_id:
                return position

        return None

    def _resolve_experience_level(self, parsed: ParsedResumeJson) -> str:
        total_months = self._total_company_employment_months(parsed.careers)
        if total_months >= EXPERIENCED_THRESHOLD_MONTHS:
            return EXPERIENCED_EXPERIENCE_LEVEL

        return DEFAULT_EXPERIENCE_LEVEL

    def _total_company_employment_months(
        self,
        careers: list[CareerItem],
    ) -> int:
        month_indexes: set[int] = set()
        today = date.today()
        current_month_index = self._month_index((today.year, today.month))

        for career in careers:
            if not self._is_company_employment(career):
                continue

            period_range = self._period_month_range(career.period, today)
            if period_range is None:
                continue

            start_month, end_month = period_range
            start_index = self._month_index(start_month)
            end_index = min(self._month_index(end_month), current_month_index)
            if start_index > end_index:
                continue

            month_indexes.update(range(start_index, end_index + 1))

        return len(month_indexes)

    def _is_company_employment(self, career: CareerItem) -> bool:
        if career.is_company_employment is False:
            return False

        company_name = self._normalizer.clean(career.company_name)
        if not company_name:
            return False

        career_text = self._normalize_for_keyword_match(
            " ".join(
                filter(
                    None,
                    [
                        career.company_name,
                        career.department,
                        career.employment_type,
                        career.position,
                        career.exclusion_reason,
                        career.resignation_reason,
                        " ".join(career.responsibilities),
                    ],
                )
            )
        )
        if any(
            keyword in career_text
            for keyword in EXCLUDED_COMPANY_CAREER_KEYWORDS
        ):
            return False

        return career.is_company_employment is True or career.period is not None

    def _period_month_range(
        self,
        period: PeriodValue | None,
        today: date,
    ) -> tuple[tuple[int, int], tuple[int, int]] | None:
        if period is None:
            return None

        raw_months = self._parse_month_values(period.raw)
        start_month = self._parse_month_value(period.start_date)
        end_month = self._parse_month_value(period.end_date)

        if start_month is None and raw_months:
            start_month = raw_months[0]

        if self._is_present_period_value(period.end_date) or (
            period.end_date is None and self._is_present_period_value(period.raw)
        ):
            end_month = (today.year, today.month)
        elif end_month is None and len(raw_months) >= 2:
            end_month = raw_months[1]

        if start_month is None or end_month is None:
            return None

        return start_month, end_month

    def _parse_month_values(self, value: object) -> list[tuple[int, int]]:
        raw_value = self._normalizer.clean(value)
        if not raw_value:
            return []

        months: list[tuple[int, int]] = []
        for year, month in PERIOD_MONTH_PATTERN.findall(raw_value):
            parsed_month = self._valid_month_tuple(year, month)
            if parsed_month is not None:
                months.append(parsed_month)

        return months

    def _parse_month_value(self, value: object) -> tuple[int, int] | None:
        raw_value = self._normalizer.clean(value)
        if not raw_value or self._is_present_period_value(raw_value):
            return None

        match = PERIOD_MONTH_PATTERN.search(raw_value)
        if not match:
            return None

        return self._valid_month_tuple(match.group(1), match.group(2))

    def _valid_month_tuple(
        self,
        year: str,
        month: str,
    ) -> tuple[int, int] | None:
        parsed_year = int(year)
        parsed_month = int(month)
        if parsed_month < 1 or parsed_month > 12:
            return None

        return parsed_year, parsed_month

    def _is_present_period_value(self, value: object) -> bool:
        normalized_value = self._normalize_for_keyword_match(
            self._normalizer.clean(value)
        )
        if not normalized_value:
            return False

        return any(marker in normalized_value for marker in PRESENT_PERIOD_MARKERS)

    def _normalize_for_keyword_match(self, value: object) -> str:
        if value is None:
            return ""

        return re.sub(r"\s+", "", str(value)).casefold()

    def _month_index(self, month: tuple[int, int]) -> int:
        year, month_number = month
        return year * 12 + month_number

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
