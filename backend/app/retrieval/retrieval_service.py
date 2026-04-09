"""Centralized retrieval service — owns all provider calls and evidence assembly.

Replaces the pattern where each agent calls Tavily/SEC/GDELT/USPTO directly.
The orchestrator calls this service once with the query plan, and receives
partitioned sources + claims ready for each agent to consume.

Flow:
1. Execute provider queries from the query plan (Tavily, SEC EDGAR, GDELT, USPTO)
2. Normalize, deduplicate, and tier all sources
3. Extract claims from merged sources (one LLM call on combined evidence)
4. Partition sources and claims by research dimension
5. Return a RetrievalResult consumed by the orchestrator

Coverage evaluation + bounded refinement are coordinated here too.
"""

import asyncio
import json
import logging
from dataclasses import dataclass, field

from app.config import (
    GDELT_ENABLED, MAX_CLAIMS_PER_AGENT, MAX_REFINEMENT_ATTEMPTS,
    SEC_EDGAR_ENABLED, TAVILY_SEARCHES_PER_AGENT, USPTO_ENABLED,
)
from app.domain.models import Claim, Source
from app.evidence.claims import extract_claims_from_sources, find_contradictions, merge_duplicate_claims
from app.evidence.processor import calculate_source_confidence, process_search_results
from app.persistence import repositories as repo
from app.retrieval.coverage import CoverageReport, evaluate_coverage
from app.retrieval.query_planner import QueryPlan, ProviderQueries, generate_refinement_queries
from app.services import search as search_svc

logger = logging.getLogger(__name__)


# ── Result types ──

@dataclass
class DimensionEvidence:
    """Pre-fetched evidence for a single research dimension."""
    sources: list[Source] = field(default_factory=list)
    claims: list[Claim] = field(default_factory=list)
    confidence: dict = field(default_factory=lambda: {"level": "low", "score": 30, "reasoning": "No sources."})


@dataclass
class RetrievalResult:
    """Full retrieval output partitioned by research dimension."""
    incumbents: DimensionEvidence = field(default_factory=DimensionEvidence)
    emerging: DimensionEvidence = field(default_factory=DimensionEvidence)
    market_sizing: DimensionEvidence = field(default_factory=DimensionEvidence)
    all_sources: list[Source] = field(default_factory=list)
    all_claims: list[Claim] = field(default_factory=list)
    contradictions: list = field(default_factory=list)
    coverage: CoverageReport | None = None


# ── Main entry point ──

async def retrieve_evidence(
    query_plan: QueryPlan,
    analysis_id: str,
) -> RetrievalResult:
    """Execute the full retrieval pipeline using the query plan.

    1. Run provider queries for all three dimensions in parallel
    2. Optionally enrich with SEC EDGAR / GDELT / USPTO
    3. Evaluate coverage, run one bounded refinement if needed
    4. Extract claims from merged sources
    5. Partition results by dimension
    """
    # Step 0: Pre-seed with evidence from prior analyses (Phase 5)
    prior_sources = await _load_prior_evidence(query_plan, analysis_id)
    prior_inc = [s for s in prior_sources if _is_incumbents_source(s)]
    prior_emg = [s for s in prior_sources if _is_emerging_source(s)]
    prior_mkt = [s for s in prior_sources if _is_market_source(s)]

    if prior_sources:
        logger.info(
            f"Reusing {len(prior_sources)} sources from prior analyses "
            f"(inc={len(prior_inc)}, emg={len(prior_emg)}, mkt={len(prior_mkt)})"
        )

    # Step 1: Parallel Tavily retrieval for all dimensions
    inc_sources, emg_sources, mkt_sources = await _fetch_all_dimensions(
        query_plan, analysis_id
    )

    # Merge prior evidence (prepend so they get deduped against new sources)
    inc_sources = prior_inc + inc_sources
    emg_sources = prior_emg + emg_sources
    mkt_sources = prior_mkt + mkt_sources

    # Step 2: Parallel enrichment from secondary providers
    inc_extra, emg_extra, mkt_extra = await _enrich_all_dimensions(
        query_plan, analysis_id, inc_sources, emg_sources, mkt_sources
    )
    inc_sources.extend(inc_extra)
    emg_sources.extend(emg_extra)
    mkt_sources.extend(mkt_extra)

    # Step 3: Coverage evaluation + bounded refinement
    coverage = evaluate_coverage({
        "incumbents": inc_sources,
        "emerging": emg_sources,
        "market_sizing": mkt_sources,
    })

    if coverage.should_refine:
        logger.info(f"Coverage weak ({coverage.overall_score:.2f}), refining: {coverage.weak_dimensions}")
        inc_sources, emg_sources, mkt_sources = await _run_refinement(
            query_plan, analysis_id, coverage,
            inc_sources, emg_sources, mkt_sources,
        )
        # Re-evaluate after refinement
        coverage = evaluate_coverage(
            {
                "incumbents": inc_sources,
                "emerging": emg_sources,
                "market_sizing": mkt_sources,
            },
            refinement_round=1,
        )

    # Step 4: Compute confidence per dimension
    inc_confidence = calculate_source_confidence(inc_sources)
    emg_confidence = calculate_source_confidence(emg_sources)
    mkt_confidence = calculate_source_confidence(mkt_sources)

    # Step 5: Extract claims per dimension (parallel)
    market_space = query_plan.canonical_market_term
    inc_claims_task = extract_claims_from_sources(
        inc_sources, f"Incumbent analysis for {market_space}", MAX_CLAIMS_PER_AGENT
    )
    emg_claims_task = extract_claims_from_sources(
        emg_sources, f"Emerging competitors in {market_space}", MAX_CLAIMS_PER_AGENT
    )
    mkt_claims_task = extract_claims_from_sources(
        mkt_sources, f"Market sizing for {market_space}", MAX_CLAIMS_PER_AGENT
    )
    inc_claims, emg_claims, mkt_claims = await asyncio.gather(
        inc_claims_task, emg_claims_task, mkt_claims_task
    )

    # Step 6: Merge all claims and find contradictions
    all_sources = inc_sources + emg_sources + mkt_sources
    all_claims = inc_claims + emg_claims + mkt_claims
    merged_claims = merge_duplicate_claims(all_claims)
    contradictions = find_contradictions(merged_claims, analysis_id)

    result = RetrievalResult(
        incumbents=DimensionEvidence(
            sources=inc_sources, claims=inc_claims, confidence=inc_confidence,
        ),
        emerging=DimensionEvidence(
            sources=emg_sources, claims=emg_claims, confidence=emg_confidence,
        ),
        market_sizing=DimensionEvidence(
            sources=mkt_sources, claims=mkt_claims, confidence=mkt_confidence,
        ),
        all_sources=all_sources,
        all_claims=merged_claims,
        contradictions=contradictions,
        coverage=coverage,
    )

    logger.info(
        f"Retrieval complete: {len(all_sources)} sources, "
        f"{len(merged_claims)} claims, {len(contradictions)} contradictions, "
        f"coverage={coverage.overall_score:.2f}"
    )

    return result


# ── Provider execution ──

async def _fetch_all_dimensions(
    plan: QueryPlan,
    analysis_id: str,
) -> tuple[list[Source], list[Source], list[Source]]:
    """Run Tavily searches for all three dimensions in parallel."""
    inc_task = _fetch_tavily_for_dimension(
        plan.incumbents_queries.tavily[:TAVILY_SEARCHES_PER_AGENT],
        analysis_id,
        _FALLBACK_INCUMBENTS,
        plan.canonical_market_term,
    )
    emg_task = _fetch_tavily_for_dimension(
        plan.emerging_queries.tavily[:TAVILY_SEARCHES_PER_AGENT],
        analysis_id,
        _FALLBACK_EMERGING,
        plan.canonical_market_term,
    )
    mkt_task = _fetch_tavily_for_dimension(
        plan.market_sizing_queries.tavily[:TAVILY_SEARCHES_PER_AGENT],
        analysis_id,
        _FALLBACK_MARKET_SIZING,
        plan.canonical_market_term,
    )

    return await asyncio.gather(inc_task, emg_task, mkt_task)


async def _fetch_tavily_for_dimension(
    queries: list[str],
    analysis_id: str,
    fallback_templates: list[str],
    market_space: str,
) -> list[Source]:
    """Execute Tavily searches for one dimension, with fallback queries."""
    if not queries:
        queries = [t.format(market_space=market_space) for t in fallback_templates[:TAVILY_SEARCHES_PER_AGENT]]

    all_results = []
    for query in queries:
        try:
            results = await search_svc.search(query, max_results=5)
            all_results.extend(results)
        except Exception as e:
            logger.warning(f"Tavily search failed for '{query[:50]}': {e}")

    return process_search_results(all_results, analysis_id)


async def _enrich_all_dimensions(
    plan: QueryPlan,
    analysis_id: str,
    inc_sources: list[Source],
    emg_sources: list[Source],
    mkt_sources: list[Source],
) -> tuple[list[Source], list[Source], list[Source]]:
    """Run secondary provider enrichment in parallel. Returns extra sources per dimension."""
    tasks = []

    # Incumbents: SEC EDGAR
    should_use_sec = plan.use_sec_edgar and SEC_EDGAR_ENABLED
    tasks.append(
        _enrich_sec_edgar(plan.incumbents_queries, analysis_id, inc_sources)
        if should_use_sec else _empty_sources()
    )

    # Emerging: USPTO + GDELT
    emg_enrichment_tasks = []
    if plan.use_uspto and USPTO_ENABLED:
        emg_enrichment_tasks.append(
            _enrich_uspto(plan.emerging_queries, analysis_id, emg_sources)
        )
    if plan.use_gdelt and GDELT_ENABLED:
        emg_enrichment_tasks.append(
            _enrich_gdelt(plan.emerging_queries, analysis_id, emg_sources, timespan="3m")
        )
    tasks.append(_gather_enrichment(emg_enrichment_tasks))

    # Market sizing: GDELT
    should_use_gdelt_mkt = plan.use_gdelt and GDELT_ENABLED
    tasks.append(
        _enrich_gdelt(plan.market_sizing_queries, analysis_id, mkt_sources, timespan="6m")
        if should_use_gdelt_mkt else _empty_sources()
    )

    inc_extra, emg_extra, mkt_extra = await asyncio.gather(*tasks)
    return inc_extra, emg_extra, mkt_extra


async def _gather_enrichment(tasks: list) -> list[Source]:
    """Gather multiple enrichment tasks into a flat source list."""
    if not tasks:
        return []
    results = await asyncio.gather(*tasks, return_exceptions=True)
    sources = []
    for r in results:
        if isinstance(r, list):
            sources.extend(r)
    return sources


async def _empty_sources() -> list[Source]:
    return []


async def _enrich_sec_edgar(
    pq: ProviderQueries,
    analysis_id: str,
    existing_sources: list[Source],
) -> list[Source]:
    """Fetch SEC EDGAR filings."""
    try:
        from app.services import sec_edgar
        query = pq.sec_edgar[0] if pq.sec_edgar else None
        if not query:
            return []
        results, meta_list = await sec_edgar.search_filings(query, max_results=3)
        if not results:
            return []
        existing_urls = {s.url for s in existing_sources}
        sources = process_search_results(
            results, analysis_id, existing_urls,
            provider="sec_edgar", source_category="regulatory_filing",
        )
        for src, meta in zip(sources, meta_list):
            await repo.create_source_metadata(src.id, "sec_edgar", json.dumps(meta))
        logger.info(f"SEC EDGAR enrichment: {len(sources)} sources")
        return sources
    except Exception as e:
        logger.warning(f"SEC EDGAR enrichment failed: {e}")
        return []


async def _enrich_uspto(
    pq: ProviderQueries,
    analysis_id: str,
    existing_sources: list[Source],
) -> list[Source]:
    """Fetch USPTO patent signals."""
    try:
        from app.services import uspto
        query = pq.uspto[0] if pq.uspto else None
        if not query:
            return []
        results, meta_list = await uspto.search_patents(query, max_results=5)
        if not results:
            return []
        existing_urls = {s.url for s in existing_sources}
        sources = process_search_results(
            results, analysis_id, existing_urls,
            provider="uspto", source_category="patent",
        )
        for src, meta in zip(sources, meta_list):
            await repo.create_source_metadata(src.id, "uspto", json.dumps(meta))
        logger.info(f"USPTO enrichment: {len(sources)} sources")
        return sources
    except Exception as e:
        logger.warning(f"USPTO enrichment failed: {e}")
        return []


async def _enrich_gdelt(
    pq: ProviderQueries,
    analysis_id: str,
    existing_sources: list[Source],
    timespan: str = "3m",
) -> list[Source]:
    """Fetch GDELT news signals."""
    try:
        from app.services import gdelt
        query = pq.gdelt[0] if pq.gdelt else None
        if not query:
            return []
        results, meta_list = await gdelt.search_news(query, max_results=5, timespan=timespan)
        if not results:
            return []
        existing_urls = {s.url for s in existing_sources}
        sources = process_search_results(
            results, analysis_id, existing_urls,
            provider="gdelt", source_category="news_event",
        )
        for src, meta in zip(sources, meta_list):
            await repo.create_source_metadata(src.id, "gdelt", json.dumps(meta))
        logger.info(f"GDELT enrichment: {len(sources)} sources")
        return sources
    except Exception as e:
        logger.warning(f"GDELT enrichment failed: {e}")
        return []


# ── Bounded refinement ──

async def _run_refinement(
    plan: QueryPlan,
    analysis_id: str,
    coverage: CoverageReport,
    inc_sources: list[Source],
    emg_sources: list[Source],
    mkt_sources: list[Source],
) -> tuple[list[Source], list[Source], list[Source]]:
    """Run one bounded refinement pass for weak dimensions."""
    refinement_queries = generate_refinement_queries(plan, coverage.weak_dimensions)

    for dim, pq in refinement_queries.items():
        try:
            for query in pq.tavily[:1]:  # At most 1 extra Tavily query per weak dim
                results = await search_svc.search(query, max_results=5)
                if not results:
                    continue

                if dim == "incumbents":
                    existing_urls = {s.url for s in inc_sources}
                elif dim == "emerging":
                    existing_urls = {s.url for s in emg_sources}
                else:
                    existing_urls = {s.url for s in mkt_sources}

                new_sources = process_search_results(results, analysis_id, existing_urls)
                if new_sources:
                    if dim == "incumbents":
                        inc_sources.extend(new_sources)
                    elif dim == "emerging":
                        emg_sources.extend(new_sources)
                    elif dim == "market_sizing":
                        mkt_sources.extend(new_sources)
                    logger.info(f"Refinement added {len(new_sources)} sources for {dim}")
        except Exception as e:
            logger.warning(f"Refinement for {dim} failed: {e}")

    return inc_sources, emg_sources, mkt_sources


# ── Fallback query templates (used if query plan has no queries) ──

_FALLBACK_INCUMBENTS = [
    "{market_space} market leaders competitive landscape",
    "{market_space} enterprise players market share revenue",
    "{market_space} industry leaders strengths weaknesses analysis",
]

_FALLBACK_EMERGING = [
    "{market_space} startup funding recent series A B seed 2024 2025",
    "{market_space} emerging companies startups disrupting market",
    "{market_space} venture capital investment trends funding activity",
]

_FALLBACK_MARKET_SIZING = [
    "{market_space} market size TAM SAM forecast CAGR growth",
    "{market_space} industry report market analysis 2025 2030",
    "{market_space} addressable market opportunity growth drivers constraints",
]


# ── Prior evidence reuse (Phase 5) ──

async def _load_prior_evidence(query_plan: QueryPlan, current_analysis_id: str) -> list[Source]:
    """Load reusable sources from prior analyses of the same market.

    Sources are reusable if:
    - From a completed analysis of the same market
    - Created within the last 30 days
    - Deduplicated by URL against each other
    """
    if not query_plan.prior_analysis_ids:
        return []

    try:
        prior_sources = await repo.get_sources_for_analyses(query_plan.prior_analysis_ids)
        if not prior_sources:
            return []

        # Deduplicate by URL
        seen_urls = set()
        unique_sources = []
        for src in prior_sources:
            if src.url not in seen_urls:
                seen_urls.add(src.url)
                unique_sources.append(src)

        logger.info(
            f"Loaded {len(unique_sources)} unique prior sources "
            f"from {len(query_plan.prior_analysis_ids)} analyses"
        )
        return unique_sources
    except Exception as e:
        logger.warning(f"Prior evidence loading failed: {e}")
        return []


def _is_incumbents_source(source: Source) -> bool:
    """Heuristic: is this source relevant to incumbents analysis?"""
    cat = (source.source_category or "").lower()
    text = (source.title or "").lower() + " " + (source.snippet or "").lower()
    if cat in ("regulatory_filing",):
        return True
    incumbent_signals = ["market leader", "market share", "revenue", "enterprise", "incumbent"]
    return any(s in text for s in incumbent_signals)


def _is_emerging_source(source: Source) -> bool:
    """Heuristic: is this source relevant to emerging competitors?"""
    text = (source.title or "").lower() + " " + (source.snippet or "").lower()
    emerging_signals = ["startup", "funding", "series", "seed", "emerging", "venture", "patent", "disrupt"]
    return any(s in text for s in emerging_signals)


def _is_market_source(source: Source) -> bool:
    """Heuristic: is this source relevant to market sizing?"""
    text = (source.title or "").lower() + " " + (source.snippet or "").lower()
    market_signals = ["market size", "tam", "sam", "cagr", "forecast", "growth", "billion", "million"]
    return any(s in text for s in market_signals)
