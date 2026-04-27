from app.repositories.user_repository import user_repository
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException
from app.schemas.user import TokenResponse, UserInfo

class AuthService:
    async def signup(self, db, data):
        existing_user = await user_repository.get_user_by_email(db, data.user_email)

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already exists")

        hashed_pw = get_password_hash(data.password)

        user = await user_repository.create_user(
            db,
            email=data.user_email,
            password_hash=hashed_pw,
            name=data.user_name,
            role=data.role
        )

        return user


    async def signin(self, db, data):
        user = await user_repository.get_user_by_email(db, data.user_email)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email")

        if not verify_password(data.password, user.pw_hash):
            raise HTTPException(status_code=401, detail="Invalid password")

        access_token = create_access_token(
            user.user_id, user.role
        )

        token = TokenResponse(
            access_token=access_token,
            user=UserInfo(
                user_id=user.user_id,
                user_name=user.user_name,
                role=user.role
            )
        )

        return token

auth_service = AuthService()