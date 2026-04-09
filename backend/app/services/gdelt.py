"""GDELT 2.0 DOC API client — news events, tone, themes for market intelligence.

GDELT is free and requires no API key. We query the DOC 2.0 API which returns
news articles matching keyword queries, along with tone/sentiment metadata.
"""

import json
import logging
from dataclasses import dataclass, field

import httpx

from app.config import GDELT_MAX_RESULTS
from app.services.search import SearchResult

logger = logging.getLogger(__name__)

_GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc"
_REQUEST_TIMEOUT = 15.0


@dataclass
class GdeltArticle:
    """Raw article from GDELT DOC API."""
    url: str
    title: str
    source_domain: str
    published_date: str  # YYYYMMDDTHHMMSSZ
    tone: float = 0.0  # average tone (-10 to +10)
    language: str = "English"
    themes: list[str] = field(default_factory=list)


async def search_news(
    query: str,
    max_results: int = GDELT_MAX_RESULTS,
    timespan: str = "6m",
) -> tuple[list[SearchResult], list[dict]]:
    """Search GDELT for news articles matching the query.

    Returns (search_results, raw_metadata_list) where raw_metadata_list
    contains provider-specific payloads for source_metadata storage.
    """
    params = {
        "query": query,
        "mode": "ArtList",
        "maxrecords": str(max_results),
        "timespan": timespan,
        "format": "json",
        "sort": "DateDesc",
    }

    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            resp = await client.get(_GDELT_DOC_API, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        logger.warning(f"GDELT search failed for '{query[:60]}': {e}")
        return [], []

    articles = data.get("articles", [])
    if not articles:
        return [], []

    results: list[SearchResult] = []
    metadata: list[dict] = []

    for art in articles[:max_results]:
        url = art.get("url", "")
        title = art.get("title", "")
        if not url or not title:
            continue

        # Parse GDELT date format → ISO
        raw_date = art.get("seendate", "")
        published = _parse_gdelt_date(raw_date)

        tone = art.get("tone", 0.0)
        if isinstance(tone, str):
            try:
                tone = float(tone.split(",")[0])  # GDELT returns comma-separated tone values
            except (ValueError, IndexError):
                tone = 0.0

        domain = art.get("domain", art.get("sourcecountry", ""))
        themes = [t for t in (art.get("themes", "") or "").split(";") if t.strip()][:10]

        # Build a content snippet from what GDELT provides
        content = title
        if art.get("socialimage"):
            content = f"{title}"  # GDELT DOC API doesn't return article body

        results.append(SearchResult(
            title=title,
            url=url,
            content=content,
            score=_tone_to_relevance(tone),
            published_date=published,
        ))

        metadata.append({
            "gdelt_url": url,
            "tone": tone,
            "themes": themes[:10],
            "domain": domain,
            "language": art.get("language", "English"),
            "source_country": art.get("sourcecountry", ""),
        })

    logger.info(f"GDELT returned {len(results)} articles for '{query[:60]}'")
    return results, metadata


def _parse_gdelt_date(raw: str) -> str | None:
    """Convert GDELT date (YYYYMMDDTHHmmSSZ or YYYYMMDDHHMMSS) to ISO."""
    if not raw:
        return None
    # Strip non-digits, take first 8 for date
    digits = "".join(c for c in raw if c.isdigit())
    if len(digits) >= 8:
        return f"{digits[:4]}-{digits[4:6]}-{digits[6:8]}"
    return None


def _tone_to_relevance(tone: float) -> float:
    """Map GDELT tone (-10 to +10) to a 0-1 relevance-like score.

    We care about the magnitude of tone (strong sentiment = more signal),
    not just positivity. Neutral articles score lower.
    """
    magnitude = min(abs(tone), 10.0)
    return 0.3 + (magnitude / 10.0) * 0.5  # Range: 0.3 to 0.8
