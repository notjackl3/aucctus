"""Tavily search wrapper + document text extraction + caching."""

import logging
import time
from dataclasses import dataclass

from tavily import AsyncTavilyClient

from app.config import TAVILY_API_KEY, TAVILY_MAX_RESULTS, TAVILY_DEFAULT_SEARCH_DEPTH

logger = logging.getLogger(__name__)

_client: AsyncTavilyClient | None = None

# ── Tavily usage tracking ──
_tavily_call_count: int = 0
_tavily_credit_estimate: int = 0


def get_tavily_stats() -> dict:
    """Return session-level Tavily usage stats."""
    return {
        "calls": _tavily_call_count,
        "estimated_credits": _tavily_credit_estimate,
    }


def reset_tavily_stats() -> None:
    global _tavily_call_count, _tavily_credit_estimate
    _tavily_call_count = 0
    _tavily_credit_estimate = 0


def _get_client() -> AsyncTavilyClient:
    global _client
    if _client is None:
        _client = AsyncTavilyClient(api_key=TAVILY_API_KEY)
    return _client


@dataclass
class SearchResult:
    title: str
    url: str
    content: str
    score: float
    published_date: str | None = None


# ── In-memory query cache with TTL ──
_cache: dict[str, tuple[float, list[SearchResult]]] = {}
_CACHE_TTL_SECONDS = 24 * 3600  # 24 hours


def _cache_key(query: str, max_results: int, search_depth: str) -> str:
    """Normalized cache key."""
    return f"{query.strip().lower()}|{max_results}|{search_depth}"


def clear_search_cache() -> None:
    _cache.clear()


async def search(
    query: str,
    max_results: int = TAVILY_MAX_RESULTS,
    search_depth: str = TAVILY_DEFAULT_SEARCH_DEPTH,
    include_raw_content: bool = False,
) -> list[SearchResult]:
    """Run a Tavily search with caching and usage tracking."""
    global _tavily_call_count, _tavily_credit_estimate

    # Check cache
    key = _cache_key(query, max_results, search_depth)
    if key in _cache:
        cached_time, cached_results = _cache[key]
        if time.time() - cached_time < _CACHE_TTL_SECONDS:
            logger.debug(f"Tavily cache hit for '{query[:60]}...'")
            return cached_results
        else:
            del _cache[key]

    # Call Tavily
    client = _get_client()
    _tavily_call_count += 1
    credits = 2 if search_depth == "advanced" else 1
    _tavily_credit_estimate += credits
    logger.info(f"Tavily search #{_tavily_call_count} ({credits}cr, {search_depth}): '{query[:80]}'")

    try:
        response = await client.search(
            query=query,
            max_results=max_results,
            search_depth=search_depth,
            include_raw_content=include_raw_content,
        )
    except Exception as e:
        logger.error(f"Tavily search error for '{query}': {e}")
        return []

    results = []
    for item in response.get("results", []):
        results.append(SearchResult(
            title=item.get("title", ""),
            url=item.get("url", ""),
            content=item.get("content", ""),
            score=item.get("score", 0.0),
            published_date=item.get("published_date"),
        ))

    # Cache results
    _cache[key] = (time.time(), results)

    return results


def extract_text_from_bytes(content: bytes, content_type: str) -> str:
    """Extract text from uploaded file bytes. Supports plain text and basic PDF."""
    if "text" in content_type:
        return content.decode("utf-8", errors="replace")

    if "pdf" in content_type:
        # Basic PDF text extraction — look for text streams
        text = content.decode("latin-1", errors="replace")
        # Simple heuristic: extract text between BT and ET markers
        import re
        chunks = []
        for match in re.finditer(r'\(([^)]+)\)', text):
            chunk = match.group(1)
            if len(chunk) > 3 and any(c.isalpha() for c in chunk):
                chunks.append(chunk)
        if chunks:
            return " ".join(chunks)
        # Fallback: just decode what we can
        return text[:10000]

    return content.decode("utf-8", errors="replace")
