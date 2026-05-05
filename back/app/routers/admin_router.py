from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.services.user_service import user_service
from app.schemas.user import UserCreate,UserResponse,UserListResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post(
    "/users",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(("admin",)))],
)
async def create_hr_user(
    request: UserCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await user_service.create_user(db, request, role="hr")


@router.get(
        "/users",
        response_model=UserListResponse,
        dependencies=[Depends(require_roles(("admin",)))])
async def get_users(
    page: int = 0,
    size: int = 20,
    keyword: str | None = None,
    db: AsyncSession = Depends(get_async_db),
):
    return await user_service.get_users(db, page, size, keyword)


@router.get(
        "/users/{user_id}",
        response_model=UserResponse, 
        dependencies=[Depends(require_roles(("admin",)))] )
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    return await user_service.get_user_by_id(db, user_id)


@router.delete("/users/{user_id}", dependencies=[Depends(require_roles(("admin",)))] )
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_async_db),
):
    return await user_service.delete_user(db, user_id)