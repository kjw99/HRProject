from sqlalchemy import Column, Integer, String, TIMESTAMP, func
#from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, unique=True, nullable=False)
    pw_hash = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="hr")
    created_at = Column(TIMESTAMP, server_default=func.now())