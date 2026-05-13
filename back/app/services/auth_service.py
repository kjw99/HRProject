from app.repositories.user_repository import user_repository
from app.core.security import verify_password, create_access_token
from app.core.exceptions import UnauthorizedException
from app.schemas.user import TokenResponse, UserInfo

class AuthService:
    async def login(self, db, data):

        user = await user_repository.get_user_by_email(db, data.user_email)
        
        if not user:
            raise UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.")            

        if not verify_password(data.password, user.pw_hash):
            raise UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.")

        access_token = create_access_token(
            user.user_id, user.role
        )

        token = TokenResponse(
            access_token=access_token,
            user=UserInfo(
                user_id=user.user_id,
                user_email=user.user_email,
                user_name=user.user_name,
                role=user.role,
                created_at=user.created_at,
            )
        )

        return token

auth_service = AuthService()


