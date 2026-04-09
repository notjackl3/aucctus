"""Emerging competitors agent — identifies recent entrants and funding activity."""

import asyncio
import json
import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.config import GDELT_ENABLED, MAX_CLAIMS_PER_AGENT, TAVILY_SEARCHES_PER_AGENT, USPTO_ENABLED
from app.evidence.claims import extract_claims_from_sources
from app.evidence.processor import calculate_source_confidence, process_search_results
from app.persistence import repositories as repo
from app.services import llm, search
from app.services import gdelt, uspto

logger = logging.getLogger(__name__)


class EmergingCompetitor(BaseModel):
    name: str
    description: str
    funding_stage: str
    funding_amount: str | None = None
    funding_date: str | None = None
    investors: list[str] | None = None
    differentiator: str


class EmergingAnalysis(BaseModel):
    summary: str
    competitors: list[EmergingCompetitor]
    total_funding_in_space: str
    funding_trend: str  # accelerating, stable, decelerating


_FALLBACK_QUERIES = [
    "{market_space} startup funding recent series A B seed 2024 2025",
    "{market_space} emerging companies startups disrupting market",
    "{market_space} venture capital investment trends funding activity",
]


async def run(ctx: AgentContext) -> AgentResult:
    """Research emerging competitors and funding activity."""
    plan = ctx.query_plan

    # Use planned queries if available, else fallback templates
    if plan and plan.emerging_queries.tavily:
        tavily_queries = plan.emerging_queries.tavily[:TAVILY_SEARCHES_PER_AGENT]
    else:
        tavily_queries = [q.format(market_space=ctx.market_space) for q in _FALLBACK_QUERIES[:TAVILY_SEARCHES_PER_AGENT]]

    all_results = []
    for query in tavily_queries:
        results = await search.search(query, max_results=5)
        all_results.extend(results)

    sources = process_search_results(all_results, ctx.analysis_id)

    # Enrich with USPTO and GDELT (only if plan recommends them)
    enrichment_tasks = []
    should_use_uspto = plan.use_uspto if plan else USPTO_ENABLED
    should_use_gdelt = plan.use_gdelt if plan else GDELT_ENABLED
    if should_use_uspto and USPTO_ENABLED:
        enrichment_tasks.append(_enrich_uspto(ctx, sources))
    if should_use_gdelt and GDELT_ENABLED:
        enrichment_tasks.append(_enrich_gdelt(ctx, sources))

    if enrichment_tasks:
        extra_sources_lists = await asyncio.gather(*enrichment_tasks, return_exceptions=True)
        for result in extra_sources_lists:
            if isinstance(result, list):
                sources.extend(result)

    confidence = calculate_source_confidence(sources)

    analysis_context = f"Emerging competitors in {ctx.market_space}"
    claims = await extract_claims_from_sources(sources, analysis_context, MAX_CLAIMS_PER_AGENT)

    source_content = "\n\n".join(
        f"[{s.title} ({s.publisher})]: {(s.raw_content or s.snippet or '')[:1000]}"
        for s in sources[:10]
    )

    prompt = (
        f"Analyze emerging competitors and startup funding in {ctx.market_space}.\n\n"
        f"Company seeking to enter: {ctx.company_name}\n\n"
        f"Research findings:\n{source_content}\n\n"
        f"Identify the top 3-5 emerging startups (Seed through Series B). "
        f"For each provide: name, description, funding stage, amount, date, "
        f"key investors, and core differentiator.\n"
        f"Also estimate total recent funding in the space and whether the trend "
        f"is accelerating, stable, or decelerating."
    )

    try:
        analysis = await llm.chat_structured(
            prompt=prompt,
            response_model=EmergingAnalysis,
            model="gpt-4o",
            system="You are a venture capital analyst. Be specific about funding data.",
        )
    except Exception as e:
        logger.error(f"Emerging LLM analysis failed: {e}")
        return AgentResult(step="emerging_competitors", data={}, error=str(e))

    data = {
        "summary": analysis.summary,
        "competitors": [c.model_dump(by_alias=False) for c in analysis.competitors],
        "totalFundingInSpace": analysis.total_funding_in_space,
        "fundingTrend": analysis.funding_trend,
        "confidence": confidence,
        "sources": [
            {"title": s.title, "url": s.url, "publisher": s.publisher,
             "date": s.published_date, "snippet": s.snippet,
             "provider": s.provider, "sourceCategory": s.source_category}
            for s in sources[:6]
        ],
    }

    # Camel-case the competitor fields for frontend
    for comp in data["competitors"]:
        comp["fundingStage"] = comp.pop("funding_stage")
        comp["fundingAmount"] = comp.pop("funding_amount", None)
        comp["fundingDate"] = comp.pop("funding_date", None)

    insights = _build_insights(analysis, confidence, ctx)

    return AgentResult(
        step="emerging_competitors",
        data=data,
        sources=sources,
        claims=claims,
        insights=insights,
    )


def _build_insights(analysis: EmergingAnalysis, confidence: dict, ctx: AgentContext) -> list[dict]:
    insights = []

    insights.append({
        "title": f"Funding landscape in {ctx.market_space}",
        "body": analysis.summary,
        "source_step": "emerging_competitors",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["funding_landscape", "emerging"],
    })

    if analysis.competitors:
        top = analysis.competitors[0]
        insights.append({
            "title": f"{top.name} — highest-momentum emerging competitor",
            "body": f"{top.name}: {top.description}. Differentiator: {top.differentiator}",
            "source_step": "emerging_competitors",
            "confidence_score": confidence["score"],
            "confidence_level": confidence["level"],
            "confidence_reasoning": f"Based on {top.name}'s funding and positioning.",
            "tags": ["top_emerging", "competitive_threat"],
        })

    # Dominant theme
    insights.append({
        "title": f"Dominant startup thesis in {ctx.market_space}",
        "body": f"Total recent funding: {analysis.total_funding_in_space}. Trend: {analysis.funding_trend}.",
        "source_step": "emerging_competitors",
        "confidence_score": max(confidence["score"] - 5, 20),
        "confidence_level": confidence["level"],
        "confidence_reasoning": "Aggregated from funding data.",
        "tags": ["startup_thesis", "trend"],
    })

    insights.append({
        "title": f"Capital flow trend: {analysis.funding_trend}",
        "body": f"Investment in {ctx.market_space} is {analysis.funding_trend}. {analysis.total_funding_in_space} deployed recently.",
        "source_step": "emerging_competitors",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["capital_flow", "trend"],
    })

    return insights[:4]


async def _enrich_uspto(ctx: AgentContext, existing_sources: list) -> list:
    """Fetch USPTO patent signals for the market space."""
    try:
        plan = ctx.query_plan
        if plan and plan.emerging_queries.uspto:
            patent_query = plan.emerging_queries.uspto[0]
        else:
            patent_query = ctx.market_space
        patent_results, patent_meta = await uspto.search_patents(patent_query, max_results=5)
        if not patent_results:
            return []
        existing_urls = {s.url for s in existing_sources}
        from app.evidence.processor import process_search_results
        patent_sources = process_search_results(
            patent_results, ctx.analysis_id, existing_urls,
            provider="uspto", source_category="patent",
        )
        for src, meta in zip(patent_sources, patent_meta):
            await repo.create_source_metadata(src.id, "uspto", json.dumps(meta))
        logger.info(f"Emerging: added {len(patent_sources)} USPTO patent sources")
        return patent_sources
    except Exception as e:
        logger.warning(f"Emerging USPTO enrichment failed: {e}")
        return []


async def _enrich_gdelt(ctx: AgentContext, existing_sources: list) -> list:
    """Fetch GDELT news signals for emerging competitors."""
    try:
        plan = ctx.query_plan
        if plan and plan.emerging_queries.gdelt:
            news_query = plan.emerging_queries.gdelt[0]
        else:
            news_query = f"{ctx.market_space} startup funding"
        news_results, news_meta = await gdelt.search_news(news_query, max_results=5, timespan="3m")
        if not news_results:
            return []
        existing_urls = {s.url for s in existing_sources}
        from app.evidence.processor import process_search_results
        news_sources = process_search_results(
            news_results, ctx.analysis_id, existing_urls,
            provider="gdelt", source_category="news_event",
        )
        for src, meta in zip(news_sources, news_meta):
            await repo.create_source_metadata(src.id, "gdelt", json.dumps(meta))
        logger.info(f"Emerging: added {len(news_sources)} GDELT news sources")
        return news_sources
    except Exception as e:
        logger.warning(f"Emerging GDELT enrichment failed: {e}")
        return []
