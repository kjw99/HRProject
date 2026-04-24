# routers/tag_router.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from myproduct.schemas.user2 import UserCreate, UserResponse, UserWishlistResponse
from myproduct.schemas.product import ProductResponse
from myproduct.services.user_service2 import user_service
from myproduct.models.user2 import User2
from myproduct.dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, data)

@router.get("", response_model=list[UserResponse])
def read_users(db: Session = Depends(get_db)):
    return user_service.read_users(db)

# 위시리스트 추가
@router.post("/wishlist/{product_id}")
def add_wishlist(product_id: int, db: Session = Depends(get_db), current_user: User2 = Depends(get_current_user)):
    user_service.add_wishlist(db, product_id, current_user)
    return {"message": "위시리스트 추가 완료"}

@router.get("/me/wishlist", response_model=UserWishlistResponse)
def read_user_wishlist(db: Session = Depends(get_db), current_user: User2 = Depends(get_current_user)):
    return user_service.read_user_wishlist(db, current_user)

@router.get("/{user_id}/wishlist/v2", response_model=list[ProductResponse])
def read_user_wishlist_v2(user_id: int, db: Session = Depends(get_db)):
    return user_service.read_user_wishlist_v2(db, user_id)

@router.delete("/wishlist/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_wishlist(product_id: int, db: Session = Depends(get_db), current_user: User2 = Depends(get_current_user)):
    user_service.remove_wishlist(db, current_user, product_id)
    return None # 204 No Content 응답

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User2 = Depends(get_current_user)):
    return current_user

@router.post("/follow/{user_id}")
def add_follow(user_id: int, db: Session = Depends(get_db), current_user: User2 = Depends(get_current_user)):
    return user_service.add_follow(db, user_id, current_user)