from pydantic import BaseModel


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
