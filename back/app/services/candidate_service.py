# 전체 건우 작성

from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.candidate_repository import candidate_repository
from app.schemas.candidate import CandidateUpdate


class CandidateService:
    async def get_candidates(self, db: AsyncSession):
        # 전체 지원자 목록 조회
        return await candidate_repository.find_all(db)

    async def get_candidate(self, db: AsyncSession, candidate_id: int):
        # 단일 지원자 조회
        return await candidate_repository.find_by_id_with_position(db, candidate_id)

    async def update_candidate(
        self, db: AsyncSession, candidate_id: int, data: CandidateUpdate
    ):
        # 지원자 정보 수정 및 commit
        update_data = data.model_dump(exclude_unset=True)
        updated_candidate = await candidate_repository.update_candidate(
            db, candidate_id, update_data
        )

        if updated_candidate:
            await db.commit()  # 레포지토리의 flush() 이후 최종 커밋
        return updated_candidate

    async def delete_candidate(self, db: AsyncSession, candidate_id: int):
        """지원자 삭제 및 커밋"""
        success = await candidate_repository.delete_candidate(db, candidate_id)
        if success:
            await db.commit()  # 레포지토리의 flush() 이후 최종 커밋
        return success


candidate_service = CandidateService()
