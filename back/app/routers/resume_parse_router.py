from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.resume_parse import ResumeParseResponse
from app.services.resume_parse_service import ResumeParseService


router = APIRouter(prefix="/api", tags=["Resume Parse"])

_resume_parse_service = ResumeParseService()


def get_resume_parse_service() -> ResumeParseService:
    return _resume_parse_service


@router.post(
    "/parse",
    response_model=ResumeParseResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def parse_resumes(
    service: Annotated[ResumeParseService, Depends(get_resume_parse_service)],
    session: AsyncSession = Depends(get_async_db),
    files: list[UploadFile] = File(...),
) -> ResumeParseResponse:
    if not files:
        raise HTTPException(status_code=400, detail="업로드된 파일이 없습니다.")

    return await service.parse_resumes(session, files)
