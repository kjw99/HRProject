from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.models.interview_booking import InterviewBooking
from app.models.interview_slot import InterviewSlot
from app.models.position import Position


class PositionRepository:
    def save(self, db: AsyncSession, position: Position) -> Position:
        db.add(position)
        return position

    async def find_all(self, db: AsyncSession) -> list[Position]:
        result = await db.scalars(
            select(Position).order_by(Position.position_id)
        )
        return result.all()

    async def find_by_id(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> Position | None:
        return await db.get(Position, position_id)

    async def has_blocking_references(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> bool:
        reference_queries = [
            select(Candidate.candidate_id)
            .where(Candidate.position_id == position_id)
            .limit(1),
        ]

        for query in reference_queries:
            reference_id = await db.scalar(query)
            if reference_id is not None:
                return True

        return False

    async def delete(self, db: AsyncSession, position: Position) -> None:
        await db.delete(position)

    async def get_department_recruitment_status(self, db: AsyncSession) -> list[dict]:
        normalized_experience = func.coalesce(Candidate.experience_level, "신입")

        applicant_stats_subquery = (
            select(
                Candidate.position_id.label("position_id"),
                func.sum(
                    case((normalized_experience == "경력", 1), else_=0)
                ).label("experienced_applicant_count"),
                func.sum(
                    case((normalized_experience != "경력", 1), else_=0)
                ).label("newcomer_applicant_count"),
            )
            .group_by(Candidate.position_id)
            .subquery()
        )

        valid_interview_slot_condition = and_(
            InterviewSlot.slot_status.in_(("open", "full")),
            InterviewSlot.interview_ends_at > func.now(),
        )

        interviewee_stats_subquery = (
            select(
                InterviewSlot.position_id.label("position_id"),
                func.sum(
                    case((normalized_experience == "경력", 1), else_=0)
                ).label("experienced_interviewee_count"),
                func.sum(
                    case((normalized_experience != "경력", 1), else_=0)
                ).label("newcomer_interviewee_count"),
            )
            .select_from(InterviewBooking)
            .join(Candidate, Candidate.candidate_id == InterviewBooking.candidate_id)
            .join(InterviewSlot, InterviewSlot.slot_id == InterviewBooking.slot_id)
            .where(
                InterviewBooking.cancelled_at.is_(None),
                valid_interview_slot_condition,
            )
            .group_by(InterviewSlot.position_id)
            .subquery()
        )

        active_progress_condition = and_(
            valid_interview_slot_condition,
            or_(
                InterviewSlot.booking_deadline_at.is_(None),
                InterviewSlot.booking_deadline_at >= func.now(),
                and_(
                    InterviewSlot.interview_starts_at <= func.now(),
                    InterviewSlot.interview_ends_at >= func.now(),
                ),
            ),
        )

        progress_subquery = (
            select(
                InterviewSlot.position_id.label("position_id"),
                func.max(
                    case((InterviewSlot.interview_round == "1차", 1), else_=0)
                ).label("has_round_1"),
                func.max(
                    case((InterviewSlot.interview_round == "2차", 1), else_=0)
                ).label("has_round_2"),
                func.max(
                    case((InterviewSlot.interview_round == "3차", 1), else_=0)
                ).label("has_round_3"),
            )
            .where(active_progress_condition)
            .group_by(InterviewSlot.position_id)
            .subquery()
        )

        query = (
            select(
                Position.position_id,
                Position.position_name,
                func.coalesce(
                    applicant_stats_subquery.c.experienced_applicant_count,
                    0,
                ).label("experienced_applicant_count"),
                func.coalesce(
                    applicant_stats_subquery.c.newcomer_applicant_count,
                    0,
                ).label("newcomer_applicant_count"),
                func.coalesce(
                    interviewee_stats_subquery.c.experienced_interviewee_count,
                    0,
                ).label("experienced_interviewee_count"),
                func.coalesce(
                    interviewee_stats_subquery.c.newcomer_interviewee_count,
                    0,
                ).label("newcomer_interviewee_count"),
                func.coalesce(progress_subquery.c.has_round_1, 0).label("has_round_1"),
                func.coalesce(progress_subquery.c.has_round_2, 0).label("has_round_2"),
                func.coalesce(progress_subquery.c.has_round_3, 0).label("has_round_3"),
            )
            .select_from(Position)
            .outerjoin(
                applicant_stats_subquery,
                applicant_stats_subquery.c.position_id == Position.position_id,
            )
            .outerjoin(
                interviewee_stats_subquery,
                interviewee_stats_subquery.c.position_id == Position.position_id,
            )
            .outerjoin(
                progress_subquery,
                progress_subquery.c.position_id == Position.position_id,
            )
            .order_by(Position.position_id)
        )

        rows = (await db.execute(query)).all()

        result: list[dict] = []
        for row in rows:
            current_progress = "진행 중인 면접 없음"
            if row.has_round_3:
                current_progress = "3차 면접 진행중"
            elif row.has_round_2:
                current_progress = "2차 면접 진행중"
            elif row.has_round_1:
                current_progress = "1차 면접 진행중"

            result.append(
                {
                    "id": row.position_id,
                    "deptName": row.position_name,
                    "currentProgress": current_progress,
                    "experienced": {
                        "intervieweeCount": int(row.experienced_interviewee_count),
                        "applicantCount": int(row.experienced_applicant_count),
                    },
                    "newcomer": {
                        "intervieweeCount": int(row.newcomer_interviewee_count),
                        "applicantCount": int(row.newcomer_applicant_count),
                    },
                }
            )

        return result


position_repository = PositionRepository()
