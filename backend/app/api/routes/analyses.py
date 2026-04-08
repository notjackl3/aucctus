"""Analysis endpoints — POST create, GET result, GET status."""

import asyncio
import json

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.api.schemas import (
    AnalysisResultResponse,
    AnalysisStatusResponse,
    AnalysisSummaryResponse,
    CreateAnalysisRequest,
    CreateAnalysisResponse,
    ResearchStepStatusResponse,
)
from app.config import ANALYSIS_STEPS
from app.persistence import repositories as repo
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
    """Create a new competitive landscape analysis."""
    analysis = await repo.create_analysis(
        company_name=req.company_name,
        market_space=req.market_space,
        company_context=req.company_context,
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
        company_context=req.company_context,
    )

    return CreateAnalysisResponse(id=analysis.id, operation_id=operation.id)


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
