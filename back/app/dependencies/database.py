# async_database.py
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

# 드라이버 변경: postgresql:// → postgresql+asyncpg://
SYNC_DATABASE_URL = os.getenv("DATABASE_URL")
ASYNC_DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Async 엔진 생성
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
# async_engine = create_async_engine(
#     ASYNC_DATABASE_URL,
#     echo=True,
#     pool_pre_ping=True,
#     # pool_recycle=1800 
# )

# Async 세션 생성기
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False # async에서는 필수
)

class Base(DeclarativeBase):
    pass

# Async DB 세션 의존성 주입 함수
async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session