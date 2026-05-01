from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.models.position import Position
from app.repositories.position_repository import position_repository
from app.schemas.position import PositionCreate, PositionUpdate


class PositionService:
    async def create_position(self, db: AsyncSession, data: PositionCreate):
        position = Position(
            position_name=data.position_name,
        )

        position_repository.save(db, position)
        await db.commit()
        await db.refresh(position)

        return position

    async def get_positions(self, db: AsyncSession) -> list[Position]:
        return await position_repository.find_all(db)

    async def update_position(
        self,
        db: AsyncSession,
        position_id: int,
        data: PositionUpdate,
    ) -> Position:
        position = await position_repository.find_by_id(db, position_id)

        if not position:
            raise NotFoundException("직무를 찾을 수 없습니다.")

        update_data = data.model_dump(exclude_unset=True)
        for field_name, value in update_data.items():
            setattr(position, field_name, value)

        await db.commit()
        await db.refresh(position)

        return position

    async def delete_position(self, db: AsyncSession, position_id: int) -> None:
        position = await position_repository.find_by_id(db, position_id)

        if not position:
            raise NotFoundException("직무를 찾을 수 없습니다.")

        if await position_repository.has_blocking_references(db, position_id):
            raise ConflictException("지원서 또는 이력서에서 사용 중인 직무는 삭제할 수 없습니다.")

        await position_repository.delete(db, position)
        await db.commit()


position_service = PositionService()
