from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.resume_parse_repository import (
    ResumeParseRepository,
    resume_excel_output_basename,
)
from app.schemas.resume_parse import (
    ResumeParseFileError,
    ResumeParseItem,
    ResumeParseResponse,
)


class ResumeParseService:
    def __init__(self, repository: ResumeParseRepository | None = None) -> None:
        self._repo = repository or ResumeParseRepository()

    async def parse_resumes(
        self, session: AsyncSession, files: list[UploadFile]
    ) -> ResumeParseResponse:
        items: list[ResumeParseItem] = []
        errors: list[ResumeParseFileError] = []
        for upload in files:
            original = upload.filename or "unnamed"
            tmp_path: str | None = None
            try:
                tmp_path = await self._repo.read_upload_to_tempfile(upload)
                rec = self._repo.parse_file_at_path(tmp_path)
                rec = await self._repo.persist_parse_to_db(
                    session,
                    rec,
                    uploaded_original_name=upload.filename or None,
                )
                items.append(ResumeParseItem(filename=original, record=rec))
            except Exception as e:  # noqa: BLE001
                await session.rollback()
                errors.append(ResumeParseFileError(filename=original, detail=str(e)))
            finally:
                self._repo.remove_silent(tmp_path)

        excel_b64: str | None = None
        if items:
            records = [i.record for i in items]
            excel_b64 = self._repo.records_to_excel_base64(records)

        return ResumeParseResponse(
            items=items,
            errors=errors,
            excel_base64=excel_b64,
            excel_file_name=resume_excel_output_basename() if items else None,
        )
