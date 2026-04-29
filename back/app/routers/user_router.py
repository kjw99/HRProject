from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.services.user_service import user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/email-availability")
async def email_check(email: str, db: AsyncSession = Depends(get_async_db)):
    return await user_service.check_email_availability(db, email)
