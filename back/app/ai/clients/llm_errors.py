import logging
import re

logger = logging.getLogger(__name__)


def map_llm_exception(exc: Exception, fallback: str) -> str:
    """OpenAI / LangChain 예외를 사용자·운영자가 이해할 수 있는 메시지로 변환."""
    message = str(exc).lower()
    error_type = _extract_error_type(exc)

    if (
        "insufficient_quota" in message
        or "exceeded your current quota" in message
        or error_type == "insufficient_quota"
    ):
        return (
            "OpenAI API 사용 한도가 초과되었습니다. "
            "OpenAI 대시보드(결제·플랜)를 확인한 뒤 다시 시도해 주세요."
        )

    if "rate_limit" in message or error_type == "rate_limit_exceeded":
        return "OpenAI API 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."

    if (
        "invalid_api_key" in message
        or "incorrect api key" in message
        or "authentication" in message
        or error_type == "invalid_api_key"
    ):
        return (
            "OpenAI API 키가 올바르지 않습니다. "
            "백엔드 .env의 OPENAI_API_KEY를 확인해 주세요."
        )

    model_match = re.search(r"model [`']([^`']+)[`']", message)
    if "model" in message and ("not found" in message or "does not exist" in message):
        model_name = model_match.group(1) if model_match else "지정한 모델"
        return (
            f"OpenAI 모델({model_name})을 사용할 수 없습니다. "
            "OPENAI_MODEL 환경 변수를 gpt-4o-mini 등 지원 모델로 설정해 주세요."
        )

    if "connection" in message or "timeout" in message:
        return "OpenAI API에 연결하지 못했습니다. 네트워크와 API 상태를 확인해 주세요."

    logger.warning("LLM call failed: %s", exc, exc_info=True)
    return fallback


def is_rate_limit_exception(exc: Exception) -> bool:
    message = str(exc).lower()
    error_type = _extract_error_type(exc)
    status_code = _extract_status_code(exc)
    return (
        "rate_limit" in message
        or error_type == "rate_limit_exceeded"
        or status_code == 429
    )


def _extract_error_type(exc: Exception) -> str | None:
    body = getattr(exc, "body", None)
    if isinstance(body, dict):
        error = body.get("error")
        if isinstance(error, dict):
            code = error.get("code") or error.get("type")
            if isinstance(code, str):
                return code.lower()

    response = getattr(exc, "response", None)
    if response is not None:
        try:
            payload = response.json()
            error = payload.get("error") if isinstance(payload, dict) else None
            if isinstance(error, dict):
                code = error.get("code") or error.get("type")
                if isinstance(code, str):
                    return code.lower()
        except Exception:
            pass

    return None


def _extract_status_code(exc: Exception) -> int | None:
    status_code = getattr(exc, "status_code", None)
    if isinstance(status_code, int):
        return status_code

    response = getattr(exc, "response", None)
    if response is not None:
        response_status = getattr(response, "status_code", None)
        if isinstance(response_status, int):
            return response_status

    return None
