from app.core.exceptions import BadRequestException, DuplicateException,NotFoundException
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
    


    async def create_user(self, db, request, role: str):
    
        # 1. email check
        existing = await user_repository.get_user_by_email(db, request.user_email)
        if existing:
            raise DuplicateException("이미 존재하는 이메일입니다.")
        
        # 2. create user
        user = User(
            user_email=request.user_email,
            pw_hash=get_password_hash(request.password),
            user_name=request.user_name,
            role=role
        )

        user = await user_repository.create_user(db, user)
        await db.commit()
        
        return user

    async def change_password(self, db, current_user, data):
        
        # 0. basic validation
        if data.current_password == data.new_password:
            raise BadRequestException("새 비밀번호가 기존과 같습니다.")

        if len(data.new_password) < 8:
            raise BadRequestException("비밀번호는 최소 8자 이상입니다.")

        # 1. check current password
        if not verify_password(data.current_password, current_user.pw_hash):
            raise BadRequestException("현재 비밀번호가 틀립니다.")

        # 2. hash new password
        new_hash = get_password_hash(data.new_password)
        await user_repository.update_password(db, current_user, new_hash)
        await db.commit()

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
            raise NotFoundException("사용자를 찾을 수 없습니다.")

        return user
    

    async def delete_user(self, db, user_id):
        user = await user_repository.find_by_id(db, user_id)

        if not user:
            raise NotFoundException("사용자를 찾을 수 없습니다.")

        await user_repository.delete_user(db, user)
        await db.commit()

        return {
        "message": "계정이 삭제되었습니다."
        }

user_service = UserService()
