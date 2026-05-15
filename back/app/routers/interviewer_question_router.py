from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_interviewer
from app.models.interviewer import Interviewer
from app.schemas.common import MessageResponse
from app.schemas.question import (
    QuestionGenerateRequest,
    QuestionResponse,
    QuestionSaveRequest,
)
from app.schemas.question_generation_job import (
    QuestionGenerationJobCreateResponse,
    QuestionGenerationJobResponse,
)
from app.services.question_generation_job_service import question_generation_job_service
from app.services.question_service import question_service


router = APIRouter(prefix="/api/interviewer/questions", tags=["Interviewer Question"])


@router.post(
    "/generate",
    response_model=QuestionGenerationJobCreateResponse,
)
async def generate_questions_for_interviewer(
    data: QuestionGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_async_db),
    interviewer: Interviewer = Depends(get_current_interviewer),
):
    return await question_generation_job_service.create_job_for_interviewer(
        db,
        data,
        interviewer,
        background_tasks,
    )


@router.get(
    "/generation-jobs/active",
    response_model=QuestionGenerationJobResponse | None,
)
async def get_active_generation_job_for_interviewer(
    db: AsyncSession = Depends(get_async_db),
    interviewer: Interviewer = Depends(get_current_interviewer),
):
    return await question_generation_job_service.get_active_job_for_interviewer(
        db,
        interviewer.interviewer_id,
    )


@router.get(
    "/generation-jobs/{job_id}",
    response_model=QuestionGenerationJobResponse,
)
async def get_generation_job_for_interviewer(
    job_id: int,
    db: AsyncSession = Depends(get_async_db),
    interviewer: Interviewer = Depends(get_current_interviewer),
):
    return await question_generation_job_service.get_job_for_interviewer(
        db,
        job_id,
        interviewer.interviewer_id,
    )


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=MessageResponse,
)
async def save_questions_for_interviewer(
    data: QuestionSaveRequest,
    db: AsyncSession = Depends(get_async_db),
    interviewer: Interviewer = Depends(get_current_interviewer),
):
    await question_service.save_questions_for_interviewer(db, interviewer, data)
    return {"message": "질문 저장이 완료되었습니다."}


@router.get("", response_model=list[QuestionResponse])
async def get_questions_for_interviewer(
    candidate_id: int | None = Query(None, gt=0, alias="candidateId"),
    db: AsyncSession = Depends(get_async_db),
    interviewer: Interviewer = Depends(get_current_interviewer),
):
    return await question_service.get_questions_for_interviewer(
        db,
        interviewer,
        candidate_id,
    )


@router.delete("/{question_id}", response_model=MessageResponse)
async def delete_question_for_interviewer(
    question_id: int,
    db: AsyncSession = Depends(get_async_db),
    interviewer: Interviewer = Depends(get_current_interviewer),
):
    await question_service.delete_question_for_interviewer(db, interviewer, question_id)
    return {"message": "질문 삭제가 완료되었습니다."}
