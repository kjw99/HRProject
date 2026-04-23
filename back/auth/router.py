from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db

from . import models, schemas, security

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.UserResponse)
async def signup(user_data: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(models.User).where(models.User.user_email == user_data.user_email)
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        user_email=user_data.user_email,
        pw_hash=security.get_password_hash(user_data.password),
        user_name=user_data.user_name,
        role=user_data.role,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


@router.post("/login", response_model=schemas.Token)
async def login(user_data: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(models.User).where(models.User.user_email == user_data.user_email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not security.verify_password(user_data.password, user.pw_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = security.create_access_token(
        data={"sub": user.user_email, "role": user.role}
    )
    return {"access_token": token, "token_type": user.role, "user_name": user.user_name}
