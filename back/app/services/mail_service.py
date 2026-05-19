import os
import smtplib
import socket
from email.message import EmailMessage

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    BadRequestException,
    ExternalServiceException,
    NotFoundException,
)
from app.repositories.candidate_repository import candidate_repository


load_dotenv()


class MailService:
    async def get_candidate_email(self, db: AsyncSession, candidate_id: int) -> str:
        candidate = await candidate_repository.find_by_id(db, candidate_id)
        if not candidate:
            raise NotFoundException("Candidate not found.")

        if not candidate.email:
            raise BadRequestException("Candidate email is missing.")

        return candidate.email

    def send_mail(self, to_email: str, subject: str, content: str) -> None:
        user_email = os.getenv("EMAIL_USER")
        user_password = os.getenv("EMAIL_PASS")

        if not user_email or not user_password:
            raise BadRequestException(
                "Email account environment variables are missing."
            )

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = user_email
        msg["To"] = to_email
        msg.set_content(content)

        try:
            self._send_with_best_effort(
                user_email=user_email,
                user_password=user_password,
                message=msg,
            )
        except (smtplib.SMTPException, OSError) as exc:
            raise ExternalServiceException("Failed to send email.") from exc

    def _send_with_best_effort(
        self,
        *,
        user_email: str,
        user_password: str,
        message: EmailMessage,
    ) -> None:
        host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        timeout = self._get_smtp_timeout_seconds()
        prefer_ssl = os.getenv("SMTP_USE_SSL", "true").strip().lower() in {
            "1",
            "true",
            "yes",
            "on",
        }

        # Railway-like environments can fail on IPv6 routes for SMTP.
        # Try IPv4 endpoints only.
        ipv4_targets = self._resolve_ipv4_targets(host)
        if not ipv4_targets:
            ipv4_targets = [host]

        # Order by preferred mode, with fallback to STARTTLS.
        attempts: list[tuple[str, int, str]] = []
        if prefer_ssl:
            attempts.extend(
                [("ssl", self._get_smtp_port(default=465), target) for target in ipv4_targets]
            )
            attempts.extend([("starttls", 587, target) for target in ipv4_targets])
        else:
            attempts.extend(
                [("starttls", self._get_smtp_port(default=587), target) for target in ipv4_targets]
            )
            attempts.extend([("ssl", 465, target) for target in ipv4_targets])

        last_error: Exception | None = None
        for mode, port, target in attempts:
            try:
                if mode == "ssl":
                    with smtplib.SMTP_SSL(target, port, timeout=timeout) as smtp:
                        smtp.login(user_email, user_password)
                        smtp.send_message(message)
                    return

                with smtplib.SMTP(target, port, timeout=timeout) as smtp:
                    smtp.ehlo()
                    smtp.starttls()
                    smtp.ehlo()
                    smtp.login(user_email, user_password)
                    smtp.send_message(message)
                return
            except (smtplib.SMTPException, OSError) as exc:
                last_error = exc

        if last_error is not None:
            raise last_error

    def _get_smtp_timeout_seconds(self) -> float:
        raw = os.getenv("SMTP_TIMEOUT_SECONDS")
        if raw is None:
            return 20.0
        try:
            parsed = float(raw)
        except ValueError:
            return 20.0
        return max(5.0, parsed)

    def _get_smtp_port(self, *, default: int) -> int:
        raw = os.getenv("SMTP_PORT")
        if raw is None:
            return default
        try:
            parsed = int(raw)
        except ValueError:
            return default
        return max(1, min(65535, parsed))

    def _resolve_ipv4_targets(self, host: str) -> list[str]:
        try:
            infos = socket.getaddrinfo(host, None, socket.AF_INET, socket.SOCK_STREAM)
        except OSError:
            return []
        deduped: list[str] = []
        for info in infos:
            ip = info[4][0]
            if ip not in deduped:
                deduped.append(ip)
        return deduped


mail_service = MailService()
