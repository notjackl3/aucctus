"""Emerging competitors agent — identifies recent entrants and funding activity.

When called with pre-fetched evidence (ctx.prefetched_sources), skips all
provider calls and uses the centralized retrieval service output directly.
Only performs LLM structured extraction and insight building.
"""

import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.services import llm

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


async def run(ctx: AgentContext) -> AgentResult:
    """Research emerging competitors and funding activity.

    If ctx.prefetched_sources is populated, uses pre-fetched evidence.
    """
    sources = ctx.prefetched_sources
    claims = ctx.prefetched_claims
    confidence = ctx.prefetched_confidence or {"level": "low", "score": 30, "reasoning": "No sources."}

    if not sources:
        logger.warning("Emerging agent received no sources")
        return AgentResult(step="emerging_competitors", data={}, error="No sources provided")

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
