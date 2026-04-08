"""Claim extraction + deterministic dedup/contradiction rules.

Implements the v3.1 deterministic rules: entity normalization,
duplicate detection, contradiction nomination.
LLM is used only for initial extraction from source text.
"""

import re
from typing import Any

from pydantic import BaseModel

from app.domain.enums import ClaimType
from app.domain.models import Claim, ContradictionGroup, Source
from app.services import llm
from app.shared.utils import (
    extract_dollar_amount, extract_funding_stage, extract_numbers,
    generate_id, jaccard_similarity, normalize_entity, utc_now,
)


# ── LLM extraction schemas ──

class ExtractedClaim(BaseModel):
    statement: str
    claim_type: str  # market_size, funding, revenue, product, competitive, trend, general
    entities: list[str]
    confidence: int  # 0-100


class ClaimExtractionResult(BaseModel):
    claims: list[ExtractedClaim]


# ── LLM-based claim extraction ──

async def extract_claims_from_sources(
    sources: list[Source],
    analysis_context: str,
    max_claims: int = 8,
) -> list[Claim]:
    """Extract structured claims from source content using LLM."""
    if not sources:
        return []

    # Build context from source snippets
    source_texts = []
    source_id_map: dict[int, str] = {}
    for i, src in enumerate(sources):
        text = src.raw_content or src.snippet or ""
        if text:
            source_texts.append(f"[Source {i+1}: {src.title} ({src.publisher})]\n{text[:1500]}")
            source_id_map[i + 1] = src.id

    if not source_texts:
        return []

    prompt = (
        f"Context: {analysis_context}\n\n"
        f"Sources:\n{''.join(source_texts[:5])}\n\n"
        f"Extract up to {max_claims} factual claims from these sources. "
        f"Focus on: market sizes, funding amounts, revenue figures, competitive positions, "
        f"growth trends, and product capabilities. "
        f"Each claim should be a single, verifiable statement with the entities it references."
    )

    try:
        result = await llm.chat_structured(
            prompt=prompt,
            response_model=ClaimExtractionResult,
            system="You are a research analyst. Extract precise factual claims from sources.",
        )
    except Exception:
        return []

    claims = []
    for ec in result.claims[:max_claims]:
        try:
            ct = ClaimType(ec.claim_type)
        except ValueError:
            ct = ClaimType.GENERAL

        # Map sources — simple heuristic: assign all sources that mention the entities
        matched_source_ids = []
        for i, src in enumerate(sources):
            text = (src.raw_content or src.snippet or "").lower()
            if any(e.lower() in text for e in ec.entities):
                matched_source_ids.append(src.id)
        if not matched_source_ids and sources:
            matched_source_ids = [sources[0].id]

        claims.append(Claim(
            id=generate_id("clm"),
            analysis_id=sources[0].analysis_id,
            statement=ec.statement,
            claim_type=ct,
            entities=ec.entities,
            source_ids=matched_source_ids,
            confidence_score=ec.confidence,
            source_count=len(matched_source_ids),
            created_at=utc_now(),
        ))

    return claims


# ── Deterministic dedup ──

def find_duplicate_pairs(claims: list[Claim]) -> list[tuple[int, int]]:
    """Find pairs of claims that are duplicate candidates. Returns index pairs."""
    pairs = []
    for i in range(len(claims)):
        for j in range(i + 1, len(claims)):
            if _is_duplicate(claims[i], claims[j]):
                pairs.append((i, j))
    return pairs


def _is_duplicate(a: Claim, b: Claim) -> bool:
    """Check if two claims are duplicates using deterministic rules."""
    # Rule 1: Exact text match
    if a.statement.lower().strip() == b.statement.lower().strip():
        return True

    # Rule 2: High Jaccard overlap
    if jaccard_similarity(a.statement, b.statement) > 0.80:
        return True

    # Rule 3: Same numeric + same entity
    a_entities = {normalize_entity(e) for e in a.entities}
    b_entities = {normalize_entity(e) for e in b.entities}
    if a_entities & b_entities:
        a_nums = extract_numbers(a.statement)
        b_nums = extract_numbers(b.statement)
        if a_nums and b_nums and a_nums[0] == b_nums[0]:
            return True

    # Rule 4: Same source URL
    if set(a.source_ids) & set(b.source_ids) and jaccard_similarity(a.statement, b.statement) > 0.5:
        return True

    return False


def merge_duplicate_claims(claims: list[Claim]) -> list[Claim]:
    """Merge duplicate claims, keeping the stronger one."""
    pairs = find_duplicate_pairs(claims)
    if not pairs:
        return claims

    merged_out: set[int] = set()
    result = list(claims)

    for i, j in pairs:
        if i in merged_out or j in merged_out:
            continue
        a, b = result[i], result[j]
        # Keep the one with more sources, or longer statement
        if b.source_count > a.source_count or (
            b.source_count == a.source_count and len(b.statement) > len(a.statement)
        ):
            keeper, loser = j, i
        else:
            keeper, loser = i, j

        # Merge sources
        all_sources = list(set(result[keeper].source_ids + result[loser].source_ids))
        result[keeper].source_ids = all_sources
        result[keeper].source_count = len(all_sources)
        result[keeper].confidence_score = min(
            result[keeper].confidence_score + 5, 100
        )  # boost for corroboration
        merged_out.add(loser)

    return [c for i, c in enumerate(result) if i not in merged_out]


# ── Deterministic contradiction detection ──

def find_contradictions(
    claims: list[Claim],
    analysis_id: str,
) -> list[ContradictionGroup]:
    """Find contradiction groups among claims using deterministic rules."""
    groups = []
    seen_pairs: set[tuple[str, str]] = set()

    for i in range(len(claims)):
        for j in range(i + 1, len(claims)):
            a, b = claims[i], claims[j]
            pair_key = (min(a.id, b.id), max(a.id, b.id))
            if pair_key in seen_pairs:
                continue

            contradiction_type = _check_contradiction(a, b)
            if contradiction_type:
                seen_pairs.add(pair_key)
                # Only surface if at least one has decent confidence
                if a.confidence_score < 50 and b.confidence_score < 50:
                    continue
                # Don't surface if same sources
                if set(a.source_ids) == set(b.source_ids):
                    continue

                groups.append(ContradictionGroup(
                    id=generate_id("ctg"),
                    analysis_id=analysis_id,
                    claim_ids=[a.id, b.id],
                    description=f"Sources disagree: \"{a.statement[:80]}\" vs \"{b.statement[:80]}\" ({contradiction_type})",
                    created_at=utc_now(),
                ))

    return groups


def _check_contradiction(a: Claim, b: Claim) -> str | None:
    """Check if two claims contradict. Returns contradiction type or None."""
    if _is_numeric_contradiction(a, b):
        return "numeric"
    if _is_funding_contradiction(a, b):
        return "funding"
    if _is_directional_contradiction(a, b):
        return "directional"
    return None


def _is_numeric_contradiction(a: Claim, b: Claim) -> bool:
    if a.claim_type != b.claim_type:
        return False
    a_entities = {normalize_entity(e) for e in a.entities}
    b_entities = {normalize_entity(e) for e in b.entities}
    if not a_entities & b_entities:
        return False
    a_nums = extract_numbers(a.statement)
    b_nums = extract_numbers(b.statement)
    if not a_nums or not b_nums:
        return False
    ratio = max(a_nums[0], b_nums[0]) / max(min(a_nums[0], b_nums[0]), 0.01)
    return ratio > 1.25


def _is_funding_contradiction(a: Claim, b: Claim) -> bool:
    if a.claim_type != ClaimType.FUNDING or b.claim_type != ClaimType.FUNDING:
        return False
    a_entities = {normalize_entity(e) for e in a.entities}
    b_entities = {normalize_entity(e) for e in b.entities}
    if not a_entities & b_entities:
        return False
    a_stage = extract_funding_stage(a.statement)
    b_stage = extract_funding_stage(b.statement)
    if a_stage and b_stage and a_stage == b_stage:
        a_amt = extract_dollar_amount(a.statement)
        b_amt = extract_dollar_amount(b.statement)
        if a_amt and b_amt:
            ratio = max(a_amt, b_amt) / max(min(a_amt, b_amt), 0.01)
            return ratio > 1.15
    return False


DIRECTIONAL_PAIRS = [
    (r"growing|increasing|expanding|accelerating", r"declining|shrinking|contracting|decelerating"),
    (r"leader|dominant|leading", r"losing|lagging|falling behind"),
    (r"profitable|profit", r"unprofitable|loss|losing money"),
]


def _is_directional_contradiction(a: Claim, b: Claim) -> bool:
    a_entities = {normalize_entity(e) for e in a.entities}
    b_entities = {normalize_entity(e) for e in b.entities}
    if not a_entities & b_entities:
        return False
    for pos_pattern, neg_pattern in DIRECTIONAL_PAIRS:
        a_pos = bool(re.search(pos_pattern, a.statement, re.I))
        a_neg = bool(re.search(neg_pattern, a.statement, re.I))
        b_pos = bool(re.search(pos_pattern, b.statement, re.I))
        b_neg = bool(re.search(neg_pattern, b.statement, re.I))
        if (a_pos and b_neg) or (a_neg and b_pos):
            return True
    return False
