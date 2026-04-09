"""OpenAI service wrapper — chat completions, structured output, embeddings."""

import json
import logging
from typing import Any, TypeVar, Type

from openai import AsyncOpenAI
from pydantic import BaseModel

from app.config import OPENAI_API_KEY, LLM_MODEL_STRONG, LLM_MODEL_FAST, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=OPENAI_API_KEY)
    return _client


T = TypeVar("T", bound=BaseModel)


async def chat(
    prompt: str,
    system: str = "You are a helpful research assistant.",
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    """Simple chat completion returning text."""
    client = _get_client()
    model = model or LLM_MODEL_FAST
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content or ""


async def chat_structured(
    prompt: str,
    response_model: Type[T],
    system: str = "You are a helpful research assistant. Respond with valid JSON.",
    model: str | None = None,
    temperature: float = 0.2,
    max_tokens: int = 4096,
) -> T:
    """Chat completion with structured JSON output parsed into a Pydantic model.

    Uses OpenAI's native structured output (json_schema response_format) for
    reliable schema adherence. Falls back to manual JSON mode if the model
    doesn't support structured outputs.
    """
    client = _get_client()
    model = model or LLM_MODEL_FAST

    # Try native structured output first (supported by gpt-4o, gpt-4o-mini)
    try:
        response = await client.beta.chat.completions.parse(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_model,
        )
        parsed = response.choices[0].message.parsed
        if parsed is not None:
            return parsed
    except Exception as e:
        logger.debug(f"Native structured output failed, falling back to JSON mode: {e}")

    # Fallback: manual JSON schema injection
    schema = response_model.model_json_schema()
    schema_str = json.dumps(schema, indent=2)

    full_prompt = (
        f"{prompt}\n\n"
        f"Respond ONLY with a JSON object (not the schema). "
        f"The JSON must match this schema:\n```json\n{schema_str}\n```"
    )

    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": full_prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content or "{}"
    return response_model.model_validate_json(text)


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Get embeddings for a batch of texts."""
    if not texts:
        return []
    client = _get_client()
    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    return [item.embedding for item in response.data]


async def embed_single(text: str) -> list[float]:
    """Get embedding for a single text."""
    results = await embed_texts([text])
    return results[0] if results else []
