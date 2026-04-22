# services/tag_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from myproduct.models.user2 import User2
from myproduct.models.wishlist2 import Wishlist2
from myproduct.models.follow import Follow
from myproduct.schemas.user2 import UserCreate, UserWishlistResponse
from myproduct.repositories.user_repository2 import user_repository
from myproduct.repositories.wishlist_repository2 import wishlist_repository
from myproduct.repositories.product_repository import product_repository

class UserService:
    def create_user(self, db: Session, data: UserCreate):
        with db.begin():
            existing_user = user_repository.find_by_nickname(db, data.nickname)
            if existing_user:
                raise HTTPException(status_code=400, detail="이미 존재하는 닉네임입니다.")

            new_user = User2(nickname=data.nickname)

            user_repository.save(db, new_user)

        db.refresh(new_user)
        return new_user

    def read_users(self, db: Session):
        return user_repository.find_all(db)
    
    def read_user_by_id(self, db: Session, id: int):
        user = user_repository.find_by_id(db, id)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "존재하지 않는 유저입니다.")
        return user
    
    def add_wishlist(self, db: Session, product_id: int, current_user: User2):

        # 물품 조회
        product = product_repository.find_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "없는 물품 id입니다."
            )

        # 중복 확인
        if wishlist_repository.exists(db, current_user.id, product.id):
            raise HTTPException(status_code=400, detail="이미 찜 목록에에 추가된 물품입니다.")

        # 연결 객체 생성 및 저장
        new_link = Wishlist2(user2=current_user, product=product)
        # wishlist_repository.save(db, new_link)

        # 이것도 가능.            
        current_user.wish_list2.append(new_link)
        db.commit()
    
    def read_user_wishlist(self, db: Session, current_user: User2):
        user = self.read_user_by_id(db, current_user.id)
        user.create_at = wishlist_repository.find_by_user(db, current_user.id)

        db.commit()
        db.refresh(user)
        return user
    
    def read_user_wishlist_v2(self, db: Session, user_id: int):
        return product_repository.find_by_wishlist_user(user_id, db)

    def remove_wishlist(self, db: Session, current_user: User2, product_id: int):
        # 유저 조회
        user = self.read_user_by_id(db, current_user.id)

        # 물품 조회            
        product = product_repository.find_by_id(db, product_id)
        if not product:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "없는 id입니다."
            )

        # 3. 관계 존재 확인 및 삭제
        if product not in user.products:
            raise HTTPException(status_code=400, detail="이 물품은 찜등록 되어 있지 않습니다.")
        
        # Association Proxy를 통해 리스트에서 제거
        # delete-orphan 설정 덕분에 PostTag 레코드가 DB에서 실제로 삭제됨
        user.products.remove(product)
        db.commit()
        
        return {"message": "위시리스트 제거 완료"}
    
    def add_follow(self, db: Session, user_id: int, current_user: User2):
        if current_user.id == user_id:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "자기 자신을 팔로우할 수 없습니다."
            )
        
        user = self.read_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "없는 유저 id입니다."
            )
        
        # 중복 확인
        if user_repository.follow_exists(db, user_id, current_user):
            raise HTTPException(status_code=400, detail="이미 팔로우 한 유저입니다.")

        new_follow = Follow(following_id = current_user.id, follower_id = user_id)
        user_repository.follow_save(db, new_follow)
        db.commit()
        
        return {"message": "팔로우 추가 완료"}

user_service = UserService()