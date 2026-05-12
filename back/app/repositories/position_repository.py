from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
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


position_repository = PositionRepository()
