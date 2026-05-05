from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.candidate import Candidate


class CandidateRepository:
    async def find_by_id(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Candidate | None:
        return await db.get(Candidate, candidate_id)

    async def find_by_id_with_position(
        self,
        db: AsyncSession,
        candidate_id: int,
    ) -> Candidate | None:
        result = await db.scalars(
            select(Candidate)
            .where(Candidate.candidate_id == candidate_id)
            .options(selectinload(Candidate.position))
        )
        return result.one_or_none()

    async def find_by_identity(
        self,
        db: AsyncSession,
        email: str | None,
        phone: str | None,
        name: str | None,
    ) -> Candidate | None:
        if email:
            candidate = await db.scalar(
                select(Candidate)
                .where(Candidate.email == email)
                .order_by(Candidate.candidate_id.asc())
                .limit(1)
            )
            if candidate is not None:
                return candidate

        if phone and name:
            return await db.scalar(
                select(Candidate)
                .where(
                    Candidate.phone == phone,
                    Candidate.name == name,
                )
                .order_by(Candidate.candidate_id.asc())
                .limit(1)
            )

        return None

    def save(self, db: AsyncSession, candidate: Candidate) -> Candidate:
        db.add(candidate)
        return candidate


candidate_repository = CandidateRepository()
