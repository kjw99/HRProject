from __future__ import annotations

import json
import os
import re
from typing import Any

from ParsingToExcel import (
    K_CAREER_CO,
    K_CAREER_PD,
    K_CAREER_ROLE,
    K_DESIRED_LOCATION,
    K_DESIRED_SALARY,
    K_EDUCATION_ROWS,
    K_EXPERIENCE_ROWS,
    K_FINAL_EDU,
    K_ORIGINAL_JOB_ROLE,
    K_QUALIFICATION_ROWS,
    K_STATEMENT_ROWS,
)


def _anonymize_text_if_enabled(body: str) -> str:
    if os.getenv("AI_ANONYMIZE", "true").strip().lower() not in {
        "1",
        "true",
        "yes",
        "on",
    }:
        return body

    masked = body
    masked = re.sub(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "[email]",
        masked,
    )
    masked = re.sub(
        r"(?:010|011|016|017|018|019|02|0[3-6]\d|070)[-\s]?\d{3,4}[-\s]?\d{4}",
        "[phone]",
        masked,
    )
    masked = re.sub(r"\b\d{6}[-\s]?\d{7}\b", "[personal-id]", masked)
    masked = re.sub(r"\b\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\b", "[date]", masked)
    return masked


def _row_lines(title: str, rows: list[dict[str, Any]]) -> list[str]:
    out: list[str] = [f"### {title}"]
    if not rows:
        out.append("- Not extracted.")
        return out

    for index, row in enumerate(rows, 1):
        out.append(f"- Item {index}: {json.dumps(row, ensure_ascii=False, default=str)}")

    return out


def build_resume_prompt_text(parsed: dict[str, Any]) -> str:
    lines: list[str] = [
        "## Resume Summary",
        f"- Original job role text: {parsed.get(K_ORIGINAL_JOB_ROLE, '')}",
        f"- Final education: {parsed.get(K_FINAL_EDU, '')}",
        f"- Desired location: {parsed.get(K_DESIRED_LOCATION, '')}",
        f"- Desired salary: {parsed.get(K_DESIRED_SALARY, '')}",
        "",
        "## Career",
        f"- Period: {parsed.get(K_CAREER_PD, '')}",
        f"- Company: {parsed.get(K_CAREER_CO, '')}",
        f"- Role: {parsed.get(K_CAREER_ROLE, '')}",
        "",
    ]
    lines.extend(_row_lines("Education", parsed.get(K_EDUCATION_ROWS) or []))
    lines.append("")
    lines.extend(_row_lines("Experience", parsed.get(K_EXPERIENCE_ROWS) or []))
    lines.append("")
    lines.extend(_row_lines("Qualifications", parsed.get(K_QUALIFICATION_ROWS) or []))
    lines.append("")
    lines.extend(_row_lines("Statements", parsed.get(K_STATEMENT_ROWS) or []))

    body = "\n".join(lines).strip()
    return _anonymize_text_if_enabled(body)
