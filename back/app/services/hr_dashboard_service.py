from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.hr_dashboard_repository import hr_dashboard_repository
from app.schemas.hr_interview_schedule import (
    AttendanceStatus,
    TodayInterviewScheduleItemResponse,
    TodayInterviewScheduleListResponse,
)
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

    async def get_today_interview_schedules(
        self,
        db: AsyncSession,
    ) -> TodayInterviewScheduleListResponse:
        now = datetime.now(KST)
        today_start, tomorrow_start = self._get_today_range(now)
        bookings = await hr_dashboard_repository.find_today_interview_bookings(
            db,
            today_start,
            tomorrow_start,
        )

        items = [
            TodayInterviewScheduleItemResponse(
                slot_id=booking.slot.slot_id,
                booking_id=booking.booking_id,
                candidate_id=booking.candidate_id,
                interview_starts_at=booking.slot.interview_starts_at,
                interview_ends_at=booking.slot.interview_ends_at,
                interview_time_label=self._format_time_label(
                    booking.slot.interview_starts_at,
                    booking.slot.interview_ends_at,
                ),
                candidate_name=(booking.candidate.name or "-") if booking.candidate else "-",
                position_name=(
                    booking.slot.position.position_name
                    if booking.slot and booking.slot.position
                    else None
                ),
                interview_round=booking.slot.interview_round,
                attendance_status=self._get_attendance_status(
                    now,
                    booking.slot.interview_starts_at,
                    booking.slot.interview_ends_at,
                ),
            )
            for booking in bookings
            if booking.slot is not None
        ]

        return TodayInterviewScheduleListResponse(items=items)

    def _get_attendance_status(
        self,
        now: datetime,
        starts_at: datetime,
        ends_at: datetime,
    ) -> AttendanceStatus:
        if now < starts_at:
            return "응시 전"
        if now < ends_at:
            return "응시 중"
        return "응시 완료"

    def _format_time_label(self, starts_at: datetime, ends_at: datetime) -> str:
        local_starts_at = starts_at.astimezone(KST)
        local_ends_at = ends_at.astimezone(KST)
        return f"{local_starts_at:%H:%M} - {local_ends_at:%H:%M}"

    def _get_today_range(self, now: datetime) -> tuple[datetime, datetime]:
        today = now.date()
        today_start = datetime.combine(today, time.min, tzinfo=KST)
        tomorrow_start = today_start + timedelta(days=1)
        return today_start, tomorrow_start


hr_dashboard_service = HrDashboardService()
