import os

from app.ai.clients.llm_errors import map_llm_exception
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
            raise ExternalServiceException("이력서 텍스트가 비어 있습니다.")

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
            raise ExternalServiceException(
                map_llm_exception(exc, "AI로 이력서를 파싱하지 못했습니다."),
            ) from exc

        try:
            return ResumeParseAIOutput.model_validate(result)
        except Exception as exc:
            raise ExternalServiceException(
                "AI가 유효하지 않은 이력서 파싱 형식을 반환했습니다."
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
