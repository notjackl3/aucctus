"""Tavily search wrapper + document text extraction."""

import logging
from dataclasses import dataclass

from tavily import AsyncTavilyClient

from app.config import TAVILY_API_KEY, TAVILY_MAX_RESULTS

logger = logging.getLogger(__name__)

_client: AsyncTavilyClient | None = None


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


async def search(
    query: str,
    max_results: int = TAVILY_MAX_RESULTS,
    search_depth: str = "advanced",
    include_raw_content: bool = False,
) -> list[SearchResult]:
    """Run a Tavily search and return structured results."""
    client = _get_client()
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
