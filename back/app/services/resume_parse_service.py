from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.generators.resume_parser import resume_parser
from app.repositories.resume_parse_repository import ResumeParseRepository
from app.schemas.resume_parse import (
    ResumeParseFileError,
    ResumeParseItem,
    ResumeParseResponse,
)
from app.services.resume_file_storage_service import (
    StoredResumeFile,
    resume_file_storage_service,
)
from app.services.resume_text_extractor_service import (
    resume_text_extractor_service,
)


class ResumeParseService:
    def __init__(self, repository: ResumeParseRepository | None = None) -> None:
        self._repo = repository or ResumeParseRepository()

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
                record = await self._repo.persist_resume_to_db(
                    session=session,
                    ai_output=ai_output,
                    raw_text=raw_text,
                    file_path=stored_file.db_path,
                )
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
