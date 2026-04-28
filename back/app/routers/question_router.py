from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.common import MessageResponse
from app.schemas.question import (
    GeneratedQuestionResponse,
    QuestionGenerateRequest,
    QuestionResponse,
    QuestionSaveRequest,
)
from app.services.question_service import question_service


router = APIRouter(prefix="/api/questions", tags=["Question"])


@router.post(
    "/generate",
    response_model=list[GeneratedQuestionResponse],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def generate_questions(
    data: QuestionGenerateRequest,
    db: AsyncSession = Depends(get_async_db),
):
    return await question_service.generate_position_questions(db, data)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def save_questions(
    data: QuestionSaveRequest,
    db: AsyncSession = Depends(get_async_db),
):
    await question_service.save_position_questions(db, data)
    return {"message": "질문 저장이 완료되었습니다."}


@router.get(
    "",
    response_model=list[QuestionResponse],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_questions_by_position(
    position_id: int = Query(..., gt=0, alias="positionId"),
    db: AsyncSession = Depends(get_async_db),
):
    return await question_service.get_questions_by_position(db, position_id)
