from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class HrDashboardStatsResponse(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    active_recruiting_count: int
    today_interviewee_count: int
    # active_position_count: int
