"""Market sizing agent — TAM/SAM/SOM, growth, and constraints."""

import json
import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.config import GDELT_ENABLED, MAX_CLAIMS_PER_AGENT, TAVILY_SEARCHES_PER_AGENT
from app.evidence.claims import extract_claims_from_sources
from app.evidence.processor import calculate_source_confidence, process_search_results
from app.persistence import repositories as repo
from app.services import llm, search
from app.services import gdelt

logger = logging.getLogger(__name__)


class MarketSizingAnalysis(BaseModel):
    summary: str
    tam: str
    sam: str
    som: str | None = None
    cagr: str
    growth_drivers: list[str]
    constraints: list[str]
    timeframe: str


_FALLBACK_QUERIES = [
    "{market_space} market size TAM SAM forecast CAGR growth",
    "{market_space} industry report market analysis 2025 2030",
    "{market_space} addressable market opportunity growth drivers constraints",
]


async def run(ctx: AgentContext) -> AgentResult:
    """Research market sizing and growth projections."""
    plan = ctx.query_plan

    # Use planned queries if available, else fallback templates
    if plan and plan.market_sizing_queries.tavily:
        tavily_queries = plan.market_sizing_queries.tavily[:TAVILY_SEARCHES_PER_AGENT]
    else:
        tavily_queries = [q.format(market_space=ctx.market_space) for q in _FALLBACK_QUERIES[:TAVILY_SEARCHES_PER_AGENT]]

    all_results = []
    for query in tavily_queries:
        results = await search.search(query, max_results=5)
        all_results.extend(results)

    sources = process_search_results(all_results, ctx.analysis_id)

    # Enrich with GDELT news for market trend signals (only if plan recommends)
    should_use_gdelt = plan.use_gdelt if plan else GDELT_ENABLED
    if should_use_gdelt and GDELT_ENABLED:
        try:
            if plan and plan.market_sizing_queries.gdelt:
                gdelt_query = plan.market_sizing_queries.gdelt[0]
            else:
                gdelt_query = f"{ctx.market_space} market growth"
            gdelt_results, gdelt_meta = await gdelt.search_news(gdelt_query, max_results=5, timespan="6m")
            if gdelt_results:
                existing_urls = {s.url for s in sources}
                gdelt_sources = process_search_results(
                    gdelt_results, ctx.analysis_id, existing_urls,
                    provider="gdelt", source_category="news_event",
                )
                for src, meta in zip(gdelt_sources, gdelt_meta):
                    await repo.create_source_metadata(src.id, "gdelt", json.dumps(meta))
                sources.extend(gdelt_sources)
                logger.info(f"Market sizing: added {len(gdelt_sources)} GDELT trend sources")
        except Exception as e:
            logger.warning(f"Market sizing GDELT enrichment failed: {e}")

    confidence = calculate_source_confidence(sources)

    analysis_context = f"Market sizing for {ctx.market_space}"
    claims = await extract_claims_from_sources(sources, analysis_context, MAX_CLAIMS_PER_AGENT)

    source_content = "\n\n".join(
        f"[{s.title} ({s.publisher})]: {(s.raw_content or s.snippet or '')[:1000]}"
        for s in sources[:10]
    )

    prompt = (
        f"Analyze the market size and growth projections for {ctx.market_space}.\n\n"
        f"Company seeking to enter: {ctx.company_name}\n\n"
        f"Research findings:\n{source_content}\n\n"
        f"Provide: TAM (total addressable market), SAM (serviceable), "
        f"SOM (obtainable) if reasonable, CAGR, key growth drivers, "
        f"key constraints, and forecast timeframe.\n"
        f"Use dollar figures and percentages. Be specific about the data sources "
        f"and note if estimates vary across sources."
    )

    try:
        analysis = await llm.chat_structured(
            prompt=prompt,
            response_model=MarketSizingAnalysis,
            model="gpt-4o",
            system="You are a market research analyst. Triangulate data from multiple sources.",
        )
    except Exception as e:
        logger.error(f"Market sizing LLM analysis failed: {e}")
        return AgentResult(step="market_sizing", data={}, error=str(e))

    data = {
        "summary": analysis.summary,
        "tam": analysis.tam,
        "sam": analysis.sam,
        "som": analysis.som,
        "cagr": analysis.cagr,
        "growthDrivers": analysis.growth_drivers,
        "constraints": analysis.constraints,
        "timeframe": analysis.timeframe,
        "confidence": confidence,
        "sources": [
            {"title": s.title, "url": s.url, "publisher": s.publisher,
             "date": s.published_date, "snippet": s.snippet,
             "provider": s.provider, "sourceCategory": s.source_category}
            for s in sources[:6]
        ],
    }

    insights = _build_insights(analysis, confidence, ctx)

    return AgentResult(
        step="market_sizing",
        data=data,
        sources=sources,
        claims=claims,
        insights=insights,
    )


def _build_insights(analysis: MarketSizingAnalysis, confidence: dict, ctx: AgentContext) -> list[dict]:
    insights = []

    insights.append({
        "title": f"{ctx.market_space}: {analysis.tam} TAM at {analysis.cagr} CAGR",
        "body": analysis.summary,
        "source_step": "market_sizing",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["tam_sam", "market_size"],
    })

    if analysis.growth_drivers:
        insights.append({
            "title": "Key growth driver",
            "body": analysis.growth_drivers[0],
            "source_step": "market_sizing",
            "confidence_score": max(confidence["score"] - 5, 20),
            "confidence_level": confidence["level"],
            "confidence_reasoning": "Derived from market analysis sources.",
            "tags": ["growth_driver", "trend"],
        })

    if analysis.constraints:
        insights.append({
            "title": "Key market constraint",
            "body": analysis.constraints[0],
            "source_step": "market_sizing",
            "confidence_score": max(confidence["score"] - 5, 20),
            "confidence_level": confidence["level"],
            "confidence_reasoning": "Derived from market analysis sources.",
            "tags": ["constraint", "risk"],
        })

    insights.append({
        "title": "Estimate confidence note",
        "body": f"Market size estimates ({analysis.tam} TAM) based on {analysis.timeframe} forecast. {confidence['reasoning']}",
        "source_step": "market_sizing",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["data_quality", "estimate"],
    })

    return insights[:4]
