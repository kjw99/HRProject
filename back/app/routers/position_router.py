from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.schemas.common import MessageResponse
from app.schemas.position import (
    PositionCreate,
    PositionResponse,
    PositionUpdate,
)
from app.services.position_service import position_service


router = APIRouter(prefix="/api/positions", tags=["Position"])


@router.get(
    "",
    response_model=list[PositionResponse],
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_positions(db: AsyncSession = Depends(get_async_db)):
    return await position_service.get_positions(db)


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def create_position(data: PositionCreate, db: AsyncSession = Depends(get_async_db)):
    await position_service.create_position(db, data)
    return {"message": "직무 생성이 완료되었습니다."}


@router.patch(
    "/{position_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def update_position(
    position_id: int,
    data: PositionUpdate,
    db: AsyncSession = Depends(get_async_db),
):
    await position_service.update_position(db, position_id, data)
    return {"message": "직무 수정이 완료되었습니다."}


@router.delete(
    "/{position_id}",
    response_model=MessageResponse,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def delete_position(
    position_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    await position_service.delete_position(db, position_id)
    return {"message": "직무 삭제가 완료되었습니다."}
