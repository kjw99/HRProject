from pydantic import BaseModel, ConfigDict
from myproduct.schemas.product import ProductResponse
from myproduct.schemas.wishlist2 import WishlistResponse
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str
    nickname: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    email: str
    nickname: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserWishlistResponse(UserResponse):
    products: list[ProductResponse] = []
    create_at: list[WishlistResponse] = []