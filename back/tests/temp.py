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


# {
#   "user_email": "test@test.com",
#   "password": "password123!",
#   "user_name": "Test User"
# }


# curl -X POST http://127.0.0.1:8000/api/auth/login \
#   -H "Content-Type: application/json" \
#   -d '{
#     "user_email": "admin@company.com",
#     "password": "admin123!"
# }'