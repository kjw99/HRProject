from fastapi import HTTPException
from app.models.user import User
from app.repositories.user_repository import user_repository 
from app.core.security import get_password_hash, verify_password

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
    


    async def change_password(self, db, current_user, data):
        
        # 0. basic validation 
        if data.currentPassword == data.newPassword:
            raise HTTPException(status_code=400, detail="새 비밀번호가 기존과 같습니다.")

        if len(data.newPassword) < 8:
            raise HTTPException(status_code=400, detail="비밀번호는 최소 8자 이상입니다.")
        
        
        # 1. check current password
        if not verify_password(data.currentPassword, current_user.pw_hash):
            raise HTTPException(status_code=400, detail="현재 비밀번호가 틀립니다.")

        # 2. hash new password
        new_hash = get_password_hash(data.newPassword)

        # 3. update DB
        current_user.pw_hash = new_hash
        await db.commit()
        await db.refresh(current_user)

        return {
            "message": "비밀번호가 변경되었습니다."
        }
    

    async def get_users(self, db, page, size, keyword):
        offset = page * size

        users, total = await user_repository.get_users(db, offset, size, keyword)

        return {
        "content": users,
        "page": page,
        "size": size,
        "totalElements": total,
        "totalPages": (total + size - 1) // size
        }


    async def get_user_by_id(self, db, user_id):
        user = await user_repository.find_by_id(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        return user
    

    async def delete_user(self, db, user_id):
        user = await user_repository.find_by_id(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

        await user_repository.delete_user(db, user)

        return {
        "message": "계정이 삭제되었습니다."
        }

user_service = UserService()
