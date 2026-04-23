from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.auth import SignUpRequest, SignInRequest, TokenResponse
from dependencies.db import get_db
from services.auth_service import signup, signin

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
async def sign_up(data: SignUpRequest, db: AsyncSession = Depends(get_db)):
    user = await signup(db, data)
    return {"message": "User created", "user_id": user.user_id}


@router.post("/signin", response_model=TokenResponse)
async def sign_in(data: SignInRequest, db: AsyncSession = Depends(get_db)):
    token = await signin(db, data)
    return {
        "access_token": token
    }