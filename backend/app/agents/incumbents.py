"""Incumbents research agent — identifies established players in the market.

When called with pre-fetched evidence (ctx.prefetched_sources), skips all
provider calls and uses the centralized retrieval service output directly.
Only performs LLM structured extraction and insight building.
"""

import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.services import llm

logger = logging.getLogger(__name__)


class IncumbentPlayer(BaseModel):
    name: str
    description: str
    market_position: str
    strengths: list[str]
    weaknesses: list[str]
    estimated_revenue: str | None = None
    founded: str | None = None
    headquarters: str | None = None


class IncumbentsAnalysis(BaseModel):
    summary: str
    players: list[IncumbentPlayer]
    market_concentration: str


async def run(ctx: AgentContext) -> AgentResult:
    """Research incumbent players in the market space.

    If ctx.prefetched_sources is populated, uses pre-fetched evidence.
    Otherwise falls back to legacy direct-search behavior (for backward compat).
    """
    # Use pre-fetched evidence from centralized retrieval
    sources = ctx.prefetched_sources
    claims = ctx.prefetched_claims
    confidence = ctx.prefetched_confidence or {"level": "low", "score": 30, "reasoning": "No sources."}

    if not sources:
        logger.warning("Incumbents agent received no sources")
        return AgentResult(step="incumbents", data={}, error="No sources provided")

    # LLM structured extraction
    source_content = "\n\n".join(
        f"[{s.title} ({s.publisher})]: {(s.raw_content or s.snippet or '')[:1000]}"
        for s in sources[:10]
    )

    prompt = (
        f"Analyze the incumbent players in the {ctx.market_space} market.\n\n"
        f"Company seeking to enter: {ctx.company_name}\n"
        f"{'Company context: ' + ctx.company_context if ctx.company_context else ''}\n\n"
        f"Research findings:\n{source_content}\n\n"
        f"Identify the top 3-5 established players. For each, provide their name, "
        f"description, market position (Leader/Challenger/Niche), key strengths, "
        f"weaknesses, and estimated revenue if available.\n"
        f"Also assess overall market concentration."
    )

    try:
        analysis = await llm.chat_structured(
            prompt=prompt,
            response_model=IncumbentsAnalysis,
            model="gpt-4o",
            system="You are a competitive intelligence analyst. Be specific and evidence-based.",
        )
    except Exception as e:
        logger.error(f"Incumbents LLM analysis failed: {e}")
        return AgentResult(step="incumbents", data={}, error=str(e))

    # Build result matching frontend contract
    data = {
        "summary": analysis.summary,
        "players": [p.model_dump(by_alias=False) for p in analysis.players],
        "marketConcentration": analysis.market_concentration,
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
        step="incumbents",
        data=data,
        sources=sources,
        claims=claims,
        insights=insights,
    )


def _build_insights(analysis: IncumbentsAnalysis, confidence: dict, ctx: AgentContext) -> list[dict]:
    """Build 4 insight dicts from incumbents analysis."""
    insights = []

    insights.append({
        "title": f"{ctx.market_space} incumbent landscape",
        "body": analysis.summary,
        "source_step": "incumbents",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["market_landscape", "incumbents"],
    })

    if analysis.players:
        top = analysis.players[0]
        insights.append({
            "title": f"{top.name} is the dominant incumbent",
            "body": f"{top.name}: {top.description}. Strengths: {', '.join(top.strengths[:2])}.",
            "source_step": "incumbents",
            "confidence_score": min(confidence["score"] + 5, 100),
            "confidence_level": confidence["level"],
            "confidence_reasoning": f"Based on analysis of {top.name}'s market position.",
            "tags": ["competitive_threat", "top_player"],
        })

    all_weaknesses = []
    for p in analysis.players:
        all_weaknesses.extend(p.weaknesses)
    if all_weaknesses:
        insights.append({
            "title": "Key incumbent vulnerabilities",
            "body": f"Common weaknesses across incumbents: {'; '.join(all_weaknesses[:3])}",
            "source_step": "incumbents",
            "confidence_score": max(confidence["score"] - 5, 20),
            "confidence_level": confidence["level"],
            "confidence_reasoning": "Synthesized from competitor weakness analysis.",
            "tags": ["incumbent_weakness", "opportunity"],
        })

    insights.append({
        "title": "Market concentration assessment",
        "body": analysis.market_concentration,
        "source_step": "incumbents",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["market_structure", "concentration"],
    })

    return insights[:4]
