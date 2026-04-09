"""Market sizing agent — TAM/SAM/SOM, growth, and constraints.

When called with pre-fetched evidence (ctx.prefetched_sources), skips all
provider calls and uses the centralized retrieval service output directly.
Only performs LLM structured extraction and insight building.
"""

import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.services import llm

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


async def run(ctx: AgentContext) -> AgentResult:
    """Research market sizing and growth projections.

    If ctx.prefetched_sources is populated, uses pre-fetched evidence.
    """
    sources = ctx.prefetched_sources
    claims = ctx.prefetched_claims
    confidence = ctx.prefetched_confidence or {"level": "low", "score": 30, "reasoning": "No sources."}

    if not sources:
        logger.warning("Market sizing agent received no sources")
        return AgentResult(step="market_sizing", data={}, error="No sources provided")

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
