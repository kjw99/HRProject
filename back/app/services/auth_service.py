from repositories.user_repository import get_user_by_email, create_user
from core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException

async def signup(db, data):
    existing_user = await get_user_by_email(db, data.email)

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pw = get_password_hash(data.password)

    user = await create_user(
        db,
        email=data.email,
        password_hash=hashed_pw,
        name=data.name,
        role=data.role
    )

    return user


async def signin(db, data):
    user = await get_user_by_email(db, data.email)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email")

    if not verify_password(data.password, user.pw_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = create_access_token({
        "user_id": user.user_id,
        "role": user.role
    })

    return token