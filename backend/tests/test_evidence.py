"""Tests for evidence pipeline — deterministic claim rules."""

import pytest

from app.domain.enums import ClaimType
from app.domain.models import Claim
from app.evidence.claims import (
    find_contradictions, find_duplicate_pairs, merge_duplicate_claims,
)
from app.evidence.ranking import tier_source
from app.shared.utils import extract_numbers, normalize_entity, jaccard_similarity


# ── Entity normalization ──

def test_normalize_entity_strips_suffix():
    assert normalize_entity("Stripe Inc.") == "stripe"
    assert normalize_entity("The Ramp Corp") == "ramp"
    assert normalize_entity("SAP Concur LLC") == "sap concur"


def test_normalize_entity_collapses_whitespace():
    assert normalize_entity("  Stripe   Inc  ") == "stripe"


# ── Number extraction ──

def test_extract_numbers_basic():
    assert extract_numbers("$300M") == [300_000_000]
    assert extract_numbers("$1.5B") == [1_500_000_000]
    assert extract_numbers("revenue is $45M") == [45_000_000]


def test_extract_numbers_multiple():
    nums = extract_numbers("From $300M to $500M")
    assert len(nums) == 2


# ── Jaccard similarity ──

def test_jaccard_identical():
    assert jaccard_similarity("hello world", "hello world") == 1.0


def test_jaccard_different():
    assert jaccard_similarity("hello world", "goodbye moon") == 0.0


def test_jaccard_partial():
    sim = jaccard_similarity("Ramp raised $300M Series D", "Ramp raised $300M in Series D funding")
    assert sim > 0.6


# ── Source tiering ──

def test_tier_1_source():
    from app.domain.enums import SourceTier
    assert tier_source("https://www.gartner.com/reviews") == SourceTier.TIER_1
    assert tier_source("https://bloomberg.com/news") == SourceTier.TIER_1


def test_tier_2_source():
    from app.domain.enums import SourceTier
    assert tier_source("https://techcrunch.com/article") == SourceTier.TIER_2
    assert tier_source("https://forbes.com/article") == SourceTier.TIER_2


def test_tier_3_source():
    from app.domain.enums import SourceTier
    assert tier_source("https://randomblog.com/post") == SourceTier.TIER_3


# ── Duplicate detection ──

def _make_claim(statement: str, entities: list[str] = None,
                claim_type: ClaimType = ClaimType.GENERAL,
                source_ids: list[str] = None, confidence: float = 60) -> Claim:
    return Claim(
        id=f"clm_{hash(statement) % 10000}",
        analysis_id="ana_test",
        statement=statement,
        claim_type=claim_type,
        entities=entities or [],
        source_ids=source_ids or ["src_1"],
        confidence_score=confidence,
        source_count=len(source_ids or ["src_1"]),
    )


def test_exact_duplicate():
    a = _make_claim("Ramp reached $300M ARR", ["Ramp"])
    b = _make_claim("Ramp reached $300M ARR", ["Ramp"])
    pairs = find_duplicate_pairs([a, b])
    assert len(pairs) == 1


def test_jaccard_duplicate():
    a = _make_claim("Ramp raised $300M Series D", ["Ramp"])
    b = _make_claim("Ramp raised $300M in Series D funding round", ["Ramp"])
    pairs = find_duplicate_pairs([a, b])
    assert len(pairs) == 1


def test_no_duplicate():
    a = _make_claim("Ramp is growing fast", ["Ramp"])
    b = _make_claim("SAP Concur leads the market", ["SAP Concur"])
    pairs = find_duplicate_pairs([a, b])
    assert len(pairs) == 0


def test_merge_duplicates():
    a = _make_claim("Ramp ARR is $300M", ["Ramp"], source_ids=["src_1"])
    b = _make_claim("Ramp ARR is $300M", ["Ramp"], source_ids=["src_2"])
    merged = merge_duplicate_claims([a, b])
    assert len(merged) == 1
    assert len(merged[0].source_ids) == 2


# ── Contradiction detection ──

def test_numeric_contradiction():
    a = _make_claim("Ramp revenue is $300M", ["Ramp"],
                    ClaimType.REVENUE, ["src_1"], 70)
    b = _make_claim("Ramp revenue is $500M", ["Ramp"],
                    ClaimType.REVENUE, ["src_2"], 70)
    groups = find_contradictions([a, b], "ana_test")
    assert len(groups) == 1
    assert "numeric" in groups[0].description


def test_no_contradiction_same_numbers():
    a = _make_claim("Ramp revenue is $300M", ["Ramp"],
                    ClaimType.REVENUE, ["src_1"], 70)
    b = _make_claim("Ramp revenue hit $300M", ["Ramp"],
                    ClaimType.REVENUE, ["src_2"], 70)
    groups = find_contradictions([a, b], "ana_test")
    assert len(groups) == 0


def test_directional_contradiction():
    a = _make_claim("The market is growing rapidly", ["AI Expense"],
                    ClaimType.TREND, ["src_1"], 70)
    b = _make_claim("The market is declining sharply", ["AI Expense"],
                    ClaimType.TREND, ["src_2"], 70)
    groups = find_contradictions([a, b], "ana_test")
    assert len(groups) == 1


def test_no_contradiction_different_entities():
    a = _make_claim("Ramp revenue is $300M", ["Ramp"],
                    ClaimType.REVENUE, ["src_1"], 70)
    b = _make_claim("Brex revenue is $500M", ["Brex"],
                    ClaimType.REVENUE, ["src_2"], 70)
    groups = find_contradictions([a, b], "ana_test")
    assert len(groups) == 0
