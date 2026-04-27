from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.services.user_service import user_service
from app.schemas.user import UserCreate,UserResponse
from app.dependencies.dependencies import get_current_user

router = APIRouter(prefix="/api/hr", tags=["HR"])

@router.post("/users",response_model=UserResponse)
async def create_interviewer(
    request: UserCreate,
    db: AsyncSession = Depends(get_async_db),
    # current_user = Depends(get_current_user)
):
    # TEMP: comment auth while testing
    # if current_user.role != "hr":
    #     raise HTTPException(status_code=403)

    return await user_service.create_user_service(db, request, role="interviewer")