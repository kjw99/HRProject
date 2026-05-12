from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user
from app.services.user_service import user_service
from app.models.user import User
from app.schemas.user import PasswordChangeRequest

router = APIRouter(prefix="/api/users", tags=["Users"]) 

@router.get("/email-availability")
async def email_check(email: str, db: AsyncSession = Depends(get_async_db)):
    return await user_service.check_email_availability(db, email)


@router.get("/me")
async def get_my_info(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "user_name": current_user.user_name,
        "role": current_user.role
    }


@router.patch("/me/password")
async def change_password(
    data: PasswordChangeRequest,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    return await user_service.change_password(db, current_user, data)