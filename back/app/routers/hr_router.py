from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import require_roles
from app.services.user_service import user_service
from app.schemas.user import UserCreate,UserResponse

from app.schemas.hr_dashboard import DepartmentRecruitmentStatusListResponse
from app.services.position_service import position_service

from app.schemas.hr_dashboard import HrDashboardStatsResponse
from app.services.hr_dashboard_service import hr_dashboard_service

router = APIRouter(prefix="/api/hr", tags=["HR"])

@router.post(
    "/users",
    response_model=UserResponse,
    dependencies=[Depends(require_roles(("hr",)))],
)
async def create_interviewer(
    request: UserCreate,
    db: AsyncSession = Depends(get_async_db),
):
    return await user_service.create_user(db, request, role="interviewer")


@router.get(
    "/recruitment-status",
    response_model=DepartmentRecruitmentStatusListResponse,
    dependencies=[Depends(require_roles(("hr",)))],
)
async def get_recruitment_status(
    db: AsyncSession = Depends(get_async_db),
):
    content = await position_service.get_department_recruitment_status(db)
    return {"content": content}

@router.get(
    "/dashboard/stats",
    response_model=HrDashboardStatsResponse,
    response_model_by_alias=True,
    dependencies=[Depends(require_roles(("admin", "hr")))],
)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_async_db),
):
    return await hr_dashboard_service.get_dashboard_stats(db)

