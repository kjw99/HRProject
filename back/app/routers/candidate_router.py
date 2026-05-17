from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.database import get_async_db
from app.dependencies.dependencies import get_current_user
from app.models.user import User
from app.schemas.candidate import CandidateDetailRead, CandidateRead, CandidateUpdate
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/api/candidates", tags=["Candidates"])


@router.get("", response_model=list[CandidateRead])
async def list_candidates(
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    return await candidate_service.get_candidates(db)


@router.get("/{candidate_id}", response_model=CandidateRead)
async def get_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    candidate = await candidate_service.get_candidate(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="지원자를 찾을 수 없습니다.")
    return candidate


@router.get("/{candidate_id}/detail", response_model=CandidateDetailRead)
async def get_candidate_detail(
    candidate_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    candidate = await candidate_service.get_candidate_detail(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="지원자를 찾을 수 없습니다.")
    return candidate


@router.patch("/{candidate_id}", response_model=CandidateRead)
async def update_candidate(
    candidate_id: int,
    data: CandidateUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    updated = await candidate_service.update_candidate(db, candidate_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="수정할 지원자가 존재하지 않습니다.")
    return updated


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(
    candidate_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user),
):
    success = await candidate_service.delete_candidate(db, candidate_id)
    if not success:
        raise HTTPException(status_code=404, detail="삭제할 지원자가 존재하지 않습니다.")
