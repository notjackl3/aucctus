"""Fetch more sources for a research dimension and re-synthesize.

Flow:
1. Generate gap-aware queries using LLM based on what existing research already covers
2. Run targeted Tavily searches, URL-dedup against existing sources
3. If nothing new found, surface a clear message and stop
4. Extract claims from new sources
5. Re-run the dimension's agent with new sources only (query intent = relevance gate)
6. Merge new agent data on top of existing (append players/competitors, don't replace)
7. Re-run synthesis with merged data
8. Add new insights without archiving the old ones
"""

import json
import logging

from pydantic import BaseModel

from app.agents import incumbents, emerging, market_sizing, synthesis
from app.agents.base import AgentContext
from app.config import use_real_apis
from app.domain.enums import DisplayStatus, OperationStatus
from app.evidence.claims import extract_claims_from_sources, merge_duplicate_claims
from app.evidence.processor import calculate_source_confidence, process_search_results
from app.persistence import repositories as repo
from app.services import llm, search as search_svc
from app.shared.utils import utc_now

logger = logging.getLogger(__name__)

# dimension → (agent module, result_json key, source_step for insights)
_DIMENSION_MAP = {
    "incumbents":    (incumbents,    "incumbents",           "incumbents"),
    "emerging":      (emerging,      "emergingCompetitors",  "emerging_competitors"),
    "market_sizing": (market_sizing, "marketSizing",         "market_sizing"),
}


class _QueryList(BaseModel):
    queries: list[str]


async def fetch_more_sources(
    analysis_id: str,
    workspace_id: str,
    dimension: str,
    operation_id: str,
) -> None:
    """Background task: fetch more sources for one dimension and re-synthesize."""
    try:
        if dimension not in _DIMENSION_MAP:
            await repo.update_operation(
                operation_id, status=OperationStatus.ERROR,
                error_message=f"Unknown dimension: {dimension}", completed_at=utc_now(),
            )
            return

        agent_module, result_key, source_step = _DIMENSION_MAP[dimension]

        await repo.update_operation(
            operation_id, status=OperationStatus.RUNNING,
            current_step="Generating targeted search queries...",
            steps_completed=0,
        )

        analysis = await repo.get_analysis(analysis_id)
        if not analysis or not analysis.result_json:
            await repo.update_operation(
                operation_id, status=OperationStatus.ERROR,
                error_message="Analysis not found or not complete", completed_at=utc_now(),
            )
            return

        workspace = await repo.get_workspace(workspace_id)
        market = workspace.market_space if workspace else analysis.market_space
        existing_result = json.loads(analysis.result_json)
        existing_dim_data = existing_result.get(result_key) or {}

        # ── Step 1: Generate gap-aware queries ──
        queries = await _generate_gap_queries(market, dimension, existing_dim_data)
        if not queries:
            await repo.update_operation(
                operation_id, status=OperationStatus.COMPLETED,
                current_step="Could not generate targeted queries for this dimension.",
                steps_completed=4, completed_at=utc_now(),
            )
            return

        # ── Step 2: Fetch new sources ──
        await repo.update_operation(
            operation_id, current_step="Fetching additional sources...", steps_completed=1,
        )

        existing_sources = await repo.get_sources_for_analysis(analysis_id)
        existing_urls = {s.url.rstrip("/").lower() for s in existing_sources}

        new_sources = []
        if use_real_apis():
            for query in queries:
                try:
                    results = await search_svc.search(query, max_results=5)
                    sources = process_search_results(results, analysis_id, existing_urls)
                    new_sources.extend(sources)
                    existing_urls.update(s.url.rstrip("/").lower() for s in sources)
                except Exception as e:
                    logger.warning(f"fetch_more search failed for '{query[:50]}': {e}")

        if not new_sources:
            await repo.update_operation(
                operation_id, status=OperationStatus.COMPLETED,
                current_step=(
                    f"No additional sources found for {dimension}. "
                    f"The existing research already covers this area well."
                ),
                steps_completed=4, completed_at=utc_now(),
            )
            return

        for src in new_sources:
            await repo.create_source(src)

        # ── Step 3: Extract claims ──
        await repo.update_operation(
            operation_id, current_step="Extracting claims from new sources...", steps_completed=2,
        )

        context_label = {
            "incumbents":    f"Incumbent analysis for {market}",
            "emerging":      f"Emerging competitors in {market}",
            "market_sizing": f"Market sizing for {market}",
        }[dimension]

        new_claims = await extract_claims_from_sources(new_sources, context_label, max_claims=8)
        merged_claims = merge_duplicate_claims(new_claims)
        for claim in merged_claims:
            await repo.create_claim(claim)

        # ── Step 4: Re-run the agent with new sources only ──
        # Query intent is the relevance gate — no post-hoc filter needed.
        await repo.update_operation(
            operation_id, current_step=f"Analyzing new {dimension} sources...", steps_completed=3,
        )

        confidence = calculate_source_confidence(new_sources)

        strategy_lens = None
        if workspace and workspace.company_id:
            strategy_lens = await repo.get_latest_strategy_lens(workspace.company_id)

        ctx = AgentContext(
            analysis_id=analysis_id,
            company_name=analysis.company_name,
            market_space=market,
            company_context=analysis.company_context,
            strategy_lens=strategy_lens,
            prefetched_sources=new_sources,
            prefetched_claims=merged_claims,
            prefetched_confidence=confidence,
        )

        agent_result = await agent_module.run(ctx)

        # ── Step 5: Merge new data on top of existing ──
        merged_dim_data = _merge_dimension_data(existing_dim_data, agent_result.data, dimension)

        # ── Step 6: Re-run synthesis with merged data ──
        await repo.update_operation(
            operation_id, current_step="Re-synthesizing...", steps_completed=3,
        )

        inc_data = existing_result.get("incumbents") or {}
        emg_data = existing_result.get("emergingCompetitors") or {}
        mkt_data = existing_result.get("marketSizing") or {}

        if dimension == "incumbents":
            inc_data = merged_dim_data
        elif dimension == "emerging":
            emg_data = merged_dim_data
        elif dimension == "market_sizing":
            mkt_data = merged_dim_data

        syn_ctx = AgentContext(
            analysis_id=analysis_id,
            company_name=analysis.company_name,
            market_space=market,
            company_context=analysis.company_context,
            strategy_lens=strategy_lens,
        )
        syn_result = await synthesis.run(syn_ctx, inc_data, emg_data, mkt_data)

        # Update stored result with merged dimension data
        updated_result = dict(existing_result)
        updated_result[result_key] = merged_dim_data
        if syn_result.data:
            updated_result["opportunityAssessment"] = syn_result.data
        await repo.store_analysis_result(analysis_id, json.dumps(updated_result))

        # Add new insights without archiving old ones
        for ins_data in agent_result.insights + syn_result.insights:
            await repo.create_insight(workspace_id, ins_data)

        await repo.update_operation(
            operation_id, status=OperationStatus.COMPLETED,
            current_step=f"Added {len(new_sources)} new sources to {dimension} research.",
            steps_completed=4, completed_at=utc_now(),
        )

        logger.info(
            f"fetch_more complete: {len(new_sources)} new sources for {dimension}, "
            f"analysis={analysis_id}"
        )

    except Exception as e:
        logger.error(f"fetch_more_sources failed: {e}")
        await repo.update_operation(
            operation_id, status=OperationStatus.ERROR,
            error_message=str(e), completed_at=utc_now(),
        )


async def _generate_gap_queries(market: str, dimension: str, existing_data: dict) -> list[str]:
    """Use LLM to generate targeted queries that fill gaps in existing research."""
    if not use_real_apis():
        return []

    if dimension == "incumbents":
        known = [p.get("name", "") for p in existing_data.get("players", []) if p.get("name")]
        context = (
            f"Already identified players: {', '.join(known[:6]) or 'none yet'}. "
            f"Market concentration: {existing_data.get('marketConcentration', 'unknown')}."
        )
        goal = (
            "Find additional incumbent players, niche vendors, or deeper competitive data "
            "(market share figures, revenue, product differentiation) not yet covered."
        )
    elif dimension == "emerging":
        known = [c.get("name", "") for c in existing_data.get("competitors", []) if c.get("name")]
        context = (
            f"Already identified startups: {', '.join(known[:6]) or 'none yet'}. "
            f"Total funding found: {existing_data.get('totalFundingInSpace', 'unknown')}."
        )
        goal = (
            "Find additional emerging competitors, recently funded startups, or new market entrants "
            "not yet covered — especially ones outside the well-known names."
        )
    elif dimension == "market_sizing":
        context = (
            f"Current estimates: TAM={existing_data.get('tam', 'unknown')}, "
            f"SAM={existing_data.get('sam', 'unknown')}, "
            f"CAGR={existing_data.get('cagr', 'unknown')}."
        )
        goal = (
            "Find additional market size estimates from different analyst firms, "
            "regional breakdowns, segment-level data, or updated forecasts."
        )
    else:
        return []

    prompt = (
        f"I am researching the '{market}' market, specifically for {dimension} analysis.\n\n"
        f"What is already covered: {context}\n\n"
        f"Goal: {goal}\n\n"
        f"Generate exactly 3 precise web search queries to find new, non-overlapping information. "
        f"Do not generate queries that would return results about the already-known entities above. "
        f"Each query should target a distinct angle or source type."
    )

    try:
        result = await llm.chat_structured(
            prompt=prompt,
            response_model=_QueryList,
            model="gpt-4o-mini",
            system="You are a research analyst generating precise, targeted web search queries.",
            max_tokens=300,
        )
        queries = [q.strip() for q in result.queries if q.strip() and len(q.strip()) > 10]
        logger.info(f"fetch_more generated queries for {dimension}: {queries}")
        return queries[:3]
    except Exception as e:
        logger.warning(f"Gap query generation failed: {e}")
        return []


def _merge_dimension_data(existing: dict, new: dict, dimension: str) -> dict:
    """Merge new agent data on top of existing, appending rather than replacing."""
    if not existing:
        return new
    if not new:
        return existing

    merged = dict(existing)

    if dimension == "incumbents":
        existing_names = {p.get("name", "").lower() for p in existing.get("players", [])}
        new_players = [p for p in new.get("players", []) if p.get("name", "").lower() not in existing_names]
        merged["players"] = existing.get("players", []) + new_players
        # Merge source lists
        existing_urls = {s.get("url", "") for s in existing.get("sources", [])}
        new_srcs = [s for s in new.get("sources", []) if s.get("url") not in existing_urls]
        merged["sources"] = existing.get("sources", []) + new_srcs
        if new_players:
            merged["summary"] = new.get("summary", existing.get("summary", ""))

    elif dimension == "emerging":
        existing_names = {c.get("name", "").lower() for c in existing.get("competitors", [])}
        new_comps = [c for c in new.get("competitors", []) if c.get("name", "").lower() not in existing_names]
        merged["competitors"] = existing.get("competitors", []) + new_comps
        existing_urls = {s.get("url", "") for s in existing.get("sources", [])}
        new_srcs = [s for s in new.get("sources", []) if s.get("url") not in existing_urls]
        merged["sources"] = existing.get("sources", []) + new_srcs
        if new_comps:
            merged["summary"] = new.get("summary", existing.get("summary", ""))

    elif dimension == "market_sizing":
        # Prefer new values when they're more specific than what we have
        for field in ["tam", "sam", "som", "cagr", "timeframe"]:
            new_val = new.get(field)
            if new_val and new_val not in ("N/A", "Unknown", "unknown", "", None):
                merged[field] = new_val
        if new.get("summary"):
            merged["summary"] = new["summary"]
        existing_drivers = list(existing.get("growthDrivers", []))
        for d in new.get("growthDrivers", []):
            if d not in existing_drivers:
                existing_drivers.append(d)
        merged["growthDrivers"] = existing_drivers
        existing_constraints = list(existing.get("constraints", []))
        for c in new.get("constraints", []):
            if c not in existing_constraints:
                existing_constraints.append(c)
        merged["constraints"] = existing_constraints
        existing_urls = {s.get("url", "") for s in existing.get("sources", [])}
        new_srcs = [s for s in new.get("sources", []) if s.get("url") not in existing_urls]
        merged["sources"] = existing.get("sources", []) + new_srcs

    return merged
