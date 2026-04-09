"""Shared utilities — ID generation, timestamps, text helpers, serialization."""

from __future__ import annotations

import re
import secrets
import string
from datetime import datetime, timezone
from urllib.parse import urlparse


def generate_id(prefix: str = "") -> str:
    """Generate a short random ID with optional prefix. e.g. 'ana_k7x2m9p1'."""
    chars = string.ascii_lowercase + string.digits
    random_part = "".join(secrets.choice(chars) for _ in range(8))
    return f"{prefix}_{random_part}" if prefix else random_part


def utc_now() -> str:
    """ISO 8601 UTC timestamp string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def to_camel(name: str) -> str:
    """Convert snake_case to camelCase."""
    parts = name.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


# ── Text utilities ──

def normalize_entity(name: str) -> str:
    """Normalize company/entity names for matching."""
    name = name.strip().lower()
    for suffix in [" inc", " inc.", " corp", " corp.", " ltd", " ltd.",
                   " llc", " co.", " plc", " gmbh", " s.a.", " pty"]:
        if name.endswith(suffix):
            name = name[:-len(suffix)].rstrip(",. ")
    if name.startswith("the "):
        name = name[4:]
    return " ".join(name.split())


def extract_numbers(text: str) -> list[float]:
    """Extract numeric values from text, handling $, B, M, K suffixes."""
    results = []
    for match in re.finditer(r'\$?([\d,]+\.?\d*)\s*([BMKbmk](?:illion|illion)?)?', text):
        num_str = match.group(1).replace(",", "")
        try:
            val = float(num_str)
        except ValueError:
            continue
        suffix = (match.group(2) or "").upper()
        if suffix.startswith("B"):
            val *= 1_000_000_000
        elif suffix.startswith("M"):
            val *= 1_000_000
        elif suffix.startswith("K"):
            val *= 1_000
        results.append(val)
    return results


def extract_dollar_amount(text: str) -> float | None:
    """Extract the first dollar amount from text."""
    match = re.search(r'\$([\d,]+\.?\d*)\s*([BMK])?', text, re.I)
    if not match:
        return None
    val = float(match.group(1).replace(",", ""))
    suffix = (match.group(2) or "").upper()
    if suffix == "B":
        val *= 1_000_000_000
    elif suffix == "M":
        val *= 1_000_000
    elif suffix == "K":
        val *= 1_000
    return val


_STAGE_PATTERNS = {
    "seed": r"\bseed\b",
    "series_a": r"\bseries\s*a\b",
    "series_b": r"\bseries\s*b\b",
    "series_c": r"\bseries\s*c\b",
    "series_d": r"\bseries\s*d\b",
}


def extract_funding_stage(text: str) -> str | None:
    """Extract funding stage keyword from text."""
    text_lower = text.lower()
    for stage, pattern in _STAGE_PATTERNS.items():
        if re.search(pattern, text_lower):
            return stage
    return None


def jaccard_similarity(a: str, b: str) -> float:
    """Word-level Jaccard similarity between two strings."""
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)


def extract_domain(url: str) -> str:
    """Extract domain from URL."""
    try:
        parsed = urlparse(url)
        return parsed.netloc.lower().removeprefix("www.")
    except Exception:
        return ""
