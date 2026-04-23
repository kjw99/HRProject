
from dotenv import load_dotenv
import os

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL 환경변수가 설정되지 않았습니다.")

# postgresql:// → postgresql+asyncpg://
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_async_engine(ASYNC_DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as db:
        yield db



# import os
# from dotenv import load_dotenv
# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, DeclarativeBase

# # 환경 변수 로드
# load_dotenv()
# DATABASE_URL = os.getenv("DATABASE_URL")

# # DB 엔진 생성
# engine = create_engine(DATABASE_URL)

# # 세션 생성기 정의
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # SQLAlchemy 2.0 스타일의 Base 클래스 선언
# class Base(DeclarativeBase):
#     pass

# # DB 세션 의존성 주입 함수
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()