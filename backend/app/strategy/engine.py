"""Strategy lens engine — builder, critic, retriever.

Builds a StrategyLens from company context text and documents.
The lens structures internal knowledge for strategy-aware analysis.
"""

import json
import logging

from pydantic import BaseModel

from app.services import llm

logger = logging.getLogger(__name__)


class StrategicPriority(BaseModel):
    priority: str
    importance: str  # high, medium, low
    supporting_evidence: str


class TargetCustomers(BaseModel):
    segments: list[str]
    pain_points: list[str]
    buying_criteria: list[str]
    anti_patterns: list[str]


class Constraint(BaseModel):
    constraint: str
    severity: str  # hard, soft
    source: str


class RiskPosture(BaseModel):
    level: str  # aggressive, moderate, conservative
    reasoning: str
    implications: list[str]


class StrategyLensResult(BaseModel):
    strategic_priorities: list[StrategicPriority]
    product_adjacencies: list[str]
    target_customers: TargetCustomers
    gtm_strengths: list[str]
    constraints: list[Constraint]
    geographic_focus: list[str]
    risk_posture: RiskPosture
    internal_fit_signals: list[str]
    internal_misfit_signals: list[str]


async def build_strategy_lens(company_name: str, context: str, document_texts: list[str] | None = None) -> dict:
    """Build a structured strategy lens from company context."""
    doc_context = ""
    if document_texts:
        doc_context = "\n\nAdditional documents:\n" + "\n---\n".join(t[:3000] for t in document_texts[:3])

    prompt = (
        f"Build a structured strategy lens for {company_name}.\n\n"
        f"Company context:\n{context}\n"
        f"{doc_context}\n\n"
        f"Extract structured strategic intelligence covering:\n"
        f"- Strategic priorities (with importance level and supporting evidence)\n"
        f"- Product adjacencies (existing products/capabilities near the target market)\n"
        f"- Target customers (segments, pain points, buying criteria, anti-patterns)\n"
        f"- GTM strengths (go-to-market advantages)\n"
        f"- Constraints (hard and soft, with sources)\n"
        f"- Geographic focus\n"
        f"- Risk posture (aggressive/moderate/conservative with reasoning)\n"
        f"- Internal fit signals (why this market could work)\n"
        f"- Internal misfit signals (why this market could be hard)\n\n"
        f"Be specific and cite evidence from the context where possible."
    )

    try:
        result = await llm.chat_structured(
            prompt=prompt,
            response_model=StrategyLensResult,
            model="gpt-4o",
            system="You are a strategy consultant. Extract structured strategic intelligence.",
        )
    except Exception as e:
        logger.error(f"Strategy lens build failed: {e}")
        # Return minimal lens
        return _minimal_lens(company_name)

    # Convert to camelCase dict for API/storage
    lens = {
        "strategicPriorities": [
            {"priority": p.priority, "importance": p.importance,
             "supportingEvidence": p.supporting_evidence}
            for p in result.strategic_priorities
        ],
        "productAdjacencies": result.product_adjacencies,
        "targetCustomers": {
            "segments": result.target_customers.segments,
            "painPoints": result.target_customers.pain_points,
            "buyingCriteria": result.target_customers.buying_criteria,
            "antiPatterns": result.target_customers.anti_patterns,
        },
        "gtmStrengths": result.gtm_strengths,
        "constraints": [
            {"constraint": c.constraint, "severity": c.severity, "source": c.source}
            for c in result.constraints
        ],
        "geographicFocus": result.geographic_focus,
        "riskPosture": {
            "level": result.risk_posture.level,
            "reasoning": result.risk_posture.reasoning,
            "implications": result.risk_posture.implications,
        },
        "internalFitSignals": result.internal_fit_signals,
        "internalMisfitSignals": result.internal_misfit_signals,
    }

    return lens


def _minimal_lens(company_name: str) -> dict:
    return {
        "strategicPriorities": [],
        "productAdjacencies": [],
        "targetCustomers": {"segments": [], "painPoints": [], "buyingCriteria": [], "antiPatterns": []},
        "gtmStrengths": [],
        "constraints": [],
        "geographicFocus": [],
        "riskPosture": {"level": "moderate", "reasoning": "Insufficient context to assess.", "implications": []},
        "internalFitSignals": [],
        "internalMisfitSignals": [],
    }


async def critique_with_lens(lens: dict, finding: str, market_space: str) -> dict:
    """Use the strategy lens to critique a finding — returns fit/misfit signals."""
    fit_signals = lens.get("internalFitSignals", [])
    misfit_signals = lens.get("internalMisfitSignals", [])
    priorities = [p.get("priority", "") for p in lens.get("strategicPriorities", [])]

    prompt = (
        f"Given this strategic context:\n"
        f"Priorities: {', '.join(priorities[:3])}\n"
        f"Fit signals: {', '.join(fit_signals[:3])}\n"
        f"Misfit signals: {', '.join(misfit_signals[:3])}\n\n"
        f"Evaluate this finding about {market_space}:\n{finding}\n\n"
        f"In 2-3 sentences, explain how this finding relates to the company's strategic position. "
        f"Is it aligned with strategic priorities? Does it exploit fit signals or expose misfit signals?"
    )

    try:
        critique = await llm.chat(prompt, model="gpt-4o-mini")
        return {"critique": critique, "lens_applied": True}
    except Exception:
        return {"critique": "", "lens_applied": False}
