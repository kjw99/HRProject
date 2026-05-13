from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.hr_dashboard_repository import hr_dashboard_repository
from app.schemas.hr_dashboard import HrDashboardStatsResponse


KST = ZoneInfo("Asia/Seoul")


class HrDashboardService:
    async def get_dashboard_stats(
        self,
        db: AsyncSession,
    ) -> HrDashboardStatsResponse:
        now = datetime.now(KST)

        today = now.date()
        today_start = datetime.combine(today, time.min, tzinfo=KST)
        tomorrow_start = today_start + timedelta(days=1)

        active_recruiting_count = (
            await hr_dashboard_repository.count_active_recruiting_slots(db, now)
        )
        today_interviewee_count = (
            await hr_dashboard_repository.count_today_interviewees(
                db,
                today_start,
                tomorrow_start,
            )
        )
        # active_position_count = (
        #     await hr_dashboard_repository.count_active_positions(db, now)
        # )

        return HrDashboardStatsResponse(
            active_recruiting_count=active_recruiting_count,
            today_interviewee_count=today_interviewee_count,
            # active_position_count=active_position_count,
        )


hr_dashboard_service = HrDashboardService()
