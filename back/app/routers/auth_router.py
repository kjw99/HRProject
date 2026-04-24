from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.user import UserCreate, UserLogin, TokenResponse
from dependencies.database import get_db
from services.auth_service import signup, signin

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup")
async def sign_up(data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await signup(db, data)
    return {"message": "User created", "user_id": user.user_id}


@router.post("/login", response_model=TokenResponse)
async def sign_in(data: UserLogin, db: AsyncSession = Depends(get_db)):
    token = await signin(db, data)
    return {
        "access_token": token
    }