from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.dependencies.database import get_async_db
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup")
async def sign_up(data: UserCreate, db: AsyncSession = Depends(get_async_db)):
    user = await auth_service.signup(db, data)
    return {"message": "User created", "user_id": user.user_id}


@router.post("/login", response_model=TokenResponse)
async def sign_in(data: UserLogin, db: AsyncSession = Depends(get_async_db)):
    token = await auth_service.signin(db, data)
    return token

async def get_current_user():
    # TODO: decode JWT later
    return {"role": "admin"}  # temporary mock