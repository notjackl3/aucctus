"""Synthesis agent — strategic opportunity assessment and recommendation.

Evaluates whether a company should pursue an opportunity, and under what conditions.
Framing adapts to evaluation posture (default: established_company).
"""

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
    strategic_fit_summary: str  # how this opportunity aligns with company capabilities
    reasons_to_believe: list[str]
    reasons_to_challenge: list[str]
    conditions_to_pursue: list[str]  # what would need to be true for this to be worth pursuing
    white_space_opportunities: list[str]
    key_risks: list[str]
    timing_assessment: str  # early / on-time / late / unclear
    right_to_win: str  # summary of company's right to win in this space
    needs_leadership_input: list[str]  # questions that require human/leadership judgment


# Posture-specific prompt framing
_POSTURE_FRAMING = {
    "established_company": (
        "You are a senior strategy advisor evaluating whether {company} — an established company — "
        "should pursue the {market} opportunity.\n\n"
        "Frame your assessment around:\n"
        "- Strategic fit: does this align with the company's existing capabilities, assets, and direction?\n"
        "- Right to win: does the company have structural advantages that give it an edge?\n"
        "- Timing: is the market window favorable? Is the company early, on time, or late?\n"
        "- Conditions: what would need to be true for this to be worth pursuing?\n"
        "- Risks: what could go wrong, and what assumptions are weakest?\n"
        "- Leadership input: what questions require human judgment before deciding?\n"
    ),
    "adjacency_expansion": (
        "You are evaluating whether {company} should expand into the adjacent {market} space. "
        "Focus on leverage of existing assets, customer overlap, distribution advantages, "
        "and the incremental investment required.\n"
    ),
    "new_market_entry": (
        "You are evaluating whether {company} should enter the {market} as a new market. "
        "Focus on market attractiveness, competitive barriers to entry, required capabilities, "
        "and the investment thesis.\n"
    ),
    "new_venture": (
        "You are evaluating the {market} opportunity for {company}, which is an earlier-stage company. "
        "Focus on product-market fit signals, competitive differentiation, and go-to-market viability.\n"
    ),
}


async def run(
    ctx: AgentContext,
    incumbents_data: dict,
    emerging_data: dict,
    market_sizing_data: dict,
) -> AgentResult:
    """Synthesize findings into a strategic opportunity assessment."""

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

    posture = ctx.evaluation_posture or "established_company"
    framing = _POSTURE_FRAMING.get(posture, _POSTURE_FRAMING["established_company"])
    framing = framing.format(company=ctx.company_name, market=ctx.market_space)

    prompt = (
        f"{framing}\n"
        f"{'Company context: ' + ctx.company_context if ctx.company_context else ''}\n"
        f"{strategy_context}\n\n"
        f"Research findings:\n{research_summary}\n\n"
        f"Provide a strategic assessment with:\n"
        f"- Recommendation: Go / No-Go / Maybe\n"
        f"- Opportunity score (0-100)\n"
        f"- A one-line headline framing the key insight\n"
        f"- Detailed reasoning (2-3 paragraphs) focused on strategic fit and market reality\n"
        f"- Strategic fit summary: how this opportunity aligns with the company's capabilities and assets\n"
        f"- 4-6 reasons to believe (specific, evidence-based, tied to company strengths where possible)\n"
        f"- 4-5 reasons to challenge (specific, evidence-based)\n"
        f"- 3-4 conditions to pursue: what would need to be true for this to be worth doing\n"
        f"- 3-4 white space opportunities\n"
        f"- 3-4 key risks\n"
        f"- Timing assessment: is the company early, on time, late, or unclear for this market?\n"
        f"- Right to win: a 1-2 sentence summary of the company's structural advantages\n"
        f"- 2-3 questions that require leadership/human judgment before a final decision\n\n"
        f"Be balanced and specific. Use data points from the research. "
        f"Focus on what makes this opportunity worth or not worth pursuing for THIS company."
    )

    try:
        assessment = await llm.chat_structured(
            prompt=prompt,
            response_model=OpportunityAssessmentResult,
            model="gpt-4o",
            system=(
                "You are a senior strategy consultant advising on market opportunity assessment. "
                "Be specific, evidence-based, and balanced. Frame everything around whether "
                "this company should pursue this opportunity and under what conditions."
            ),
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
        "strategicFitSummary": assessment.strategic_fit_summary,
        "reasonsToBelieve": assessment.reasons_to_believe,
        "reasonsToChallenge": assessment.reasons_to_challenge,
        "conditionsToPursue": assessment.conditions_to_pursue,
        "whiteSpaceOpportunities": assessment.white_space_opportunities,
        "keyRisks": assessment.key_risks,
        "timingAssessment": assessment.timing_assessment,
        "rightToWin": assessment.right_to_win,
        "needsLeadershipInput": assessment.needs_leadership_input,
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
            # Include market concentration for strategic context
            if incumbents.get("marketConcentration"):
                parts.append(f"Market concentration: {incumbents['marketConcentration']}")

    if emerging.get("summary"):
        parts.append(f"\nEMERGING: {emerging['summary']}")
        parts.append(f"Total funding: {emerging.get('totalFundingInSpace', 'unknown')}, trend: {emerging.get('fundingTrend', 'unknown')}")
        comps = emerging.get("competitors", [])
        if comps:
            parts.append(f"Notable entrants: {', '.join(c.get('name', '') for c in comps[:3])}")

    if market.get("summary"):
        parts.append(f"\nMARKET SIZE: {market['summary']}")
        parts.append(f"TAM: {market.get('tam', '?')}, SAM: {market.get('sam', '?')}, CAGR: {market.get('cagr', '?')}")
        drivers = market.get("growthDrivers", [])
        if drivers:
            parts.append(f"Growth drivers: {'; '.join(drivers[:2])}")
        constraints = market.get("constraints", [])
        if constraints:
            parts.append(f"Constraints: {'; '.join(constraints[:2])}")

    return "\n".join(parts)


def _build_insights(assessment: OpportunityAssessmentResult, confidence: dict, ctx: AgentContext) -> list[dict]:
    insights = []

    # 1. Strategic recommendation
    insights.append({
        "title": assessment.headline,
        "body": assessment.reasoning[:500],
        "source_step": "synthesis",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["recommendation", "synthesis", "strategic_fit"],
        "display_status": "suggested",
    })

    # 2. Conditions to pursue (key for established-company framing)
    if assessment.conditions_to_pursue:
        insights.append({
            "title": "Conditions required for pursuit",
            "body": "; ".join(assessment.conditions_to_pursue[:3]),
            "source_step": "synthesis",
            "confidence_score": max(confidence["score"] - 5, 20),
            "confidence_level": confidence["level"],
            "confidence_reasoning": "Derived from cross-referencing research findings with company context.",
            "tags": ["conditions", "decision_criteria"],
            "display_status": "suggested",
        })

    # 3. Top risk
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

    # 4. Right to win
    insights.append({
        "title": f"Right to win: {ctx.company_name}",
        "body": f"{assessment.right_to_win} Timing: {assessment.timing_assessment}.",
        "source_step": "synthesis",
        "confidence_score": confidence["score"],
        "confidence_level": confidence["level"],
        "confidence_reasoning": confidence["reasoning"],
        "tags": ["strategic_fit", "right_to_win"],
        "display_status": "suggested",
    })

    return insights[:4]
