"""Analysis endpoints — POST create, GET result, GET status, decision questions."""

import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.api.schemas import (
    AnalysisResultResponse,
    AnalysisStatusResponse,
    AnalysisSummaryResponse,
    AnswerDecisionQuestionRequest,
    ApplyAnswersResponse,
    AskAboutSelectionRequest,
    AskAboutSelectionResponse,
    CreateAnalysisRequest,
    CreateAnalysisResponse,
    DecisionQuestionResponse,
    ResearchStepStatusResponse,
)
from app.config import ANALYSIS_STEPS
from app.persistence import repositories as repo
from app.workflows.decision_questions import resynthesize_with_answers
from app.workflows.orchestrator import run_analysis

router = APIRouter(prefix="/analyses", tags=["analyses"])


@router.get("", response_model=list[AnalysisSummaryResponse])
async def list_analyses():
    """List all analyses with summary data."""
    analyses = await repo.list_analyses()
    results = []
    for a in analyses:
        recommendation = None
        score = None
        confidence_level = None
        confidence_score = None
        if a.result_json:
            try:
                data = json.loads(a.result_json)
                oa = data.get("opportunity_assessment") or data.get("opportunityAssessment")
                if oa:
                    recommendation = oa.get("recommendation")
                    score = oa.get("score")
                    conf = oa.get("confidence")
                    if conf:
                        confidence_level = conf.get("level")
                        confidence_score = conf.get("score")
            except (json.JSONDecodeError, KeyError):
                pass
        results.append(AnalysisSummaryResponse(
            id=a.id, company_name=a.company_name, market_space=a.market_space,
            status=a.status.value, recommendation=recommendation, score=score,
            confidence_level=confidence_level, confidence_score=confidence_score,
            created_at=a.created_at, completed_at=a.completed_at,
        ))
    return results


@router.post("", response_model=CreateAnalysisResponse, status_code=201)
async def create_analysis(req: CreateAnalysisRequest, background_tasks: BackgroundTasks):
    """Create a new strategic opportunity assessment."""
    # Resolve company context: explicit > company profile > None
    company_context = req.company_context
    strategy_lens = None
    if not company_context and req.company_id:
        company = await repo.get_company(req.company_id)
        if company and company.context:
            company_context = company.context
        # Also try to load strategy lens
        lens_row = await repo.get_latest_strategy_lens(req.company_id)
        if lens_row:
            import json as _json
            try:
                strategy_lens = _json.loads(lens_row.lens_json) if hasattr(lens_row, 'lens_json') else None
            except Exception:
                pass

    # Append framing question to context if provided
    effective_context = company_context or ""
    if req.framing_question:
        effective_context = f"{effective_context}\n\nFraming question: {req.framing_question}".strip()

    analysis = await repo.create_analysis(
        company_name=req.company_name,
        market_space=req.market_space,
        company_context=effective_context or None,
    )

    await repo.create_analysis_steps(analysis.id, ANALYSIS_STEPS)

    operation = await repo.create_operation(
        operation_type="analysis",
        parent_id=analysis.id,
        steps_total=len(ANALYSIS_STEPS),
    )

    # Run analysis as background task
    background_tasks.add_task(
        run_analysis,
        analysis_id=analysis.id,
        operation_id=operation.id,
        company_name=req.company_name,
        market_space=req.market_space,
        company_context=effective_context or None,
        strategy_lens=strategy_lens,
    )

    return CreateAnalysisResponse(id=analysis.id, operation_id=operation.id)


@router.delete("/{analysis_id}", status_code=204)
async def delete_analysis(analysis_id: str):
    """Delete an analysis and all related data."""
    deleted = await repo.delete_analysis(analysis_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Analysis not found")


@router.get("/{analysis_id}", response_model=AnalysisResultResponse)
async def get_analysis(analysis_id: str):
    """Get analysis result."""
    analysis = await repo.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    steps = await repo.get_analysis_steps(analysis_id)
    step_responses = [
        ResearchStepStatusResponse(
            step=s.step, label=s.label, status=s.status.value,
            started_at=s.started_at, completed_at=s.completed_at,
        )
        for s in steps
    ]

    if analysis.result_json:
        result_data = json.loads(analysis.result_json)
        return AnalysisResultResponse(**result_data)

    return AnalysisResultResponse(
        id=analysis.id,
        request={
            "company_name": analysis.company_name,
            "market_space": analysis.market_space,
            "company_context": analysis.company_context,
        },
        status=analysis.status.value,
        steps=step_responses,
        created_at=analysis.created_at,
        completed_at=analysis.completed_at,
    )


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(analysis_id: str):
    """Get analysis step statuses."""
    analysis = await repo.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    steps = await repo.get_analysis_steps(analysis_id)
    return AnalysisStatusResponse(
        id=analysis.id,
        status=analysis.status.value,
        steps=[
            ResearchStepStatusResponse(
                step=s.step, label=s.label, status=s.status.value,
                started_at=s.started_at, completed_at=s.completed_at,
            )
            for s in steps
        ],
    )


# ── Decision Questions ──

@router.get("/{analysis_id}/decision-questions", response_model=list[DecisionQuestionResponse])
async def get_decision_questions(analysis_id: str):
    """Get decision questions for an analysis. These are optional clarifications
    that can improve the recommendation if answered."""
    analysis = await repo.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    questions = await repo.get_decision_questions(analysis_id)
    return [_dq_to_response(q) for q in questions]


@router.patch("/{analysis_id}/decision-questions/{question_id}", response_model=DecisionQuestionResponse)
async def answer_decision_question(analysis_id: str, question_id: str, req: AnswerDecisionQuestionRequest):
    """Store a user's answer to a decision question. Does NOT trigger re-synthesis.
    Call POST .../apply-answers to update the recommendation."""
    question = await repo.get_decision_question(question_id)
    if not question or question.analysis_id != analysis_id:
        raise HTTPException(status_code=404, detail="Decision question not found")

    updated = await repo.update_decision_question_answer(question_id, req.answer_value)
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update answer")

    question.answer_value = req.answer_value
    return _dq_to_response(question)


@router.post("/{analysis_id}/apply-answers", response_model=ApplyAnswersResponse)
async def apply_answers(analysis_id: str, background_tasks: BackgroundTasks):
    """Re-run the synthesis layer using existing research + user answers.
    Only updates the recommendation — does NOT re-run market research."""
    analysis = await repo.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if not analysis.result_json:
        raise HTTPException(status_code=400, detail="Analysis has no results yet")

    # Check there are answered questions
    questions = await repo.get_decision_questions(analysis_id)
    answered = [q for q in questions if q.answer_value is not None]
    if not answered:
        raise HTTPException(status_code=400, detail="No answered questions to apply")

    # Create operation for tracking
    operation = await repo.create_operation(
        operation_type="resynthesis",
        parent_id=analysis_id,
        steps_total=1,
    )

    # Run re-synthesis in background
    background_tasks.add_task(_run_resynthesis, analysis_id, operation.id)

    return ApplyAnswersResponse(
        recommendation="updating",
        score=0,
        headline="Re-evaluating with your inputs...",
        user_inputs_applied=len(answered),
        operation_id=operation.id,
    )


async def _run_resynthesis(analysis_id: str, operation_id: str):
    """Background task wrapper for re-synthesis."""
    from app.domain.enums import OperationStatus
    from app.shared.utils import utc_now

    try:
        await repo.update_operation(
            operation_id,
            status=OperationStatus.RUNNING,
            current_step="Re-evaluating recommendation with your inputs...",
        )

        result = await resynthesize_with_answers(analysis_id)

        if result:
            await repo.update_operation(
                operation_id,
                status=OperationStatus.COMPLETED,
                steps_completed=1,
                current_step="Assessment updated",
                completed_at=utc_now(),
            )
        else:
            await repo.update_operation(
                operation_id,
                status=OperationStatus.ERROR,
                error_message="Re-synthesis produced no result",
                completed_at=utc_now(),
            )
    except Exception as e:
        await repo.update_operation(
            operation_id,
            status=OperationStatus.ERROR,
            error_message=str(e),
            completed_at=utc_now(),
        )


@router.post("/{analysis_id}/ask", response_model=AskAboutSelectionResponse)
async def ask_about_selection(analysis_id: str, req: AskAboutSelectionRequest):
    """Answer a user question about selected text, grounded in the analysis data."""
    from app.services.llm import chat

    analysis = await repo.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if not analysis.result_json:
        raise HTTPException(status_code=400, detail="Analysis has no results yet")

    result_data = json.loads(analysis.result_json)

    # Build bounded context from the analysis result
    context_parts: list[str] = []

    # Company info
    context_parts.append(
        f"Company: {analysis.company_name}\n"
        f"Market: {analysis.market_space}"
    )
    if analysis.company_context:
        ctx = analysis.company_context[:500]
        context_parts.append(f"Company context: {ctx}")

    # Pull relevant section based on block category
    category = req.block_category.lower()
    if "incumbent" in category and "incumbents" in result_data:
        inc = result_data["incumbents"]
        context_parts.append(f"Incumbents summary: {inc.get('summary', '')}")
        for p in (inc.get("players") or [])[:5]:
            context_parts.append(f"- {p.get('name')}: {p.get('description', '')}")
    if "emerging" in category and "emerging_competitors" in result_data:
        ec = result_data["emerging_competitors"]
        context_parts.append(f"Emerging competitors summary: {ec.get('summary', '')}")
        for c in (ec.get("competitors") or [])[:5]:
            context_parts.append(f"- {c.get('name')}: {c.get('differentiator', '')}")
    if "market" in category and "market_sizing" in result_data:
        ms = result_data["market_sizing"]
        context_parts.append(
            f"Market sizing: TAM={ms.get('tam','N/A')}, SAM={ms.get('sam','N/A')}, "
            f"CAGR={ms.get('cagr','N/A')}\n{ms.get('summary','')}"
        )

    # Always include the opportunity assessment for grounding
    oa = result_data.get("opportunity_assessment")
    if oa:
        context_parts.append(
            f"Recommendation: {oa.get('recommendation')} (score {oa.get('score')})\n"
            f"Headline: {oa.get('headline')}\n"
            f"Reasoning: {oa.get('reasoning','')[:300]}"
        )

    context_block = "\n\n".join(context_parts)

    system_prompt = (
        "You are a strategic research assistant. Answer the user's question about "
        "the highlighted text, grounded in the analysis data provided. Be concise, "
        "specific, and cite the data when possible. Keep your answer under 200 words. "
        "Write in plain text only — no markdown, no asterisks, no bullet symbols. "
        "Use numbered lists with plain text when listing items."
    )

    user_prompt = (
        f"ANALYSIS CONTEXT:\n{context_block}\n\n"
        f"SELECTED TEXT (from {req.block_label or req.block_category}):\n"
        f'"{req.selected_text}"\n\n'
        f"USER QUESTION:\n{req.question}"
    )

    answer = await chat(prompt=user_prompt, system=system_prompt)

    return AskAboutSelectionResponse(answer=answer.strip())


def _dq_to_response(q) -> DecisionQuestionResponse:
    choices = None
    if q.choices_json:
        try:
            choices = json.loads(q.choices_json)
        except (json.JSONDecodeError, TypeError):
            pass

    return DecisionQuestionResponse(
        id=q.id,
        analysis_id=q.analysis_id,
        category=q.category.value if hasattr(q.category, 'value') else q.category,
        question_text=q.question_text,
        answer_type=q.answer_type.value if hasattr(q.answer_type, 'value') else q.answer_type,
        importance=q.importance,
        decision_impact=q.decision_impact,
        choices=choices,
        answer_value=q.answer_value,
        sort_order=q.sort_order,
        created_at=q.created_at,
    )
