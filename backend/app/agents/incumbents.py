"""Incumbents research agent — identifies established players in the market."""

import asyncio
import json
import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.config import MAX_CLAIMS_PER_AGENT, SEC_EDGAR_ENABLED, TAVILY_SEARCHES_PER_AGENT
from app.evidence.claims import extract_claims_from_sources
from app.evidence.processor import calculate_source_confidence, process_search_results
from app.persistence import repositories as repo
from app.services import llm, search
from app.services import sec_edgar
from app.shared.utils import generate_id

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


_FALLBACK_QUERIES = [
    "{market_space} market leaders competitive landscape",
    "{market_space} enterprise players market share revenue",
    "{market_space} industry leaders strengths weaknesses analysis",
]


async def run(ctx: AgentContext) -> AgentResult:
    """Research incumbent players in the market space."""
    plan = ctx.query_plan

    # 1. Determine queries: use planned queries if available, else fallback templates
    if plan and plan.incumbents_queries.tavily:
        tavily_queries = plan.incumbents_queries.tavily[:TAVILY_SEARCHES_PER_AGENT]
    else:
        tavily_queries = [q.format(market_space=ctx.market_space) for q in _FALLBACK_QUERIES[:TAVILY_SEARCHES_PER_AGENT]]

    # 2. Search for market intelligence
    all_results = []
    existing_urls: set[str] = set()

    for query in tavily_queries:
        results = await search.search(query, max_results=5)
        all_results.extend(results)

    sources = process_search_results(all_results, ctx.analysis_id, existing_urls)

    # 3. Enrich with SEC EDGAR filings (only if plan recommends it)
    should_use_sec = plan.use_sec_edgar if plan else SEC_EDGAR_ENABLED
    if should_use_sec and SEC_EDGAR_ENABLED:
        try:
            if plan and plan.incumbents_queries.sec_edgar:
                sec_query = plan.incumbents_queries.sec_edgar[0]
            else:
                sec_query = f"{ctx.market_space} revenue market"
            sec_results, sec_meta = await sec_edgar.search_filings(sec_query, max_results=3)
            if sec_results:
                sec_urls = {s.url for s in sources}
                sec_sources = process_search_results(
                    sec_results, ctx.analysis_id, sec_urls,
                    provider="sec_edgar", source_category="regulatory_filing",
                )
                for src, meta in zip(sec_sources, sec_meta):
                    await repo.create_source_metadata(src.id, "sec_edgar", json.dumps(meta))
                sources.extend(sec_sources)
                logger.info(f"Incumbents: added {len(sec_sources)} SEC EDGAR sources")
        except Exception as e:
            logger.warning(f"Incumbents SEC EDGAR enrichment failed: {e}")

    confidence = calculate_source_confidence(sources)

    # 3. Extract claims
    analysis_context = f"Incumbent analysis for {ctx.market_space}"
    claims = await extract_claims_from_sources(sources, analysis_context, MAX_CLAIMS_PER_AGENT)

    # 4. Generate structured analysis using LLM
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

    # 5. Build result matching frontend contract
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

    # 6. Build insights
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

    # 1. Market landscape summary
    insights.append({
        "title": f"{ctx.market_space} incumbent landscape",
        "body": analysis.summary,
        "source_step": "incumbents",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["market_landscape", "incumbents"],
    })

    # 2. Top threat
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

    # 3. Biggest weakness across incumbents
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

    # 4. Market concentration
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
