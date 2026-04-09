"""Decision questions — uncertainty-driven user input for better recommendations.

Generates structured questions from synthesis output where the system is uncertain.
Re-runs only the synthesis layer when the user applies answers, reusing existing research.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from pydantic import BaseModel

from app.config import MAX_DECISION_QUESTIONS
from app.domain.enums import AnswerType, DecisionQuestionCategory
from app.domain.models import DecisionQuestion
from app.persistence import repositories as repo
from app.services import llm
from app.shared.utils import generate_id, utc_now

logger = logging.getLogger(__name__)


# ── LLM schema for question generation ──

class GeneratedQuestion(BaseModel):
    question_text: str
    category: str  # strategic_fit, risk_tolerance, capability, market_intent, leadership, constraints
    answer_type: str  # scale_1_5, yes_no, multiple_choice, short_text
    importance: str  # high, medium, low
    decision_impact: str  # how this answer affects the recommendation
    choices: list[str] | None = None  # for multiple_choice


class GeneratedQuestionsResult(BaseModel):
    questions: list[GeneratedQuestion]


# ── Question generation ──

async def generate_decision_questions(
    analysis_id: str,
    synthesis_data: dict[str, Any],
    company_name: str,
    market_space: str,
    company_context: str | None = None,
    strategy_lens: dict | None = None,
) -> list[DecisionQuestion]:
    """Generate decision questions from synthesis output + strategy lens gaps.

    Called once after initial synthesis. Identifies where human judgment
    would materially improve the recommendation.
    """
    # Gather signals of uncertainty
    leadership_questions = synthesis_data.get("needsLeadershipInput", [])
    conditions = synthesis_data.get("conditionsToPursue", [])
    key_risks = synthesis_data.get("keyRisks", [])
    recommendation = synthesis_data.get("recommendation", "maybe")
    score = synthesis_data.get("score", 50)

    # Strategy lens gaps
    lens_gaps = _identify_lens_gaps(strategy_lens) if strategy_lens else [
        "No company strategy context provided"
    ]

    prompt = (
        f"You are helping evaluate whether {company_name} should pursue the {market_space} opportunity.\n\n"
        f"Current recommendation: {recommendation} (score: {score}/100)\n\n"
        f"The system identified these areas needing human judgment:\n"
        f"- Leadership questions: {'; '.join(leadership_questions[:3]) if leadership_questions else 'none'}\n"
        f"- Key conditions: {'; '.join(conditions[:3]) if conditions else 'none'}\n"
        f"- Key risks: {'; '.join(key_risks[:3]) if key_risks else 'none'}\n"
        f"- Strategy gaps: {'; '.join(lens_gaps[:3])}\n"
        f"{'Company context: ' + company_context[:300] if company_context else ''}\n\n"
        f"Generate {MAX_DECISION_QUESTIONS} structured questions that would MOST improve "
        f"the quality of the recommendation if answered by the user.\n\n"
        f"Rules:\n"
        f"- Only ask things that materially affect the go/no-go decision\n"
        f"- Only ask things the system cannot reliably discover from public research\n"
        f"- Prefer yes/no or scale_1_5 for quantifiable judgments\n"
        f"- Use multiple_choice when there are 3-5 clear options\n"
        f"- Use short_text only for open-ended strategic context\n"
        f"- Each question must explain its decision_impact: how the answer changes the assessment\n"
        f"- Categories: strategic_fit, risk_tolerance, capability, market_intent, leadership, constraints\n"
        f"- Importance: high (directly changes recommendation), medium (adjusts confidence), low (adds nuance)\n"
        f"- At least 2 questions should be 'high' importance\n"
        f"- Order by importance (high first)"
    )

    try:
        result = await llm.chat_structured(
            prompt=prompt,
            response_model=GeneratedQuestionsResult,
            model="gpt-4o-mini",
            system=(
                "You are a strategy consultant identifying the specific judgment calls "
                "that would most improve a market opportunity assessment. "
                "Ask only high-value questions the AI cannot answer from public research."
            ),
            max_tokens=2048,
        )
    except Exception as e:
        logger.error(f"Decision question generation failed: {e}")
        # Fall back to deterministic questions from synthesis output
        return await _generate_fallback_questions(analysis_id, leadership_questions, lens_gaps)

    # Persist generated questions
    created: list[DecisionQuestion] = []
    for i, gq in enumerate(result.questions[:MAX_DECISION_QUESTIONS]):
        # Validate enums
        try:
            cat = DecisionQuestionCategory(gq.category)
        except ValueError:
            cat = DecisionQuestionCategory.STRATEGIC_FIT
        try:
            at = AnswerType(gq.answer_type)
        except ValueError:
            at = AnswerType.SCALE_1_5

        choices = json.dumps(gq.choices) if gq.choices else None

        dq = await repo.create_decision_question(
            analysis_id=analysis_id,
            category=cat.value,
            question_text=gq.question_text,
            answer_type=at.value,
            importance=gq.importance if gq.importance in ("high", "medium", "low") else "medium",
            decision_impact=gq.decision_impact,
            choices_json=choices,
            sort_order=i,
        )
        created.append(dq)

    logger.info(f"Generated {len(created)} decision questions for analysis {analysis_id}")
    return created


async def _generate_fallback_questions(
    analysis_id: str,
    leadership_questions: list[str],
    lens_gaps: list[str],
) -> list[DecisionQuestion]:
    """Deterministic fallback when LLM is unavailable."""
    created: list[DecisionQuestion] = []

    # Convert leadership_questions directly
    for i, lq in enumerate(leadership_questions[:3]):
        dq = await repo.create_decision_question(
            analysis_id=analysis_id,
            category="leadership",
            question_text=lq,
            answer_type="short_text",
            importance="high",
            decision_impact="Directly addresses an open leadership question from the assessment.",
            sort_order=i,
        )
        created.append(dq)

    # Add strategic-fit questions for lens gaps
    gap_questions = {
        "No strategic priorities defined": (
            "What are your top 2-3 strategic priorities this year?",
            "strategic_fit", "short_text", "high",
            "Allows the system to evaluate alignment with company direction."
        ),
        "No constraints defined": (
            "Are there hard constraints (budget, timeline, regulatory) that would block this opportunity?",
            "constraints", "yes_no", "medium",
            "Hard constraints can disqualify an opportunity regardless of market attractiveness."
        ),
        "No risk posture defined": (
            "How would you characterize leadership's risk appetite for new market entry?",
            "risk_tolerance", "multiple_choice", "medium",
            "Risk tolerance shapes whether 'maybe' opportunities become 'go' or 'no-go'.",
        ),
    }

    for gap in lens_gaps[:3]:
        for gap_key, (qt, cat, at, imp, impact) in gap_questions.items():
            if gap_key.lower() in gap.lower():
                choices = json.dumps(["Conservative", "Moderate", "Aggressive"]) if at == "multiple_choice" else None
                dq = await repo.create_decision_question(
                    analysis_id=analysis_id,
                    category=cat,
                    question_text=qt,
                    answer_type=at,
                    importance=imp,
                    decision_impact=impact,
                    choices_json=choices,
                    sort_order=len(created),
                )
                created.append(dq)
                break

    return created[:MAX_DECISION_QUESTIONS]


def _identify_lens_gaps(lens: dict) -> list[str]:
    """Identify missing or thin sections in the strategy lens."""
    gaps = []
    if not lens.get("strategicPriorities"):
        gaps.append("No strategic priorities defined")
    if not lens.get("constraints"):
        gaps.append("No constraints defined")
    if not lens.get("riskPosture") or lens.get("riskPosture", {}).get("level") == "moderate":
        gaps.append("No risk posture defined (defaulted to moderate)")
    if not lens.get("targetCustomers") or not lens.get("targetCustomers", {}).get("segments"):
        gaps.append("No target customer segments defined")
    if not lens.get("gtmStrengths"):
        gaps.append("No GTM strengths identified")
    if not lens.get("internalFitSignals"):
        gaps.append("No internal fit signals identified")
    return gaps


# ── Replacement question generation ──

class _SingleQuestion(BaseModel):
    question_text: str
    category: str
    answer_type: str
    importance: str
    decision_impact: str
    choices: list[str] | None = None


async def _generate_one_question(
    analysis_id: str,
    existing_questions: list[DecisionQuestion],
    synthesis_data: dict[str, Any],
    company_name: str,
    market_space: str,
    avoid_texts: list[str],
    sort_order: int = 0,
) -> DecisionQuestion | None:
    """Core helper: generate and persist one new decision question."""
    recommendation = synthesis_data.get("recommendation", "maybe")
    score = synthesis_data.get("score", 50)
    key_risks = synthesis_data.get("keyRisks", [])
    conditions = synthesis_data.get("conditionsToPursue", [])
    existing_texts = [q.question_text for q in existing_questions]

    all_avoid = list(dict.fromkeys(avoid_texts + existing_texts))  # deduplicated, order preserved

    prompt = (
        f"You are helping evaluate whether {company_name} should pursue the {market_space} opportunity.\n"
        f"Current recommendation: {recommendation} (score: {score}/100)\n"
        f"Key risks: {'; '.join(key_risks[:3]) if key_risks else 'none'}\n"
        f"Conditions to pursue: {'; '.join(conditions[:3]) if conditions else 'none'}\n\n"
        + (
            "These questions already exist or were dismissed — do NOT repeat them or ask anything similar:\n"
            + "\n".join(f"  - {t}" for t in all_avoid)
            + "\n\n"
            if all_avoid else ""
        )
        + "Generate exactly ONE new decision question that:\n"
        "- Is genuinely different from all the above\n"
        "- Asks something only the user can answer (not derivable from public research)\n"
        "- Would materially affect the go/no-go decision if answered\n"
        "- Can be any answer type: scale_1_5, yes_no, multiple_choice, or short_text\n"
        "- Has a clear decision_impact explaining how the answer changes the assessment\n"
        "- Category: strategic_fit, risk_tolerance, capability, market_intent, leadership, or constraints\n"
        "- Importance: high, medium, or low"
    )

    try:
        gq = await llm.chat_structured(
            prompt=prompt,
            response_model=_SingleQuestion,
            model="gpt-4o-mini",
            system=(
                "You are a strategy consultant. Generate a single high-value decision question "
                "that the AI cannot answer from public research alone."
            ),
            max_tokens=512,
        )
    except Exception as e:
        logger.error(f"Single question generation failed: {e}")
        return None

    try:
        cat = DecisionQuestionCategory(gq.category)
    except ValueError:
        cat = DecisionQuestionCategory.STRATEGIC_FIT
    try:
        at = AnswerType(gq.answer_type)
    except ValueError:
        at = AnswerType.YES_NO

    choices = json.dumps(gq.choices) if gq.choices else None
    importance = gq.importance if gq.importance in ("high", "medium", "low") else "medium"

    return await repo.create_decision_question(
        analysis_id=analysis_id,
        category=cat.value,
        question_text=gq.question_text,
        answer_type=at.value,
        importance=importance,
        decision_impact=gq.decision_impact,
        choices_json=choices,
        sort_order=sort_order,
    )


async def generate_replacement_question(
    analysis_id: str,
    dismissed_question_text: str,
    existing_questions: list[DecisionQuestion],
    synthesis_data: dict[str, Any],
    company_name: str,
    market_space: str,
    sort_order: int = 0,
) -> DecisionQuestion | None:
    """Generate a replacement for a dismissed question."""
    return await _generate_one_question(
        analysis_id=analysis_id,
        existing_questions=existing_questions,
        synthesis_data=synthesis_data,
        company_name=company_name,
        market_space=market_space,
        avoid_texts=[dismissed_question_text],
        sort_order=sort_order,
    )


async def generate_additional_question(
    analysis_id: str,
    existing_questions: list[DecisionQuestion],
    synthesis_data: dict[str, Any],
    company_name: str,
    market_space: str,
) -> DecisionQuestion | None:
    """Generate one new question to add after the user answers one.

    Avoids repeating anything already in the list (answered or not).
    """
    sort_order = max((q.sort_order for q in existing_questions), default=0) + 1
    return await _generate_one_question(
        analysis_id=analysis_id,
        existing_questions=existing_questions,
        synthesis_data=synthesis_data,
        company_name=company_name,
        market_space=market_space,
        avoid_texts=[],
        sort_order=sort_order,
    )


# ── Re-synthesis with user answers ──

async def resynthesize_with_answers(
    analysis_id: str,
) -> dict[str, Any] | None:
    """Re-run only the synthesis layer using existing research + user answers.

    Loads the existing analysis result, extracts research data, injects
    user answers as additional context, and produces an updated assessment.
    Cost: 1 GPT-4o call. No Tavily/external provider calls.
    """
    from app.agents.synthesis import (
        OpportunityAssessmentResult, _POSTURE_FRAMING, _build_research_summary,
    )

    # Load existing analysis
    analysis = await repo.get_analysis(analysis_id)
    if not analysis or not analysis.result_json:
        logger.error(f"Cannot resynthesize: analysis {analysis_id} not found or no result")
        return None

    result_data = json.loads(analysis.result_json)
    incumbents_data = result_data.get("incumbents") or {}
    emerging_data = result_data.get("emergingCompetitors") or {}
    market_data = result_data.get("marketSizing") or {}

    # Load answered decision questions
    questions = await repo.get_decision_questions(analysis_id)
    answered = [q for q in questions if q.answer_value is not None]

    if not answered:
        logger.info(f"No answered questions for {analysis_id}, skipping re-synthesis")
        return None

    # Build user input context
    user_input_context = _build_user_input_context(answered)

    # Load past ask-about-selection interactions for richer context
    interactions = await repo.get_recent_interactions(analysis_id, limit=6)
    if interactions:
        interaction_lines = []
        for i in reversed(interactions):
            interaction_lines.append(f"- User asked: {i['user_input'][:120]}\n  Answer: {i['ai_response'][:150]}")
        user_input_context += "\n\nPrior workspace interactions:\n" + "\n".join(interaction_lines)

    # Build research summary (reused from existing data)
    research_summary = _build_research_summary(incumbents_data, emerging_data, market_data)

    # Load strategy lens if available
    # Try to find company_id from workspace
    ws = await repo.get_workspace_by_analysis(analysis_id)
    strategy_context = ""
    if ws and ws.company_id:
        lens_row = await repo.get_latest_strategy_lens(ws.company_id)
        if lens_row:
            try:
                lens = json.loads(lens_row.lens_json) if hasattr(lens_row, 'lens_json') else None
                if lens:
                    priorities = lens.get("strategicPriorities", [])
                    if priorities:
                        strategy_context = (
                            f"\nCompany strategic context:\n"
                            f"Priorities: {', '.join(p.get('priority', '') for p in priorities[:3])}\n"
                            f"GTM strengths: {', '.join(lens.get('gtmStrengths', [])[:3])}\n"
                        )
            except Exception:
                pass

    company_name = analysis.company_name
    market_space = analysis.market_space

    posture = "established_company"  # Default; could be stored on analysis
    framing = _POSTURE_FRAMING.get(posture, _POSTURE_FRAMING["established_company"])
    framing = framing.format(company=company_name, market=market_space)

    prompt = (
        f"{framing}\n"
        f"{'Company context: ' + analysis.company_context if analysis.company_context else ''}\n"
        f"{strategy_context}\n\n"
        f"Research findings:\n{research_summary}\n\n"
        f"IMPORTANT — The user has provided the following strategic inputs "
        f"to clarify areas of uncertainty:\n{user_input_context}\n\n"
        f"Using BOTH the research findings AND the user's inputs, provide an UPDATED strategic assessment.\n"
        f"The user's inputs should materially affect your recommendation where relevant.\n\n"
        f"Provide:\n"
        f"- Recommendation: Go / No-Go / Maybe\n"
        f"- Opportunity score (0-100)\n"
        f"- A one-line headline\n"
        f"- Detailed reasoning (2-3 paragraphs) that explicitly references the user's inputs\n"
        f"- Strategic fit summary incorporating the user's strategic context\n"
        f"- 4-6 reasons to believe\n"
        f"- 4-5 reasons to challenge\n"
        f"- 3-4 conditions to pursue\n"
        f"- 3-4 white space opportunities\n"
        f"- 3-4 key risks\n"
        f"- Timing assessment\n"
        f"- Right to win\n"
        f"- 2-3 remaining questions that still need human judgment\n\n"
        f"Be balanced and specific. Incorporate the user's inputs naturally."
    )

    try:
        assessment = await llm.chat_structured(
            prompt=prompt,
            response_model=OpportunityAssessmentResult,
            model="gpt-4o",
            system=(
                "You are a senior strategy consultant. The user has provided additional "
                "strategic inputs to resolve uncertainties. Use these inputs alongside "
                "the research to produce an improved, more confident assessment."
            ),
        )
    except Exception as e:
        logger.error(f"Re-synthesis failed: {e}")
        return None

    # Build updated assessment data
    confidence = {
        "level": "high" if assessment.score >= 70 else "medium" if assessment.score >= 40 else "low",
        "score": min(assessment.score + 10, 100),
        "reasoning": (
            f"Updated with {len(answered)} user inputs. "
            f"Synthesized from research + strategic context."
        ),
    }

    updated_assessment = {
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
        "userInputsApplied": len(answered),
    }

    # Update only the opportunityAssessment in result_json
    result_data["opportunityAssessment"] = updated_assessment
    await repo.store_analysis_result(analysis_id, json.dumps(result_data))

    logger.info(
        f"Re-synthesis complete for {analysis_id}: "
        f"{assessment.recommendation} (score={assessment.score}), "
        f"{len(answered)} user inputs applied"
    )

    return updated_assessment


def _build_user_input_context(questions: list[DecisionQuestion]) -> str:
    """Format answered decision questions as context for the synthesis prompt."""
    parts = []
    for q in questions:
        if q.answer_value is None:
            continue
        # Format based on answer type
        if q.answer_type == AnswerType.SCALE_1_5:
            answer_text = f"{q.answer_value}/5"
        elif q.answer_type == AnswerType.YES_NO:
            answer_text = q.answer_value
        else:
            answer_text = q.answer_value

        category_label = q.category.value.replace("_", " ").title()
        parts.append(
            f"[{category_label} — {q.importance} importance] "
            f"Q: {q.question_text}\n"
            f"A: {answer_text}\n"
            f"(Impact: {q.decision_impact})"
        )

    return "\n\n".join(parts)
