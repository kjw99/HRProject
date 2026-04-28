from app.repositories.user_repository import user_repository
from app.core.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException
from app.schemas.user import TokenResponse, UserInfo

class AuthService:
   
    async def login(self, db, data):
        
        user = await user_repository.get_user_by_email(db, data.user_email)
        # user = await user_repository.get_user_by_email(db, data.username)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email")

        if not verify_password(data.password, user.pw_hash):
            raise HTTPException(status_code=401, detail="Invalid password")

        access_token = create_access_token(
            {
                "sub": str(user.user_id),
                "role": user.role
            }
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