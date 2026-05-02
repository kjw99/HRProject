import re
import subprocess
import tempfile
from pathlib import Path

import fitz
from docx import Document


class ResumeTextExtractorService:
    def extract_text(self, path: str | Path) -> str:
        file_path = Path(path)
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            return self._extract_pdf(file_path)

        if suffix == ".docx":
            return self._extract_docx(file_path)

        if suffix == ".hwp":
            return self._extract_hwp(file_path)

        if suffix in {".txt", ".md"}:
            return self._extract_plain_text(file_path)

        if suffix in {".doc", ".ppt", ".pptx"}:
            return self._extract_via_libreoffice(file_path)

        raise ValueError(f"Unsupported resume file type: {suffix or 'unknown'}")

    def _extract_pdf(self, path: Path) -> str:
        parts: list[str] = []
        with fitz.open(path) as document:
            for page in document:
                page_text = page.get_text("text")
                if page_text:
                    parts.append(page_text)

        return self._normalize_text("\n".join(parts))

    def _extract_docx(self, path: Path) -> str:
        document = Document(path)
        parts: list[str] = []

        for paragraph in document.paragraphs:
            text = paragraph.text.strip()
            if text:
                parts.append(text)

        for table in document.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    parts.append(" | ".join(cells))

        return self._normalize_text("\n".join(parts))

    def _extract_hwp(self, path: Path) -> str:
        try:
            from hwp5.filestructure import Hwp5File
            from hwp5.recordstream import read_records
        except ImportError as exc:
            raise ValueError("HWP extraction requires pyhwp.") from exc

        document = Hwp5File(str(path))
        parts: list[str] = []

        for section_name in document.text:
            section_stream = document.text[section_name].open()
            for record in read_records(section_stream):
                if record.get("tagid") != 67:
                    continue

                payload = record.get("payload", b"")
                if not payload:
                    continue

                decoded = payload.decode("utf-16-le", errors="ignore")
                cleaned = "".join(
                    character if character >= " " or character in "\n\r\t" else " "
                    for character in decoded
                )
                cleaned = cleaned.strip()
                if cleaned:
                    parts.append(cleaned)

        return self._normalize_text("\n".join(parts))

    def _extract_plain_text(self, path: Path) -> str:
        for encoding in ("utf-8-sig", "utf-8", "cp949"):
            try:
                return self._normalize_text(path.read_text(encoding=encoding))
            except UnicodeDecodeError:
                continue

        return self._normalize_text(path.read_text(errors="ignore"))

    def _extract_via_libreoffice(self, path: Path) -> str:
        with tempfile.TemporaryDirectory() as temp_dir:
            result = subprocess.run(
                [
                    "libreoffice",
                    "--headless",
                    "--convert-to",
                    "pdf",
                    "--outdir",
                    temp_dir,
                    str(path),
                ],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            if result.returncode != 0:
                raise ValueError(
                    "Failed to convert resume to PDF with LibreOffice."
                )

            converted_path = Path(temp_dir) / f"{path.stem}.pdf"
            if not converted_path.exists():
                matches = list(Path(temp_dir).glob("*.pdf"))
                if not matches:
                    raise ValueError("Converted PDF was not created.")

                converted_path = matches[0]

            return self._extract_pdf(converted_path)

    def _normalize_text(self, value: str) -> str:
        normalized = value.replace("\r\n", "\n").replace("\r", "\n")
        normalized = re.sub(r"[ \t]+", " ", normalized)
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)
        return normalized.strip()


resume_text_extractor_service = ResumeTextExtractorService()
