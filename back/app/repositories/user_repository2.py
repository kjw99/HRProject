# repositories/tag_repository.py
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from myproduct.models.user2 import User2
from myproduct.models.wishlist2 import Wishlist2
from myproduct.models.follow import Follow

class UserRepository:
    def save(self, db: Session, user: User2):
        db.add(user)
        return user

    def find_all(self, db: Session):
        # scalars().all()을 사용하여 Tag 객체 리스트를 가져온다.
        return db.scalars(select(User2)).all()
    
    def find_by_id(self, db: Session, id: int):
        # 기본키(Primary Key)를 이용한 조회는 db.get이 가장 빠르고 효율적이다.
        return db.get(User2, id)
    
    def find_by_email(self, db: Session, email: str):
        stmt = select(User2).where(User2.email == email)
        return db.scalars(stmt).first()
    
    def find_by_id_with_wishlist_product(self, user_id, db: Session):
        return db.get(User2, user_id, 
                      options=[selectinload(User2.wish_list).joinedload(Wishlist2.product)]
                      )

    def find_by_nickname(self, db: Session, nickname: str):
        return db.scalar(select(User2).where(User2.nickname == nickname))
    
    def follow_exists(self, db: Session, user_id: int, current_user: User2):
        # 이미 팔로우 한 상태인지 확인
        stmt = select(Follow).where(
            Follow.following_id == current_user.id, Follow.follower_id == user_id
        )
        return db.scalar(stmt) is not None
    
    def follow_save(self, db: Session, follow: Follow):
        db.add(follow)
        return follow

user_repository = UserRepository()