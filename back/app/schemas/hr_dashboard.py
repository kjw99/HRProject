from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class RecruitmentStat(BaseModel):
    intervieweeCount: int
    applicantCount: int


class DepartmentRecruitmentStatus(BaseModel):
    id: int
    deptName: str
    currentProgress: str
    experienced: RecruitmentStat
    newcomer: RecruitmentStat


class DepartmentRecruitmentStatusListResponse(BaseModel):
    content: list[DepartmentRecruitmentStatus]


class HrDashboardStatsResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    active_recruiting_count: int
    today_interviewee_count: int
    # active_position_count: int

