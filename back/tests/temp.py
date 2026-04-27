# from sqlalchemy import create_engine
# import os
# from dotenv import load_dotenv

# load_dotenv()

# SYNC_DATABASE_URL = os.getenv("DATABASE_URL")
# SYNC_DATABASE_URL = SYNC_DATABASE_URL.replace("+asyncpg", "")
# engine = create_engine(SYNC_DATABASE_URL)


# try:
#     conn = engine.connect()
#     print("✅ Connected successfully!")
#     conn.close()
# except Exception as e:
#     print("❌ Connection failed:", e)

# uvicorn app.main:app --reload