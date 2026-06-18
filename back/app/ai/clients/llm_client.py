import os
from functools import lru_cache
from typing import Literal

from dotenv import load_dotenv
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from app.core.exceptions import ExternalServiceException


LlmProvider = Literal["openai", "gemini"]

DEFAULT_PROVIDER: LlmProvider = "openai"
DEFAULT_TEMPERATURE = 0.2
DEFAULT_MODELS: dict[LlmProvider, str] = {
    "openai": "gpt-4o-mini",
    "gemini": "gemini-2.5-flash",
}


@lru_cache
def get_chat_model() -> BaseChatModel:
    load_dotenv()

    provider = get_llm_provider()
    model = _get_model(provider)
    temperature = _get_temperature(provider)

    if provider == "openai":
        return ChatOpenAI(
            api_key=_get_api_key("OPENAI_API_KEY"),
            model=model,
            temperature=temperature,
        )

    return ChatGoogleGenerativeAI(
        google_api_key=_get_api_key("GEMINI_API_KEY"),
        model=model,
        temperature=temperature,
    )


def get_llm_provider() -> LlmProvider:
    raw_provider = os.getenv("LLM_PROVIDER", DEFAULT_PROVIDER).strip().lower()
    if raw_provider not in {"openai", "gemini"}:
        raise ExternalServiceException(
            "LLM_PROVIDER는 openai 또는 gemini여야 합니다.",
        )
    return raw_provider


def get_llm_provider_display_name() -> str:
    provider = get_llm_provider()
    return "OpenAI" if provider == "openai" else "Gemini"


def _get_api_key(env_name: str) -> str:
    api_key = os.getenv(env_name, "").strip()
    if api_key:
        return api_key

    raise ExternalServiceException(f"{env_name}가 설정되어 있지 않습니다.")


def _get_model(provider: LlmProvider) -> str:
    model = os.getenv("LLM_MODEL", "").strip()
    if model:
        return model

    provider_model_env = "OPENAI_MODEL" if provider == "openai" else "GEMINI_MODEL"
    provider_model = os.getenv(provider_model_env, "").strip()
    if provider_model:
        return provider_model

    return DEFAULT_MODELS[provider]


def _get_temperature(provider: LlmProvider) -> float:
    raw_value = os.getenv("LLM_TEMPERATURE")
    if raw_value is None:
        raw_value = (
            os.getenv("OPENAI_TEMPERATURE")
            if provider == "openai"
            else os.getenv("GEMINI_TEMPERATURE")
        )

    try:
        return float(raw_value) if raw_value is not None else DEFAULT_TEMPERATURE
    except ValueError as exc:
        raise ExternalServiceException(
            "LLM_TEMPERATURE는 숫자여야 합니다.",
        ) from exc
