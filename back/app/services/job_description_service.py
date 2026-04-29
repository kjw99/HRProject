from dataclasses import dataclass
from pathlib import Path
import re

from app.core.exceptions import NotFoundException
from app.models.position import Position


JD_FILE_PATH = Path(__file__).resolve().parents[1] / "ai" / "jd" / "jd.md"
POSITION_SECTION_PATTERN = re.compile(r"^##\s+3\.(\d+)\s+(.+?)\s*$")
POSITION_CHAPTER_PATTERN = re.compile(r"^#\s+3\.\s+")
QUESTION_GUIDE_PATTERN = re.compile(r"^#\s+4\.\s+")
MAX_CONTEXT_LENGTH = 12000


@dataclass(frozen=True)
class JobDescriptionSection:
    section_number: str
    title: str
    body: str


class JobDescriptionService:
    def get_context_for_position(
        self,
        position: Position,
        section_number: str | None = None,
    ) -> str:
        document = self._read_document()
        sections = self._extract_position_sections(document)

        selected_section = self._select_section(
            sections=sections,
            position=position,
            section_number=section_number,
        )
        common_context = self._extract_common_context(document)
        question_guide = self._extract_question_guide(document)

        parts = [
            common_context,
            selected_section.body,
            question_guide,
        ]
        return self._truncate("\n\n".join(part for part in parts if part.strip()))

    def _read_document(self) -> str:
        if not JD_FILE_PATH.exists():
            raise NotFoundException("Job description file not found.")

        try:
            return JD_FILE_PATH.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError:
            return JD_FILE_PATH.read_text(encoding="cp949")

    def _extract_position_sections(
        self,
        document: str,
    ) -> list[JobDescriptionSection]:
        lines = document.splitlines()
        sections: list[JobDescriptionSection] = []
        current_header_index: int | None = None
        current_number: str | None = None
        current_title: str | None = None

        for index, line in enumerate(lines):
            match = POSITION_SECTION_PATTERN.match(line)
            if not match:
                continue

            if current_header_index is not None and current_number and current_title:
                body = "\n".join(lines[current_header_index:index]).strip()
                sections.append(
                    JobDescriptionSection(
                        section_number=current_number,
                        title=current_title,
                        body=body,
                    )
                )

            current_header_index = index
            current_number = match.group(1)
            current_title = match.group(2).strip()

        if current_header_index is not None and current_number and current_title:
            end_index = len(lines)
            for index in range(current_header_index + 1, len(lines)):
                if QUESTION_GUIDE_PATTERN.match(lines[index]):
                    end_index = index
                    break

            sections.append(
                JobDescriptionSection(
                    section_number=current_number,
                    title=current_title,
                    body="\n".join(lines[current_header_index:end_index]).strip(),
                )
            )

        if not sections:
            raise NotFoundException("Job description sections not found.")

        return sections

    def _select_section(
        self,
        sections: list[JobDescriptionSection],
        position: Position,
        section_number: str | None,
    ) -> JobDescriptionSection:
        normalized_section_number = self._normalize_section_number(section_number)
        if normalized_section_number:
            for section in sections:
                if section.section_number == normalized_section_number:
                    return section

            raise NotFoundException("Matching job description section not found.")

        normalized_position_name = self._normalize_text(position.position_name)
        for section in sections:
            normalized_title = self._normalize_text(section.title)
            if (
                normalized_position_name == normalized_title
                or normalized_position_name in normalized_title
                or normalized_title in normalized_position_name
            ):
                return section

        for section in sections:
            if section.section_number == str(position.position_id):
                return section

        raise NotFoundException("Matching job description section not found.")

    def _extract_common_context(self, document: str) -> str:
        lines = document.splitlines()
        selected_lines: list[str] = []

        for line in lines:
            if POSITION_CHAPTER_PATTERN.match(line):
                break

            selected_lines.append(line)

        return "\n".join(selected_lines).strip()

    def _extract_question_guide(self, document: str) -> str:
        lines = document.splitlines()

        for index, line in enumerate(lines):
            if QUESTION_GUIDE_PATTERN.match(line):
                return "\n".join(lines[index:]).strip()

        return ""

    def _normalize_section_number(self, value: str | None) -> str | None:
        if not value:
            return None

        stripped_value = value.strip()
        if not stripped_value:
            return None

        if stripped_value.startswith("3."):
            return stripped_value.removeprefix("3.").strip()

        return stripped_value

    def _normalize_text(self, value: str | None) -> str:
        return re.sub(r"\s+", "", value or "").casefold()

    def _truncate(self, text: str) -> str:
        if len(text) <= MAX_CONTEXT_LENGTH:
            return text

        return text[:MAX_CONTEXT_LENGTH].rstrip()


job_description_service = JobDescriptionService()
