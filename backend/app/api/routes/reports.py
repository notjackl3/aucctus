"""Report endpoints — compile and retrieve."""

import json

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.api.schemas import (
    CompileReportRequest, CompileReportResponse,
    ReportResponse, ReportSectionResponse,
)
from app.persistence import repositories as repo
from app.reports.compiler import compile_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=CompileReportResponse, status_code=201)
async def start_compile(req: CompileReportRequest, background_tasks: BackgroundTasks,
                        workspace_id: str | None = None, analysis_id: str | None = None):
    """Compile a report from workspace insights."""
    # Resolve workspace
    if workspace_id:
        ws = await repo.get_workspace(workspace_id)
    elif analysis_id:
        ws = await repo.get_workspace_by_analysis(analysis_id)
    else:
        raise HTTPException(status_code=400, detail="Provide workspace_id or analysis_id")

    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    report = await repo.create_report(ws.id, ws.analysis_id)
    operation = await repo.create_operation("report_compile", parent_id=ws.id, steps_total=3)

    background_tasks.add_task(compile_report, report.id, ws.id, ws.analysis_id, operation.id)

    return CompileReportResponse(report_id=report.id, operation_id=operation.id, status="pending")


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    report = await repo.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _report_to_response(report)


@router.get("/by-workspace/{workspace_id}", response_model=ReportResponse)
async def get_report_by_workspace(workspace_id: str):
    report = await repo.get_report_by_workspace(workspace_id)
    if not report:
        raise HTTPException(status_code=404, detail="No report found for this workspace")
    return _report_to_response(report)


def _report_to_response(report) -> ReportResponse:
    sections = None
    if report.sections_json:
        raw_sections = json.loads(report.sections_json)
        sections = [
            ReportSectionResponse(
                title=s["title"], body=s["body"],
                insight_ids=s.get("insightIds", []),
                source_ids=s.get("sourceIds", []),
            )
            for s in raw_sections
        ]

    return ReportResponse(
        id=report.id, workspace_id=report.workspace_id,
        analysis_id=report.analysis_id, report_style=report.report_style,
        executive_summary=report.executive_summary,
        sections=sections,
        reasons_to_believe=report.reasons_to_believe,
        reasons_to_challenge=report.reasons_to_challenge,
        open_questions=report.open_questions,
        insight_count=report.insight_count,
        source_count=report.source_count,
        compiled_at=report.compiled_at,
        created_at=report.created_at,
    )
