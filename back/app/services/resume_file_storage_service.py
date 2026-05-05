import os
import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile


ALLOWED_RESUME_EXTENSIONS = {
    ".doc",
    ".docx",
    ".hwp",
    ".md",
    ".pdf",
    ".ppt",
    ".pptx",
    ".txt",
}
DEFAULT_UPLOAD_ROOT = "uploads/resumes"


@dataclass(frozen=True)
class StoredResumeFile:
    absolute_path: Path
    db_path: str


class ResumeFileStorageService:
    async def save_upload_file(self, upload: UploadFile) -> StoredResumeFile:
        original_name = Path(upload.filename or "resume").name
        suffix = Path(original_name).suffix.lower()
        if suffix not in ALLOWED_RESUME_EXTENSIONS:
            raise ValueError(f"Unsupported resume file type: {suffix or 'unknown'}")

        today = datetime.now()
        upload_root = self._get_upload_root()
        target_dir = upload_root / f"{today:%Y}" / f"{today:%m}"
        target_dir.mkdir(parents=True, exist_ok=True)

        safe_stem = self._safe_filename_stem(Path(original_name).stem)
        target_path = target_dir / f"{uuid4().hex}_{safe_stem}{suffix}"
        bytes_written = 0

        with target_path.open("wb") as output:
            while chunk := await upload.read(1024 * 1024):
                bytes_written += len(chunk)
                output.write(chunk)

        if bytes_written == 0:
            self.remove_silent(target_path)
            raise ValueError("Uploaded resume file is empty.")

        return StoredResumeFile(
            absolute_path=target_path.resolve(),
            db_path=target_path.as_posix(),
        )

    def remove_silent(self, path: str | Path | None) -> None:
        if path is None:
            return

        try:
            file_path = Path(path)
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
        except OSError:
            pass

    def _get_upload_root(self) -> Path:
        return Path(os.getenv("RESUME_UPLOAD_DIR", DEFAULT_UPLOAD_ROOT))

    def _safe_filename_stem(self, value: str) -> str:
        normalized = unicodedata.normalize("NFKC", value).strip()
        safe_value = re.sub(r"[^A-Za-z0-9._-]+", "_", normalized)
        safe_value = safe_value.strip("._-")
        return (safe_value or "resume")[:80]


resume_file_storage_service = ResumeFileStorageService()
