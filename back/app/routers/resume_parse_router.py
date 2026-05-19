from __future__ import annotations

from io import BytesIO
from typing import Annotated, TypedDict
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.dependencies.database import AsyncSessionLocal, get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.resume_parse import (
    ResumeParseFileError,
    ResumeParseJobCancelResponse,
    ResumeParseJobCreateResponse,
    ResumeParseJobResponse,
    ResumeParseItem,
    ResumeParseResponse,
)
from app.services.resume_parse_service import ResumeParseService


router = APIRouter(prefix="/api", tags=["Resume Parse"])

_resume_parse_service = ResumeParseService()


class ParseJobState(TypedDict):
    job_id: str
    status: str
    total_files: int
    processed_files: int
    result: ResumeParseResponse | None
    error: str | None
    cancel_requested: bool


_PARSE_JOBS: dict[str, ParseJobState] = {}


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
        raise HTTPException(status_code=400, detail="업로드한 파일이 없습니다.")

    return await service.parse_resumes(session, files)


@router.post(
    "/parse/jobs",
    response_model=ResumeParseJobCreateResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def create_parse_job(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
):
    if not files:
        raise HTTPException(status_code=400, detail="업로드한 파일이 없습니다.")

    file_payloads: list[tuple[str, bytes]] = []
    for file in files:
        file_payloads.append((file.filename or "unnamed", await file.read()))

    job_id = str(uuid4())
    _PARSE_JOBS[job_id] = ParseJobState(
        job_id=job_id,
        status="queued",
        total_files=len(file_payloads),
        processed_files=0,
        result=None,
        error=None,
        cancel_requested=False,
    )

    background_tasks.add_task(_run_parse_job, job_id, file_payloads)

    job = _PARSE_JOBS[job_id]
    return ResumeParseJobCreateResponse(
        job_id=job["job_id"],
        status=job["status"],
        total_files=job["total_files"],
        processed_files=job["processed_files"],
    )


@router.get(
    "/parse/jobs/{job_id}",
    response_model=ResumeParseJobResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_parse_job(job_id: str):
    job = _PARSE_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="파싱 작업을 찾을 수 없습니다.")

    return ResumeParseJobResponse(
        job_id=job["job_id"],
        status=job["status"],
        total_files=job["total_files"],
        processed_files=job["processed_files"],
        result=job["result"],
        error=job["error"],
    )


@router.post(
    "/parse/jobs/{job_id}/cancel",
    response_model=ResumeParseJobCancelResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def cancel_parse_job(job_id: str) -> ResumeParseJobCancelResponse:
    """진행 중 파싱 작업에 취소를 요청합니다.

    실행 중인 단일 파일 파싱은 끝까지 마치고, 다음 파일부터 중단합니다.
    """
    job = _PARSE_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="파싱 작업을 찾을 수 없습니다.")

    current_status = job["status"]
    if current_status in {"succeeded", "failed", "cancelled"}:
        return ResumeParseJobCancelResponse(
            job_id=job["job_id"],
            status=current_status,
            cancel_requested=job.get("cancel_requested", False),
            message="이미 종료된 작업입니다.",
        )

    job["cancel_requested"] = True

    return ResumeParseJobCancelResponse(
        job_id=job["job_id"],
        status=job["status"],
        cancel_requested=True,
        message="파싱 취소가 요청되었습니다. 현재 파일 처리가 끝나면 중단됩니다.",
    )


async def _run_parse_job(job_id: str, file_payloads: list[tuple[str, bytes]]) -> None:
    job = _PARSE_JOBS.get(job_id)
    if not job:
        return

    job["status"] = "running"
    items: list[ResumeParseItem] = []
    errors: list[ResumeParseFileError] = []
    cancelled = False

    for filename, file_bytes in file_payloads:
        if job.get("cancel_requested"):
            cancelled = True
            break

        try:
            upload = StarletteUploadFile(
                filename=filename,
                file=BytesIO(file_bytes),
            )
            async with AsyncSessionLocal() as session:
                result = await _resume_parse_service.parse_resumes(
                    session,
                    [upload],
                )
                items.extend(result.items)
                errors.extend(result.errors)
        except Exception as exc:  # noqa: BLE001
            errors.append(
                ResumeParseFileError(
                    filename=filename,
                    detail=str(exc) or "이력서 파싱 중 알 수 없는 오류가 발생했습니다.",
                )
            )
        finally:
            job["processed_files"] += 1

    job["result"] = ResumeParseResponse(
        items=items,
        errors=errors,
        excel_base64=None,
        excel_file_name=None,
    )
    job["status"] = "cancelled" if cancelled else "succeeded"
