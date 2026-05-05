from typing import Any

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.generators.resume_parser import resume_parser
from app.ai.schemas.resume_parsing import (
    ParsedResumeJson,
    PositionText,
    ResumeParseAIOutput,
)
from app.models.candidate import Candidate
from app.models.resume import Resume
from app.repositories.candidate_repository import (
    CandidateRepository,
    candidate_repository,
)
from app.repositories.position_repository import position_repository
from app.repositories.resume_repository import ResumeRepository, resume_repository
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


class ResumeParseService:
    def __init__(
        self,
        candidate_repo: CandidateRepository | None = None,
        resume_repo: ResumeRepository | None = None,
        matcher: PositionMatchService | None = None,
        normalizer: ResumeValueNormalizerService | None = None,
    ) -> None:
        self._candidate_repo = candidate_repo or candidate_repository
        self._resume_repo = resume_repo or resume_repository
        self._matcher = matcher or position_match_service
        self._normalizer = normalizer or resume_value_normalizer_service

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
        secondary_match = self._matcher.match_position(
            self._position_text(personal_info.second_applied_position),
            positions,
        )

        candidate = await self._candidate_repo.find_by_identity(
            db=session,
            email=self._normalizer.email(personal_info.email),
            phone=self._normalizer.clean(personal_info.phone),
            name=self._normalizer.clean(personal_info.name),
        )
        if candidate is None:
            candidate = self._build_candidate(parsed, primary_match)
            self._candidate_repo.save(session, candidate)
            await session.flush()
        else:
            self._update_candidate(candidate, parsed, primary_match)

        resume = self._build_resume(
            candidate=candidate,
            ai_output=ai_output,
            raw_text=raw_text,
            file_path=file_path,
            secondary_match=secondary_match,
        )
        self._resume_repo.save(session, resume)
        await session.flush()

        return self._build_response_record(
            candidate=candidate,
            resume=resume,
            primary_match=primary_match,
            secondary_match=secondary_match,
        )

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

    def _build_resume(
        self,
        candidate: Candidate,
        ai_output: ResumeParseAIOutput,
        raw_text: str,
        file_path: str,
        secondary_match: dict[str, Any],
    ) -> Resume:
        parsed = ai_output.parsed_json
        return Resume(
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

    def _build_response_record(
        self,
        candidate: Candidate,
        resume: Resume,
        primary_match: dict[str, Any],
        secondary_match: dict[str, Any],
    ) -> dict[str, Any]:
        return {
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
