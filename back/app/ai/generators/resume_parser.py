import os

from app.ai.clients.openai_client import get_chat_model
from app.ai.prompts.resume_parse_prompt import build_resume_parse_messages
from app.ai.schemas.resume_parsing import ResumeParseAIOutput
from app.core.exceptions import ExternalServiceException


DEFAULT_MAX_RESUME_PARSE_CHARS = 30000


class ResumeParser:
    async def parse(
        self,
        raw_text: str,
        filename: str | None = None,
    ) -> ResumeParseAIOutput:
        cleaned_text = raw_text.strip()
        if not cleaned_text:
            raise ExternalServiceException("Resume text is empty.")

        try:
            llm = get_chat_model().with_structured_output(ResumeParseAIOutput)
            result = await llm.ainvoke(
                build_resume_parse_messages(
                    self._truncate(cleaned_text),
                    filename=filename,
                )
            )
        except ExternalServiceException:
            raise
        except Exception as exc:
            raise ExternalServiceException("Failed to parse resume with AI.") from exc

        try:
            return ResumeParseAIOutput.model_validate(result)
        except Exception as exc:
            raise ExternalServiceException(
                "AI returned an invalid resume parse format."
            ) from exc

    def _truncate(self, value: str) -> str:
        max_chars = self._get_max_chars()
        if len(value) <= max_chars:
            return value

        return value[:max_chars].rstrip()

    def _get_max_chars(self) -> int:
        raw_value = os.getenv("RESUME_PARSE_MAX_CHARS")
        if raw_value is None:
            return DEFAULT_MAX_RESUME_PARSE_CHARS

        try:
            parsed_value = int(raw_value)
        except ValueError:
            return DEFAULT_MAX_RESUME_PARSE_CHARS

        return max(1000, parsed_value)


resume_parser = ResumeParser()
