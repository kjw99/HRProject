from sqlalchemy import String, func, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import association_proxy, AssociationProxy
from database import Base
from typing import TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .wishlist2 import Wishlist2
    from .product import Product
    from .follow import Follow

class User2(Base):
    __tablename__ = "users2"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    nickname: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    wish_list2: Mapped[list["Wishlist2"]] = relationship(
        back_populates="user2", cascade="all, delete-orphan"
    )

    products: AssociationProxy[list["Product"]] = association_proxy(
        "wish_list2", "product"
    )

    following_id: Mapped[list["Follow"]] = relationship(
        back_populates="following_user",
        cascade="all, delete-orphan"
    )
    follower_id: Mapped[list["Follow"]] = relationship(back_populates="follower_user")

