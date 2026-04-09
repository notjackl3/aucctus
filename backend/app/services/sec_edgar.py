"""SEC EDGAR full-text search client — public company filings.

Uses the EDGAR full-text search API (EFTS) which is free, requires no API key,
and returns filing metadata + snippets for 10-K, 10-Q, 8-K, etc.
"""

import logging
from dataclasses import dataclass

import httpx

from app.config import SEC_EDGAR_MAX_RESULTS
from app.services.search import SearchResult

logger = logging.getLogger(__name__)

_EFTS_API = "https://efts.sec.gov/LATEST/search-index"
_FILING_BASE = "https://www.sec.gov/Archives/edgar/data"
_REQUEST_TIMEOUT = 15.0
_USER_AGENT = "Aucctus Research aucctus@example.com"  # SEC requires a user-agent

# Filing types we care about for competitive intelligence
_RELEVANT_FORMS = {"10-K", "10-Q", "8-K", "S-1", "20-F"}


@dataclass
class EdgarFiling:
    """A single SEC filing result."""
    company_name: str
    ticker: str | None
    form_type: str
    filed_date: str
    accession_number: str
    filing_url: str
    snippet: str


async def search_filings(
    query: str,
    max_results: int = SEC_EDGAR_MAX_RESULTS,
    form_types: set[str] | None = None,
) -> tuple[list[SearchResult], list[dict]]:
    """Search EDGAR full-text search for filings matching the query.

    Returns (search_results, raw_metadata_list).
    """
    form_types = form_types or _RELEVANT_FORMS

    params = {
        "q": query,
        "dateRange": "custom",
        "startdt": "2023-01-01",
        "enddt": "2026-12-31",
        "forms": ",".join(form_types),
    }
    headers = {"User-Agent": _USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=_REQUEST_TIMEOUT) as client:
            resp = await client.get(
                "https://efts.sec.gov/LATEST/search-index",
                params=params,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception as e:
        logger.warning(f"SEC EDGAR search failed for '{query[:60]}': {e}")
        return [], []

    hits = data.get("hits", {}).get("hits", [])
    if not hits:
        return [], []

    results: list[SearchResult] = []
    metadata: list[dict] = []

    for hit in hits[:max_results]:
        source = hit.get("_source", {})
        form_type = source.get("form_type", "")
        if form_type not in form_types:
            continue

        company = source.get("entity_name", "Unknown")
        filed = source.get("file_date", "")
        accession = source.get("file_num", "") or hit.get("_id", "")
        snippet = source.get("text", "")[:500] if source.get("text") else ""

        # Build filing URL
        filing_url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company={company}&type={form_type}&dateb=&owner=include&count=10"
        if source.get("file_url"):
            filing_url = source["file_url"]

        title = f"{form_type} — {company}"
        if filed:
            title += f" ({filed})"

        results.append(SearchResult(
            title=title,
            url=filing_url,
            content=snippet or f"{form_type} filing by {company}. Filed {filed}.",
            score=0.85,  # SEC filings are inherently high-quality
            published_date=filed or None,
        ))

        metadata.append({
            "company_name": company,
            "ticker": source.get("ticker"),
            "form_type": form_type,
            "filed_date": filed,
            "accession_number": accession,
            "cik": source.get("entity_id"),
            "file_url": filing_url,
        })

    logger.info(f"SEC EDGAR returned {len(results)} filings for '{query[:60]}'")
    return results, metadata
