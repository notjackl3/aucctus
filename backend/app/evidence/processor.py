"""Evidence processor — source dedup, tiering, normalization, scoring.

Processes raw search results into Source records with tiers and scores.
"""

from app.domain.enums import SourceTier
from app.domain.models import Source
from app.evidence.ranking import tier_source, tier_confidence_weight
from app.services.search import SearchResult
from app.shared.utils import extract_domain, generate_id, utc_now


def process_search_results(
    results: list[SearchResult],
    analysis_id: str,
    existing_urls: set[str] | None = None,
    provider: str = "tavily",
    source_category: str = "web",
) -> list[Source]:
    """Deduplicate and tier search results into Source records."""
    existing_urls = existing_urls or set()
    seen_urls: set[str] = set()
    sources: list[Source] = []

    for result in results:
        # URL-based dedup
        url_normalized = result.url.rstrip("/").lower()
        if url_normalized in seen_urls or url_normalized in existing_urls:
            continue
        seen_urls.add(url_normalized)

        # Extract publisher from domain if not in title
        publisher = _infer_publisher(result.url, result.title)
        tier = tier_source(result.url, publisher)

        sources.append(Source(
            id=generate_id("src"),
            analysis_id=analysis_id,
            url=result.url,
            title=result.title,
            publisher=publisher,
            tier=tier,
            snippet=result.content[:500] if result.content else None,
            published_date=result.published_date,
            raw_content=result.content,
            relevance_score=result.score,
            provider=provider,
            source_category=source_category,
            created_at=utc_now(),
        ))

    return sources


def calculate_source_confidence(sources: list[Source]) -> dict:
    """Calculate aggregate confidence from a set of sources."""
    if not sources:
        return {"level": "low", "score": 30, "reasoning": "No sources found."}

    # Weighted score based on tier
    total_weight = 0.0
    weighted_score = 0.0
    for s in sources:
        w = tier_confidence_weight(s.tier)
        total_weight += w
        weighted_score += w * s.relevance_score

    avg_score = (weighted_score / total_weight) if total_weight > 0 else 0

    # Scale to 0-100 and factor in source count
    count_bonus = min(len(sources) * 5, 20)  # up to +20 for many sources
    tier_1_count = sum(1 for s in sources if s.tier == SourceTier.TIER_1)
    tier_bonus = tier_1_count * 5  # +5 per tier-1 source

    score = int(min(avg_score * 80 + count_bonus + tier_bonus, 100))
    score = max(score, 20)  # floor at 20

    if score >= 75:
        level = "high"
    elif score >= 50:
        level = "medium"
    else:
        level = "low"

    tier_breakdown = f"{tier_1_count} tier-1, {sum(1 for s in sources if s.tier == SourceTier.TIER_2)} tier-2"
    providers = set(getattr(s, 'provider', 'tavily') for s in sources)
    provider_note = ""
    if len(providers) > 1:
        provider_note = f" Sources from {len(providers)} providers ({', '.join(sorted(providers))})."
    reasoning = f"Based on {len(sources)} sources ({tier_breakdown}).{provider_note} "
    if tier_1_count > 0:
        reasoning += "Includes major analyst/publication sources."
    else:
        reasoning += "No major analyst sources — estimates may be less reliable."

    return {"level": level, "score": score, "reasoning": reasoning}


def _infer_publisher(url: str, title: str) -> str:
    """Infer publisher name from URL domain."""
    domain = extract_domain(url)
    # Common domain → name mappings
    _DOMAIN_NAMES = {
        "techcrunch.com": "TechCrunch",
        "forbes.com": "Forbes",
        "bloomberg.com": "Bloomberg",
        "reuters.com": "Reuters",
        "wsj.com": "Wall Street Journal",
        "ft.com": "Financial Times",
        "theinformation.com": "The Information",
        "crunchbase.com": "Crunchbase",
        "cbinsights.com": "CB Insights",
        "pitchbook.com": "PitchBook",
        "gartner.com": "Gartner",
        "mckinsey.com": "McKinsey & Company",
        "grandviewresearch.com": "Grand View Research",
        "marketsandmarkets.com": "MarketsandMarkets",
        "statista.com": "Statista",
        "cnbc.com": "CNBC",
        "venturebeat.com": "VentureBeat",
        "wired.com": "Wired",
        "axios.com": "Axios",
        "fortune.com": "Fortune",
    }
    return _DOMAIN_NAMES.get(domain, domain.split(".")[0].capitalize() if domain else "Unknown")
