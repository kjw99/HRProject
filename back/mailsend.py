import os
import smtplib
from dotenv import load_dotenv
from email.message import EmailMessage

# 1. .env 파일의 환경 변수를 불러옵니다.
load_dotenv()

# 환경 변수에서 값 가져오기
USER_EMAIL = os.getenv("EMAIL_USER")
USER_PASSWORD = os.getenv("EMAIL_PASS")

# 2. 메일 객체 생성
msg = EmailMessage()
msg["Subject"] = "환경 변수를 이용한 메일 전송"
msg["From"] = USER_EMAIL
msg["To"] = "kwnam0814@naver.com"
msg.set_content("""
    안녕하세요!    
    테스트 메일 내용입니다!""")

# 3. 메일 전송 (기존 SMTP_SSL 방식 유지)
with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
    smtp.login(USER_EMAIL, USER_PASSWORD)
    smtp.send_message(msg)

print("메일이 성공적으로 발송되었습니다!")
