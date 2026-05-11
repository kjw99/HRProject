# app/services/interviewer_service.py

from fastapi import HTTPException

from app.models.interviewer import Interviewer
from app.repositories.interviewer_repository import (
    interviewer_repository
)


class InterviewerService:

    async def create_interviewer(
        self,
        db,
        data
    ):
        existing = await interviewer_repository.get_by_email(
            db,
            data.interviewer_email
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="이미 존재하는 이메일입니다."
            )

        interviewer = Interviewer(
            interviewer_email=data.interviewer_email,
            interviewer_name=data.interviewer_name
        )

        return await interviewer_repository.create(
            db,
            interviewer
        )

    async def get_interviewers(
        self,
        db,
        page: int,
        size: int,
        keyword: str | None
    ):
        interviewers, total = (
            await interviewer_repository.get_list(
                db,
                page,
                size,
                keyword
            )
        )

        return {
            "content": interviewers,
            "page": page,
            "size": size,
            "total_elements": total,
            "total_pages": (
                (total + size - 1) // size
            )
        }

    async def get_interviewer(
        self,
        db,
        interviewer_id: int
    ):
        interviewer = (
            await interviewer_repository.get_by_id(
                db,
                interviewer_id
            )
        )

        if not interviewer:
            raise HTTPException(
                status_code=404,
                detail="면접관을 찾을 수 없습니다."
            )

        return interviewer

    async def update_interviewer(
        self,
        db,
        interviewer_id: int,
        data
    ):
        interviewer = (
            await interviewer_repository.get_by_id(
                db,
                interviewer_id
            )
        )

        if not interviewer:
            raise HTTPException(
                status_code=404,
                detail="면접관을 찾을 수 없습니다."
            )

        if data.interviewer_email is not None:
            interviewer.interviewer_email = (
                data.interviewer_email
            )

        if data.interviewer_name is not None:
            interviewer.interviewer_name = (
                data.interviewer_name
            )

        await db.commit()
        await db.refresh(interviewer)

        return interviewer

    async def delete_interviewer(
        self,
        db,
        interviewer_id: int
    ):
        interviewer = (
            await interviewer_repository.get_by_id(
                db,
                interviewer_id
            )
        )

        if not interviewer:
            raise HTTPException(
                status_code=404,
                detail="면접관을 찾을 수 없습니다."
            )

        await interviewer_repository.delete(
            db,
            interviewer
        )

        return {
            "message": "면접관이 삭제되었습니다."
        }


interviewer_service = InterviewerService()