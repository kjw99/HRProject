from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.candidate_repository import candidate_repository
from app.schemas.candidate import CandidateDetailRead, CandidateUpdate


class CandidateService:
    async def get_candidates(self, db: AsyncSession):
        return await candidate_repository.find_all(db)

    async def get_candidate(self, db: AsyncSession, candidate_id: int):
        return await candidate_repository.find_by_id_with_position(db, candidate_id)

    async def get_candidate_detail(
        self, db: AsyncSession, candidate_id: int
    ) -> CandidateDetailRead | None:
        candidate = await candidate_repository.find_by_id_with_details(db, candidate_id)
        if not candidate:
            return None

        invitations = sorted(
            candidate.booking_invitations,
            key=lambda invitation: invitation.created_at,
            reverse=True,
        )

        return CandidateDetailRead(
            candidate_id=candidate.candidate_id,
            position_id=candidate.position_id,
            name=candidate.name,
            date_of_birth=candidate.date_of_birth,
            gender=candidate.gender,
            address=candidate.address,
            phone=candidate.phone,
            email=candidate.email,
            experience_level=candidate.experience_level,
            application_status=candidate.application_status,
            final_status=candidate.final_status,
            meets_preferred_criteria=candidate.meets_preferred_criteria,
            position_name=candidate.position.position_name
            if candidate.position is not None
            else None,
            created_at=candidate.created_at,
            updated_at=candidate.updated_at,
            booking_invitations=[
                {
                    "invitation_id": invitation.invitation_id,
                    "candidate_id": invitation.candidate_id,
                    "slot_ids": invitation.allowed_slot_ids or [],
                    "expires_at": invitation.expires_at,
                    "created_at": invitation.created_at,
                    "revoked_at": invitation.revoked_at,
                }
                for invitation in invitations
            ],
        )

    async def update_candidate(
        self, db: AsyncSession, candidate_id: int, data: CandidateUpdate
    ):
        update_data = data.model_dump(exclude_unset=True)
        updated_candidate = await candidate_repository.update_candidate(
            db, candidate_id, update_data
        )

        if updated_candidate:
            await db.commit()
        return updated_candidate

    async def delete_candidate(self, db: AsyncSession, candidate_id: int):
        success = await candidate_repository.delete_candidate(db, candidate_id)
        if success:
            await db.commit()
        return success


candidate_service = CandidateService()
