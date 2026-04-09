"""USPTO PatentsView API client — patent filings and innovation signals.

PatentsView is free and requires no API key. We query for recent patents
matching market keywords to surface innovation activity and competitive signals.
"""

import logging

import httpx

from app.config import USPTO_MAX_RESULTS
from app.services.search import SearchResult

logger = logging.getLogger(__name__)

_PATENTS_API = "https://search.patentsview.org/api/v1/patent/"
_REQUEST_TIMEOUT = 15.0


async def search_patents(
    query: str,
    max_results: int = USPTO_MAX_RESULTS,
) -> tuple[list[SearchResult], list[dict]]:
    """Search USPTO PatentsView for patents matching the query.

    Returns (search_results, raw_metadata_list).
    """
    # PatentsView uses a structured query format
    payload = {
        "q": {"_text_any": {"patent_abstract": query}},
        "f": [
            "patent_number", "patent_title", "patent_abstract",
            "patent_date", "assignee_organization",
            "cpc_group_id", "app_date",
        ],
        "o": {"per_page": max_results},
        "s": [{"patent_date": "desc"}],
    }

    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            resp = await client.post(_PATENTS_API, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        logger.warning(f"USPTO search failed for '{query[:60]}': {e}")
        return [], []

    patents = data.get("patents", [])
    if not patents:
        return [], []

    results: list[SearchResult] = []
    metadata: list[dict] = []

    for pat in patents[:max_results]:
        patent_num = pat.get("patent_number", "")
        title = pat.get("patent_title", "")
        abstract = pat.get("patent_abstract", "")
        patent_date = pat.get("patent_date", "")

        if not patent_num or not title:
            continue

        # Assignees
        assignees = pat.get("assignees", [])
        assignee_name = assignees[0].get("assignee_organization", "Unknown") if assignees else "Unknown"

        # CPC codes
        cpcs = pat.get("cpcs", [])
        cpc_codes = [c.get("cpc_group_id", "") for c in cpcs[:5] if c.get("cpc_group_id")]

        url = f"https://patents.google.com/patent/US{patent_num}"

        results.append(SearchResult(
            title=f"Patent: {title}",
            url=url,
            content=abstract[:500] if abstract else title,
            score=0.7,  # Patents are moderately relevant as innovation signals
            published_date=patent_date or None,
        ))

        metadata.append({
            "patent_number": patent_num,
            "patent_title": title,
            "assignee": assignee_name,
            "patent_date": patent_date,
            "application_date": pat.get("app_date"),
            "cpc_codes": cpc_codes,
            "abstract": abstract[:1000] if abstract else "",
        })

    logger.info(f"USPTO returned {len(results)} patents for '{query[:60]}'")
    return results, metadata
