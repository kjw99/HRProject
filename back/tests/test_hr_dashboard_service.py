from datetime import datetime
from zoneinfo import ZoneInfo

from app.services.hr_dashboard_service import HrDashboardService


KST = ZoneInfo("Asia/Seoul")


def test_get_attendance_status_before():
    service = HrDashboardService()
    now = datetime(2026, 5, 18, 9, 0, tzinfo=KST)
    starts_at = datetime(2026, 5, 18, 10, 0, tzinfo=KST)
    ends_at = datetime(2026, 5, 18, 11, 0, tzinfo=KST)

    assert service._get_attendance_status(now, starts_at, ends_at) == "응시 전"


def test_get_attendance_status_in_progress():
    service = HrDashboardService()
    now = datetime(2026, 5, 18, 10, 30, tzinfo=KST)
    starts_at = datetime(2026, 5, 18, 10, 0, tzinfo=KST)
    ends_at = datetime(2026, 5, 18, 11, 0, tzinfo=KST)

    assert service._get_attendance_status(now, starts_at, ends_at) == "응시 중"


def test_get_attendance_status_completed():
    service = HrDashboardService()
    now = datetime(2026, 5, 18, 11, 0, tzinfo=KST)
    starts_at = datetime(2026, 5, 18, 10, 0, tzinfo=KST)
    ends_at = datetime(2026, 5, 18, 11, 0, tzinfo=KST)

    assert service._get_attendance_status(now, starts_at, ends_at) == "응시 완료"


def test_format_time_label():
    service = HrDashboardService()
    starts_at = datetime(2026, 5, 18, 10, 5, tzinfo=KST)
    ends_at = datetime(2026, 5, 18, 11, 45, tzinfo=KST)

    assert service._format_time_label(starts_at, ends_at) == "10:05 - 11:45"
