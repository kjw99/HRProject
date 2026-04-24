from sqlalchemy.future import select
from models.user import User

async def get_user_by_email(db, email: str):
    result = await db.execute(select(User).where(User.user_email == email))
    return result.scalar_one_or_none()

async def create_user(db, email: str, password_hash: str, name: str, role: str):
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