from fastapi import HTTPException
from app.models.user import User
from app.repositories.user_repository import user_repository 
from app.core.security import get_password_hash

class UserService:
    async def check_email_availability(self, db, email: str):
        user = await user_repository.get_user_by_email(db, email)

        if user:
            return {
                "available": False,
                "message": "이미 사용 중인 이메일입니다."
            }

        return {
            "available": True,
            "message": "사용 가능한 이메일입니다."
        }
    
    async def create_user_service(self, db, request, role: str):
    
        # 1. email check
        existing = await user_repository.get_user_by_email(db, request.user_email)
        if existing:
            raise HTTPException(
                status_code=400,
                detail="이미 존재하는 이메일입니다."
            )
        
        # 2. create user
        user = User(
            user_email=request.user_email,
            pw_hash=get_password_hash(request.password),
            user_name=request.user_name,
            role=role
        )
       
        return await user_repository.create_user(db, user)

user_service = UserService()
