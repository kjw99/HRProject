import os
from functools import lru_cache

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from app.core.exceptions import ExternalServiceException


DEFAULT_MODEL = "gpt-5.4-mini"
DEFAULT_TEMPERATURE = 0.2


@lru_cache
def get_chat_model() -> ChatOpenAI:
    load_dotenv()

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ExternalServiceException("OPENAI_API_KEY is not configured.")

    model = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
    temperature_value = os.getenv("OPENAI_TEMPERATURE")

    try:
        temperature = (
            float(temperature_value)
            if temperature_value is not None
            else DEFAULT_TEMPERATURE
        )
    except ValueError as exc:
        raise ExternalServiceException(
            "OPENAI_TEMPERATURE must be a number."
        ) from exc

    return ChatOpenAI(
        model=model,
        temperature=temperature,
    )
