from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.services.user_service import user_service
from app.schemas.user import UserCreate
from app.dependencies.dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/email-availability")
async def email_check(email: str, db: AsyncSession = Depends(get_async_db)):
    return await user_service.check_email_availability(db, email)


# # Admin creates HR
# @router.post("/admin/users")
# async def create_hr_user(
#     request: UserCreate,
#     db: AsyncSession = Depends(get_async_db),
#     # current_user = Depends(get_current_user)
# ):
#     if current_user.role != "admin":
#         raise HTTPException(status_code=403)

#     return await user_service.create_user_service(db, request, role="hr")


# # HR creates interviewer
# @router.post("/hr/users")
# async def create_interviewer(
#     request: UserCreate,
#     db: AsyncSession = Depends(get_async_db),
#     # current_user = Depends(get_current_user)
# ):
#     if current_user.role != "hr":
#         raise HTTPException(status_code=403)

#     return await user_service.create_user_service(db, request, role="interviewer")