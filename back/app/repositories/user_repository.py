from sqlalchemy.future import select
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession

class UserRepository:
    async def get_user_by_email(self, db, email: str):
        result = await db.execute(select(User).where(User.user_email == email))
        return result.scalar_one_or_none()
    
    async def find_by_id(self, db: AsyncSession, user_id: int):
        return await db.get(User, user_id)

    async def create_user(self, db, email: str, password_hash: str, name: str, role: str):
        user = User(
            user_email=email,
            pw_hash=password_hash,
            user_name=name,
            role=role
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

user_repository = UserRepository()