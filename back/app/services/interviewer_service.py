from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.models.interviewer import Interviewer
from app.repositories.interviewer_repository import interviewer_repository
from app.repositories.position_repository import position_repository
from app.schemas.interviewer import InterviewerCreate, InterviewerUpdate


class InterviewerService:
    async def create_interviewer(
        self,
        db: AsyncSession,
        data: InterviewerCreate,
    ):
        existing = await interviewer_repository.get_by_email(
            db,
            data.interviewer_email,
        )

        if existing:
            raise BadRequestException("이미 존재하는 이메일입니다.")

        if data.position_id is not None:
            await self._validate_position(db, data.position_id)

        interviewer = Interviewer(
            interviewer_email=data.interviewer_email,
            interviewer_name=data.interviewer_name,
            position_id=data.position_id,
            interview_round=data.interview_round,
        )

        await interviewer_repository.create(db, interviewer)

        await db.commit()
        await db.refresh(interviewer)

        return await interviewer_repository.get_by_id(db, interviewer.interviewer_id)

    async def get_interviewers(
        self,
        db: AsyncSession,
        page: int,
        size: int,
        keyword: str | None,
        position_id: int | None = None,
        interview_round: str | None = None,
    ):
        if position_id is not None:
            await self._validate_position(db, position_id)

        interviewers, total = await interviewer_repository.get_list(
            db,
            page,
            size,
            keyword,
            position_id,
            interview_round,
        )

        return {
            "content": interviewers,
            "page": page,
            "size": size,
            "total_elements": total,
            "total_pages": (total + size - 1) // size,
        }

    async def get_interviewer(
        self,
        db: AsyncSession,
        interviewer_id: int,
    ):
        interviewer = await interviewer_repository.get_by_id(db, interviewer_id)

        if not interviewer:
            raise NotFoundException("면접관을 찾을 수 없습니다.")

        return interviewer

    async def update_interviewer(
        self,
        db: AsyncSession,
        interviewer_id: int,
        data: InterviewerUpdate,
    ):
        interviewer = await interviewer_repository.get_by_id(db, interviewer_id)

        if not interviewer:
            raise NotFoundException("면접관을 찾을 수 없습니다.")

        update_data = data.model_dump(exclude_unset=True)

        if "interviewer_email" in update_data:
            existing = await interviewer_repository.get_by_email(
                db,
                update_data["interviewer_email"],
            )
            if existing and existing.interviewer_id != interviewer_id:
                raise BadRequestException("이미 존재하는 이메일입니다.")

        if "position_id" in update_data and update_data["position_id"] is not None:
            await self._validate_position(db, update_data["position_id"])

        assignment_fields_changed = bool(
            {"position_id", "interview_round"} & set(update_data)
        )

        for field_name, value in update_data.items():
            setattr(interviewer, field_name, value)

        if assignment_fields_changed:
            await db.flush()
            await interviewer_repository.delete_invalid_assignments_for_interviewer(
                db,
                interviewer,
            )

        await db.commit()
        await db.refresh(interviewer)

        return await interviewer_repository.get_by_id(db, interviewer_id)

    async def delete_interviewer(
        self,
        db: AsyncSession,
        interviewer_id: int,
    ):
        interviewer = await interviewer_repository.get_by_id(db, interviewer_id)

        if not interviewer:
            raise NotFoundException("면접관을 찾을 수 없습니다.")

        await interviewer_repository.delete_assignments_by_interviewer_id(
            db,
            interviewer_id,
        )
        await interviewer_repository.delete(db, interviewer)
        await db.commit()

        return {
            "message": "면접관이 삭제되었습니다.",
        }

    async def _validate_position(
        self,
        db: AsyncSession,
        position_id: int,
    ) -> None:
        position = await position_repository.find_by_id(db, position_id)
        if not position:
            raise NotFoundException("직무를 찾을 수 없습니다.")


interviewer_service = InterviewerService()
