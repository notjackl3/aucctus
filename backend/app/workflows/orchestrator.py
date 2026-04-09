"""Analysis orchestrator — runs the full research pipeline.

Coordinates research agents, updates step/operation status, stores results.
Supports both real API mode and mock fallback.
"""

import asyncio
import json
import logging
import traceback

from app.agents.base import AgentContext, AgentResult
from app.agents import incumbents, emerging, market_sizing, synthesis
from app.config import ANALYSIS_STEPS, DEFAULT_EVALUATION_POSTURE, MAX_REFINEMENT_ATTEMPTS, use_real_apis
from app.services.search import get_tavily_stats, reset_tavily_stats
from app.domain.enums import AnalysisStatus, OperationStatus
from app.evidence.claims import find_contradictions, merge_duplicate_claims
from app.mock.data import build_mock_result
from app.persistence import repositories as repo
from app.retrieval.coverage import evaluate_coverage
from app.retrieval.query_planner import build_query_plan, generate_refinement_queries
from app.shared.utils import utc_now
from app.workflows.decision_questions import generate_decision_questions

logger = logging.getLogger(__name__)


async def run_analysis(
    analysis_id: str,
    operation_id: str,
    company_name: str,
    market_space: str,
    company_context: str | None = None,
    strategy_lens: dict | None = None,
    evaluation_posture: str | None = None,
) -> None:
    """Run the full analysis pipeline. Called as a background task."""
    try:
        # Mark running
        await repo.update_operation(operation_id, status=OperationStatus.RUNNING, current_step="Starting analysis...")
        await repo.update_analysis_status(analysis_id, AnalysisStatus.RUNNING)

        if not use_real_apis():
            await _run_mock_pipeline(analysis_id, operation_id, company_name, market_space, company_context)
            return

        reset_tavily_stats()

        posture = evaluation_posture or DEFAULT_EVALUATION_POSTURE

        # ── Query planning phase ──
        await repo.update_operation(operation_id, current_step="Planning research queries...")
        query_plan = await build_query_plan(
            market_space=market_space,
            company_name=company_name,
            company_context=company_context,
            strategy_lens=strategy_lens,
            evaluation_posture=posture,
        )

        ctx = AgentContext(
            analysis_id=analysis_id,
            company_name=company_name,
            market_space=market_space,
            company_context=company_context,
            strategy_lens=strategy_lens,
            evaluation_posture=posture,
            query_plan=query_plan,
        )

        steps = await repo.get_analysis_steps(analysis_id)
        step_map = {s.step: s for s in steps}

        # ── Run 3 research agents in parallel ──
        await repo.update_operation(operation_id, current_step="Researching incumbents, emerging competitors, and market sizing...")

        for step_key in ["incumbents", "emerging_competitors", "market_sizing"]:
            if step_key in step_map:
                await repo.update_step_status(step_map[step_key].id, AnalysisStatus.RUNNING, started_at=utc_now())

        inc_task = asyncio.create_task(_run_agent_safe(incumbents.run, ctx, "incumbents"))
        emg_task = asyncio.create_task(_run_agent_safe(emerging.run, ctx, "emerging_competitors"))
        mkt_task = asyncio.create_task(_run_agent_safe(market_sizing.run, ctx, "market_sizing"))

        inc_result, emg_result, mkt_result = await asyncio.gather(inc_task, emg_task, mkt_task)

        # ── Coverage evaluation + bounded refinement ──
        coverage = evaluate_coverage({
            "incumbents": inc_result.sources,
            "emerging": emg_result.sources,
            "market_sizing": mkt_result.sources,
        })

        if coverage.should_refine:
            logger.info(f"Coverage weak ({coverage.overall_score:.2f}), running refinement for: {coverage.weak_dimensions}")
            await repo.update_operation(operation_id, current_step="Refining weak coverage areas...")
            inc_result, emg_result, mkt_result = await _run_refinement(
                ctx, query_plan, coverage, inc_result, emg_result, mkt_result
            )

        # Mark research steps completed
        completed_count = 0
        for result, step_key in [(inc_result, "incumbents"), (emg_result, "emerging_competitors"), (mkt_result, "market_sizing")]:
            if step_key in step_map:
                status = AnalysisStatus.COMPLETED if not result.error else AnalysisStatus.ERROR
                await repo.update_step_status(step_map[step_key].id, status, completed_at=utc_now())
                if not result.error:
                    completed_count += 1

        await repo.update_operation(operation_id, steps_completed=completed_count, current_step="Running synthesis...")

        # Synthesis step
        if "synthesis" in step_map:
            await repo.update_step_status(step_map["synthesis"].id, AnalysisStatus.RUNNING, started_at=utc_now())

        syn_result = await _run_agent_safe(
            lambda c: synthesis.run(c, inc_result.data, emg_result.data, mkt_result.data),
            ctx, "synthesis"
        )

        if "synthesis" in step_map:
            status = AnalysisStatus.COMPLETED if not syn_result.error else AnalysisStatus.ERROR
            await repo.update_step_status(step_map["synthesis"].id, status, completed_at=utc_now())

        # Persist sources and claims
        all_sources = inc_result.sources + emg_result.sources + mkt_result.sources
        all_claims = inc_result.claims + emg_result.claims + mkt_result.claims

        for source in all_sources:
            await repo.create_source(source)

        # Dedup and persist claims
        merged_claims = merge_duplicate_claims(all_claims)
        for claim in merged_claims:
            await repo.create_claim(claim)

        # Find contradictions
        contradictions = find_contradictions(merged_claims, analysis_id)
        for ctg in contradictions:
            await repo.create_contradiction(ctg)

        # Build and store result JSON
        now = utc_now()
        updated_steps = await repo.get_analysis_steps(analysis_id)
        result_json = _build_result_json(
            analysis_id, company_name, market_space, company_context,
            inc_result, emg_result, mkt_result, syn_result,
            updated_steps, now,
        )

        await repo.store_analysis_result(analysis_id, json.dumps(result_json))

        # Create workspace and seed insights
        all_insights = inc_result.insights + emg_result.insights + mkt_result.insights + syn_result.insights
        workspace = await repo.create_workspace(analysis_id, None, company_name, market_space)
        for ins_data in all_insights:
            await repo.create_insight(workspace.id, ins_data)

        # Generate decision questions from synthesis output (best-effort)
        if syn_result.data and not syn_result.error:
            try:
                await generate_decision_questions(
                    analysis_id=analysis_id,
                    synthesis_data=syn_result.data,
                    company_name=company_name,
                    market_space=market_space,
                    company_context=company_context,
                    strategy_lens=strategy_lens,
                )
            except Exception as e:
                logger.warning(f"Decision question generation failed (non-blocking): {e}")

        # Log Tavily usage
        stats = get_tavily_stats()
        logger.info(f"Analysis {analysis_id} Tavily usage: {stats['calls']} calls, ~{stats['estimated_credits']} credits")

        # Mark operation completed
        has_errors = any(r.error for r in [inc_result, emg_result, mkt_result, syn_result])
        final_status = OperationStatus.COMPLETED_WITH_WARNINGS if has_errors else OperationStatus.COMPLETED
        await repo.update_operation(
            operation_id,
            status=final_status,
            steps_completed=len(ANALYSIS_STEPS),
            current_step="Analysis complete",
            completed_at=utc_now(),
        )

    except Exception as e:
        logger.error(f"Analysis pipeline failed: {traceback.format_exc()}")
        await repo.update_analysis_status(analysis_id, AnalysisStatus.ERROR)
        await repo.update_operation(
            operation_id,
            status=OperationStatus.ERROR,
            error_message=str(e),
            completed_at=utc_now(),
        )


async def _run_agent_safe(agent_fn, ctx: AgentContext, step_name: str) -> AgentResult:
    """Run an agent with error isolation."""
    try:
        return await agent_fn(ctx)
    except Exception as e:
        logger.error(f"Agent {step_name} failed: {e}")
        return AgentResult(step=step_name, data={}, error=str(e))


async def _run_refinement(
    ctx: AgentContext,
    query_plan,
    coverage,
    inc_result: AgentResult,
    emg_result: AgentResult,
    mkt_result: AgentResult,
) -> tuple[AgentResult, AgentResult, AgentResult]:
    """Run one bounded refinement pass for weak coverage dimensions.

    Generates additional queries from the query plan and runs targeted
    supplemental searches. Merges new sources into existing results.
    """
    from app.evidence.processor import process_search_results
    from app.services import search as search_svc

    refinement_queries = generate_refinement_queries(query_plan, coverage.weak_dimensions)

    for dim, pq in refinement_queries.items():
        try:
            new_sources = []
            # Run refinement Tavily queries
            for query in pq.tavily[:1]:  # At most 1 extra Tavily query per weak dim
                results = await search_svc.search(query, max_results=5)
                if results:
                    if dim == "incumbents":
                        existing_urls = {s.url for s in inc_result.sources}
                    elif dim == "emerging":
                        existing_urls = {s.url for s in emg_result.sources}
                    else:
                        existing_urls = {s.url for s in mkt_result.sources}
                    sources = process_search_results(results, ctx.analysis_id, existing_urls)
                    new_sources.extend(sources)

            if new_sources:
                if dim == "incumbents":
                    inc_result.sources.extend(new_sources)
                elif dim == "emerging":
                    emg_result.sources.extend(new_sources)
                elif dim == "market_sizing":
                    mkt_result.sources.extend(new_sources)
                logger.info(f"Refinement added {len(new_sources)} sources for {dim}")
        except Exception as e:
            logger.warning(f"Refinement for {dim} failed: {e}")

    return inc_result, emg_result, mkt_result


async def _run_mock_pipeline(
    analysis_id: str,
    operation_id: str,
    company_name: str,
    market_space: str,
    company_context: str | None,
) -> None:
    """Fallback mock pipeline when API keys aren't configured."""
    steps = await repo.get_analysis_steps(analysis_id)
    now = utc_now()
    for step in steps:
        await repo.update_step_status(step.id, AnalysisStatus.COMPLETED, started_at=now, completed_at=now)

    mock_result = build_mock_result(analysis_id, company_name, market_space, company_context)
    await repo.store_analysis_result(analysis_id, json.dumps(mock_result))

    # Create workspace and seed mock insights (mirrors real pipeline behavior)
    workspace = await repo.create_workspace(analysis_id, None, company_name, market_space)
    mock_insights = _build_mock_insights(company_name, market_space)
    for ins_data in mock_insights:
        await repo.create_insight(workspace.id, ins_data)

    await repo.update_operation(
        operation_id,
        status=OperationStatus.COMPLETED,
        steps_completed=len(ANALYSIS_STEPS),
        current_step="Analysis complete (mock)",
        completed_at=utc_now(),
    )


def _build_result_json(
    analysis_id: str,
    company_name: str,
    market_space: str,
    company_context: str | None,
    inc: AgentResult,
    emg: AgentResult,
    mkt: AgentResult,
    syn: AgentResult,
    steps: list,
    completed_at: str,
) -> dict:
    """Build the full AnalysisResult JSON matching the frontend contract."""
    return {
        "id": analysis_id,
        "request": {
            "companyName": company_name,
            "marketSpace": market_space,
            "companyContext": company_context,
        },
        "status": "completed",
        "steps": [
            {
                "step": s.step,
                "label": s.label,
                "status": s.status.value,
                "startedAt": s.started_at,
                "completedAt": s.completed_at,
            }
            for s in steps
        ],
        "incumbents": inc.data if inc.data else None,
        "emergingCompetitors": emg.data if emg.data else None,
        "marketSizing": mkt.data if mkt.data else None,
        "opportunityAssessment": syn.data if syn.data else None,
        "createdAt": steps[0].started_at if steps else completed_at,
        "completedAt": completed_at,
    }


def _build_mock_insights(company_name: str, market_space: str) -> list[dict]:
    """Build 16 mock insights for workspace seeding."""
    steps = ["incumbents", "emerging_competitors", "market_sizing", "synthesis"]
    insights = []
    templates = [
        ("Market leaders dominate {market}", "The {market} market is led by established players with strong moats in distribution and brand recognition.", "pinned"),
        ("High growth trajectory", "The {market} market is growing at 15-20% CAGR, driven by digital transformation and automation demand.", "pinned"),
        ("{company} competitive positioning", "{company} is well-positioned relative to incumbents due to modern tech stack and go-to-market efficiency.", "suggested"),
        ("Funding activity intensifying", "Over $2B in venture funding has flowed into the {market} space in the last 18 months.", "suggested"),
        ("Enterprise segment opportunity", "Large enterprises remain underserved by current solutions, creating a significant TAM opportunity.", "visible"),
        ("SMB market saturated", "The SMB segment is highly competitive with low switching costs and price pressure.", "visible"),
        ("API-first architecture trend", "Winning products in {market} are adopting API-first architectures for better integration.", "visible"),
        ("Regulatory tailwinds", "New compliance requirements are creating demand for modern {market} solutions.", "visible"),
        ("Incumbent weakness in UX", "Legacy players consistently score low on user experience in analyst reviews.", "suggested"),
        ("International expansion opportunity", "Most {market} players are US-focused, leaving international markets underserved.", "visible"),
        ("AI/ML differentiation potential", "Machine learning capabilities are becoming a key differentiator in {market}.", "visible"),
        ("Channel partner ecosystem", "Strong channel partnerships are critical for enterprise distribution in this market.", "visible"),
        ("Customer retention rates high", "Top {market} vendors report 90%+ net revenue retention, indicating strong product-market fit.", "visible"),
        ("Pricing pressure from open source", "Open-source alternatives are creating pricing pressure in the lower market segments.", "collapsed"),
        ("Consolidation expected", "Market consolidation through M&A is expected in the next 12-18 months.", "visible"),
        ("Data moat opportunity", "{company} can build a data moat through aggregated benchmarking insights.", "suggested"),
    ]
    for i, (title_t, body_t, status) in enumerate(templates):
        step = steps[i % len(steps)]
        insights.append({
            "source_step": step,
            "display_status": status,
            "title": title_t.format(company=company_name, market=market_space),
            "body": body_t.format(company=company_name, market=market_space),
            "claim_ids": [],
            "source_ids": [],
            "confidence_score": 65 + (i % 3) * 10,
            "confidence_level": "high" if i < 4 else "medium",
            "confidence_reasoning": "Based on mock analysis data",
            "tags": [step.replace("_", "-")],
        })
    return insights
