"""Synthesis agent — opportunity assessment and recommendation."""

import logging
from pydantic import BaseModel

from app.agents.base import AgentContext, AgentResult
from app.services import llm

logger = logging.getLogger(__name__)


class OpportunityAssessmentResult(BaseModel):
    recommendation: str  # go, no-go, maybe
    score: int  # 0-100
    headline: str
    reasoning: str
    reasons_to_believe: list[str]
    reasons_to_challenge: list[str]
    white_space_opportunities: list[str]
    key_risks: list[str]


async def run(
    ctx: AgentContext,
    incumbents_data: dict,
    emerging_data: dict,
    market_sizing_data: dict,
) -> AgentResult:
    """Synthesize findings into an opportunity assessment."""

    # Build comprehensive context from all research
    research_summary = _build_research_summary(incumbents_data, emerging_data, market_sizing_data)

    strategy_context = ""
    if ctx.strategy_lens:
        lens = ctx.strategy_lens
        priorities = lens.get("strategicPriorities", [])
        if priorities:
            strategy_context = (
                f"\n\nCompany strategic context:\n"
                f"Priorities: {', '.join(p.get('priority', '') for p in priorities[:3])}\n"
                f"GTM strengths: {', '.join(lens.get('gtmStrengths', [])[:3])}\n"
                f"Fit signals: {', '.join(lens.get('internalFitSignals', [])[:3])}\n"
                f"Misfit signals: {', '.join(lens.get('internalMisfitSignals', [])[:3])}\n"
            )

    prompt = (
        f"You are evaluating whether {ctx.company_name} should enter the {ctx.market_space} market.\n\n"
        f"{'Company context: ' + ctx.company_context if ctx.company_context else ''}\n"
        f"{strategy_context}\n\n"
        f"Research findings:\n{research_summary}\n\n"
        f"Provide a Go/No-Go/Maybe recommendation with:\n"
        f"- A confidence score (0-100)\n"
        f"- A one-line headline\n"
        f"- Detailed reasoning (2-3 paragraphs)\n"
        f"- 4-6 reasons to believe (specific, evidence-based)\n"
        f"- 4-5 reasons to challenge (specific, evidence-based)\n"
        f"- 3-4 white space opportunities\n"
        f"- 3 key risks\n\n"
        f"Be balanced. Use specific data points from the research."
    )

    try:
        assessment = await llm.chat_structured(
            prompt=prompt,
            response_model=OpportunityAssessmentResult,
            model="gpt-4o",
            system="You are a strategy consultant. Be specific, evidence-based, and balanced.",
        )
    except Exception as e:
        logger.error(f"Synthesis LLM failed: {e}")
        return AgentResult(step="synthesis", data={}, error=str(e))

    # Build confidence from synthesis quality
    confidence = {
        "level": "high" if assessment.score >= 70 else "medium" if assessment.score >= 40 else "low",
        "score": min(assessment.score + 10, 100),
        "reasoning": f"Synthesized from incumbents, emerging competitors, and market sizing research.",
    }

    data = {
        "recommendation": assessment.recommendation,
        "score": assessment.score,
        "headline": assessment.headline,
        "reasoning": assessment.reasoning,
        "reasonsToBelieve": assessment.reasons_to_believe,
        "reasonsToChallenge": assessment.reasons_to_challenge,
        "whiteSpaceOpportunities": assessment.white_space_opportunities,
        "keyRisks": assessment.key_risks,
        "confidence": confidence,
    }

    insights = _build_insights(assessment, confidence, ctx)

    return AgentResult(step="synthesis", data=data, insights=insights)


def _build_research_summary(incumbents: dict, emerging: dict, market: dict) -> str:
    parts = []
    if incumbents.get("summary"):
        parts.append(f"INCUMBENTS: {incumbents['summary']}")
        players = incumbents.get("players", [])
        if players:
            names = [p.get("name", "") for p in players[:3]]
            parts.append(f"Key players: {', '.join(names)}")

    if emerging.get("summary"):
        parts.append(f"\nEMERGING: {emerging['summary']}")
        parts.append(f"Total funding: {emerging.get('totalFundingInSpace', 'unknown')}, trend: {emerging.get('fundingTrend', 'unknown')}")

    if market.get("summary"):
        parts.append(f"\nMARKET SIZE: {market['summary']}")
        parts.append(f"TAM: {market.get('tam', '?')}, SAM: {market.get('sam', '?')}, CAGR: {market.get('cagr', '?')}")

    return "\n".join(parts)


def _build_insights(assessment: OpportunityAssessmentResult, confidence: dict, ctx: AgentContext) -> list[dict]:
    insights = []

    # 1. Recommendation headline (suggested)
    insights.append({
        "title": assessment.headline,
        "body": assessment.reasoning[:500],
        "source_step": "synthesis",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["recommendation", "synthesis"],
        "display_status": "suggested",
    })

    # 2. Top white-space opportunity (suggested)
    if assessment.white_space_opportunities:
        insights.append({
            "title": "Top white-space opportunity",
            "body": assessment.white_space_opportunities[0],
            "source_step": "synthesis",
            "confidence_score": max(confidence["score"] - 5, 20),
            "confidence_level": confidence["level"],
            "confidence_reasoning": "Derived from cross-referencing research findings.",
            "tags": ["white_space", "opportunity"],
            "display_status": "suggested",
        })

    # 3. Top risk (suggested)
    if assessment.key_risks:
        insights.append({
            "title": "Primary risk",
            "body": assessment.key_risks[0],
            "source_step": "synthesis",
            "confidence_score": max(confidence["score"] - 5, 20),
            "confidence_level": confidence["level"],
            "confidence_reasoning": "Risk assessment based on competitive and market analysis.",
            "tags": ["risk", "caution"],
            "display_status": "suggested",
        })

    # 4. Strategic fit (suggested)
    fit_body = (
        f"Recommendation: {assessment.recommendation.upper()} (score: {assessment.score}/100). "
        f"Key reasons to believe: {'; '.join(assessment.reasons_to_believe[:2])}. "
        f"Key challenges: {'; '.join(assessment.reasons_to_challenge[:2])}."
    )
    insights.append({
        "title": f"Strategic fit assessment for {ctx.company_name}",
        "body": fit_body,
        "source_step": "synthesis",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["strategic_fit", "assessment"],
        "display_status": "suggested",
    })

    return insights[:4]
