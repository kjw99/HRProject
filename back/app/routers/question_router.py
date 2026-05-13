from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user, require_roles
from app.models.user import User
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
    return await question_service.generate_questions(db, data)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def save_questions(
    data: QuestionSaveRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    await question_service.save_position_questions(
        db,
        data,
        created_by_user_id=current_user.user_id,
    )
    return {"message": "Questions saved"}


@router.get(
    "",
    response_model=list[QuestionResponse],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_questions(
    position_id: int | None = Query(None, gt=0, alias="positionId"),
    candidate_id: int | None = Query(None, gt=0, alias="candidateId"),
    db: AsyncSession = Depends(get_async_db),
):
    return await question_service.get_questions(db, position_id, candidate_id)


@router.delete(
    "/{question_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    await question_service.delete_question(db, question_id)
    return {"message": "Question deleted"}
