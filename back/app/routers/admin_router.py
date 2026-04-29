from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.services.user_service import user_service
from app.schemas.user import UserCreate,UserResponse

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
    return await user_service.create_user_service(db, request, role="hr")
