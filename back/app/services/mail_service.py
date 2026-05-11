# Split mailsend.py SMTP_SSL mail sending logic into a service.
import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv

from app.core.exceptions import BadRequestException, ExternalServiceException


load_dotenv()


class MailService:
    def send_mail(self, to_email: str, subject: str, content: str) -> None:
        user_email = os.getenv("EMAIL_USER")
        user_password = os.getenv("EMAIL_PASS")

        if not user_email or not user_password:
            raise BadRequestException("Email account environment variables are missing.")

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = user_email
        msg["To"] = to_email
        msg.set_content(content)

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(user_email, user_password)
                smtp.send_message(msg)
        except (smtplib.SMTPException, OSError) as exc:
            raise ExternalServiceException("Failed to send email.") from exc


mail_service = MailService()