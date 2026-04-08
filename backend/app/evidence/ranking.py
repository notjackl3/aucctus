"""Publisher registry and source tiering."""

from app.domain.enums import SourceTier
from app.shared.utils import extract_domain

# Domain → tier mapping for known publishers
_TIER_1_DOMAINS = {
    "gartner.com", "forrester.com", "mckinsey.com", "bain.com",
    "bcg.com", "deloitte.com", "pwc.com", "kpmg.com", "ey.com",
    "hbr.org", "reuters.com", "bloomberg.com", "wsj.com",
    "ft.com", "nytimes.com", "economist.com",
    "grandviewresearch.com", "marketsandmarkets.com",
    "cbinsights.com", "pitchbook.com", "crunchbase.com",
    "sec.gov", "statista.com",
}

_TIER_2_DOMAINS = {
    "techcrunch.com", "theinformation.com", "semafor.com",
    "forbes.com", "businessinsider.com", "cnbc.com",
    "venturebeat.com", "wired.com", "arstechnica.com",
    "zdnet.com", "theverge.com", "protocol.com",
    "sifted.eu", "axios.com", "fortune.com",
    "seekingalpha.com", "morningstar.com",
}


def tier_source(url: str, publisher: str = "") -> SourceTier:
    """Determine source tier from URL domain or publisher name."""
    domain = extract_domain(url)

    if domain in _TIER_1_DOMAINS:
        return SourceTier.TIER_1
    if domain in _TIER_2_DOMAINS:
        return SourceTier.TIER_2

    # Check publisher name for known names
    pub_lower = publisher.lower()
    for t1 in ["gartner", "forrester", "mckinsey", "bain", "bcg",
               "bloomberg", "reuters", "wall street journal"]:
        if t1 in pub_lower:
            return SourceTier.TIER_1
    for t2 in ["techcrunch", "forbes", "business insider", "cnbc",
               "venture beat", "wired", "fortune"]:
        if t2 in pub_lower:
            return SourceTier.TIER_2

    # Check for academic/gov domains
    if domain.endswith(".gov") or domain.endswith(".edu"):
        return SourceTier.TIER_1

    return SourceTier.TIER_3


def tier_confidence_weight(tier: SourceTier) -> float:
    """Return confidence weight multiplier for a source tier."""
    return {
        SourceTier.TIER_1: 1.0,
        SourceTier.TIER_2: 0.75,
        SourceTier.TIER_3: 0.5,
        SourceTier.UNKNOWN: 0.3,
    }[tier]
