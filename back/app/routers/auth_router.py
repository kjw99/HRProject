from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserInfo, UserLogin, TokenResponse
from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user
from app.models.user import User
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_async_db)):
    token = await auth_service.login(db, data)
    return token


@router.get("/me", response_model= UserInfo)
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "user_email": current_user.user_email,
        "user_name": current_user.user_name,
        "role": current_user.role,
        "created_at": current_user.created_at,
    }
