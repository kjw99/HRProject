import base64
import json
import os
import re
import tempfile
from datetime import date, datetime
from typing import Any

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

import ParsingToExcel
from ParsingToExcel import (
    K_ADDR,
    K_BIRTH_DATE,
    K_CONTACT,
    K_DESIRED_LOCATION,
    K_DESIRED_SALARY,
    K_EMAIL,
    K_GENDER,
    K_ID,
    K_NAME,
    export_data_list_to_excel_path,
    parse_resume_file,
)

from app.models.candidate import Candidate
from app.models.position import Position
from app.models.resume import Resume


PARSE_UPLOAD_POSITION_NAME = "parse_upload_unclassified"
RAW_TEXT_KEYS = ("rawText", "raw_text", "fullText", "full_text", "text")


def resume_excel_output_basename() -> str:
    return getattr(ParsingToExcel, "OUTPUT_FILENAME", "resume_parse_result.xlsx")


def _empty_to_none(v: object) -> str | None:
    if v is None:
        return None

    s = str(v).strip()
    return s if s else None


def _parse_birth_date(value: object) -> date | None:
    raw = _empty_to_none(value)
    if not raw:
        return None

    m = re.match(r"^\s*(\d{4})\D?(\d{1,2})\D?(\d{1,2})", raw.replace(" ", ""))
    if m:
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            return date(y, mo, d)
        except ValueError:
            if mo == 0 and d == 0:
                try:
                    return date(y, 1, 1)
                except ValueError:
                    return None

            if 1 <= mo <= 12 and d == 0:
                try:
                    return date(y, mo, 1)
                except ValueError:
                    return None

            return None

    for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(raw[:19], fmt).date()
        except ValueError:
            continue

    return None


def _desired_salary_to_int(raw: object) -> int | None:
    s = _empty_to_none(raw)
    if not s:
        return None

    digits = re.sub(r"\D", "", s)
    if not digits:
        return None

    try:
        n = int(digits)
        return n if n > 0 else None
    except ValueError:
        return None


def _ensure_parse_position(session: Session) -> Position:
    row = session.execute(
        select(Position)
        .where(Position.position_name == PARSE_UPLOAD_POSITION_NAME)
        .limit(1)
    ).scalar_one_or_none()

    if row:
        return row

    row = Position(position_name=PARSE_UPLOAD_POSITION_NAME)
    session.add(row)
    session.flush()
    return row


def _json_safe(value: Any) -> Any:
    return json.loads(json.dumps(value, ensure_ascii=False, default=str))


def _extract_raw_text(record: dict[str, Any]) -> str | None:
    for key in RAW_TEXT_KEYS:
        value = _empty_to_none(record.get(key))
        if value:
            return value

    if not record:
        return None

    return json.dumps(record, ensure_ascii=False, indent=2, default=str)


def _extract_ai_profile(record: dict[str, Any]) -> dict[str, Any] | None:
    value = record.get("aiProfile")
    if value is None:
        value = record.get("ai_profile")

    return _json_safe(value) if isinstance(value, dict) else None


class ResumeParseRepository:
    @staticmethod
    async def read_upload_to_tempfile(upload: UploadFile) -> str:
        original = upload.filename or "unnamed"
        ext = os.path.splitext(original)[1] or ".bin"

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await upload.read())

        return tmp.name

    @staticmethod
    def remove_silent(path: str | None) -> None:
        if not path or not os.path.exists(path):
            return

        try:
            os.remove(path)
        except OSError:
            pass

    @staticmethod
    def parse_file_at_path(path: str) -> dict[str, Any]:
        return parse_resume_file(path)

    @staticmethod
    async def persist_parse_to_db(
        session: AsyncSession,
        record: dict[str, Any],
        uploaded_original_name: str | None = None,
    ) -> dict[str, Any]:
        return await session.run_sync(
            lambda sync_session: ResumeParseRepository._persist_parse_to_db_sync(
                sync_session,
                record,
                uploaded_original_name,
            )
        )

    @staticmethod
    def _persist_parse_to_db_sync(
        session: Session,
        record: dict[str, Any],
        uploaded_original_name: str | None = None,
    ) -> dict[str, Any]:
        pos = _ensure_parse_position(session)
        dob = _parse_birth_date(record.get(K_BIRTH_DATE))
        email_val = _empty_to_none(record.get(K_EMAIL))
        phone_val = _empty_to_none(record.get(K_CONTACT))
        name_val = _empty_to_none(record.get(K_NAME))

        cand = None
        if email_val:
            cand = session.execute(
                select(Candidate)
                .where(Candidate.email == email_val)
                .order_by(Candidate.candidate_id.asc())
                .limit(1)
            ).scalar_one_or_none()

        if cand is None and phone_val and name_val:
            cand = session.execute(
                select(Candidate)
                .where(
                    Candidate.phone == phone_val,
                    Candidate.name == name_val,
                )
                .order_by(Candidate.candidate_id.asc())
                .limit(1)
            ).scalar_one_or_none()

        if cand is None:
            cand = Candidate(
                position_id=pos.position_id,
                name=name_val,
                date_of_birth=dob,
                gender=_empty_to_none(record.get(K_GENDER)),
                address=_empty_to_none(record.get(K_ADDR)),
                phone=phone_val,
                email=email_val,
                application_status="서류",
            )
            session.add(cand)
            session.flush()
        else:
            new_name = _empty_to_none(record.get(K_NAME))
            if new_name:
                cand.name = new_name

            if dob:
                cand.date_of_birth = dob

            gender = _empty_to_none(record.get(K_GENDER))
            if gender:
                cand.gender = gender

            address = _empty_to_none(record.get(K_ADDR))
            if address:
                cand.address = address

            phone = _empty_to_none(record.get(K_CONTACT))
            if phone:
                cand.phone = phone

            email = _empty_to_none(record.get(K_EMAIL))
            if email and not _empty_to_none(getattr(cand, "email", None)):
                cand.email = email

            if cand.position_id is None:
                cand.position_id = pos.position_id

        parsed_json = _json_safe(record)
        res = Resume(
            candidate_id=cand.candidate_id,
            desired_location=_empty_to_none(record.get(K_DESIRED_LOCATION)),
            second_position_id=None,
            desired_salary=_desired_salary_to_int(record.get(K_DESIRED_SALARY)),
            file_path=_empty_to_none(uploaded_original_name),
            raw_text=_extract_raw_text(record),
            parsed_json=parsed_json,
            summary=_empty_to_none(record.get("summary")),
            ai_profile=_extract_ai_profile(record),
        )

        session.add(res)

        try:
            session.commit()
            session.refresh(res)
            session.refresh(cand)
        except Exception:
            session.rollback()
            raise

        out = dict(record)
        out[K_ID] = str(res.resume_id)
        return out

    @staticmethod
    def records_to_excel_base64(records: list[dict[str, Any]]) -> str:
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as xtmp:
            xls_path = xtmp.name

        try:
            export_data_list_to_excel_path(records, xls_path)

            with open(xls_path, "rb") as f:
                return base64.standard_b64encode(f.read()).decode("ascii")
        finally:
            if os.path.exists(xls_path):
                try:
                    os.remove(xls_path)
                except OSError:
                    pass
