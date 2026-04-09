"""API request/response schemas with camelCase serialization."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict

from app.shared.utils import to_camel


class CamelModel(BaseModel):
    """Base model that serializes to camelCase."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


# ══════════════════════════════════════════════
# Analysis schemas
# ══════════════════════════════════════════════

class CreateAnalysisRequest(CamelModel):
    company_name: str
    market_space: str
    company_context: str | None = None
    company_id: str | None = None
    framing_question: str | None = None


class CreateAnalysisResponse(CamelModel):
    id: str
    operation_id: str


class ConfidenceIndicatorResponse(CamelModel):
    level: str
    score: int
    reasoning: str


class SourceResponse(CamelModel):
    title: str
    url: str
    publisher: str
    date: str | None = None
    snippet: str | None = None
    provider: str | None = None
    source_category: str | None = None


class IncumbentResponse(CamelModel):
    name: str
    description: str
    market_position: str
    strengths: list[str]
    weaknesses: list[str]
    estimated_revenue: str | None = None
    founded: str | None = None
    headquarters: str | None = None


class IncumbentsResultResponse(CamelModel):
    summary: str
    players: list[IncumbentResponse]
    market_concentration: str
    sources: list[SourceResponse]


class EmergingCompetitorResponse(CamelModel):
    name: str
    description: str
    funding_stage: str
    funding_amount: str | None = None
    funding_date: str | None = None
    investors: list[str] | None = None
    differentiator: str


class EmergingCompetitorsResultResponse(CamelModel):
    summary: str
    competitors: list[EmergingCompetitorResponse]
    total_funding_in_space: str
    funding_trend: str
    sources: list[SourceResponse]


class MarketSizingResultResponse(CamelModel):
    summary: str
    tam: str
    sam: str
    som: str | None = None
    cagr: str
    growth_drivers: list[str]
    constraints: list[str]
    timeframe: str
    sources: list[SourceResponse]


class OpportunityAssessmentResponse(CamelModel):
    recommendation: str
    score: int
    headline: str
    reasoning: str
    reasons_to_believe: list[str]
    reasons_to_challenge: list[str]
    white_space_opportunities: list[str]
    key_risks: list[str]


class AnalysisRequestResponse(CamelModel):
    company_name: str
    market_space: str
    company_context: str | None = None


class ResearchStepStatusResponse(CamelModel):
    step: str
    label: str
    status: str
    started_at: str | None = None
    completed_at: str | None = None


class AnalysisResultResponse(CamelModel):
    id: str
    request: AnalysisRequestResponse
    status: str
    steps: list[ResearchStepStatusResponse]
    incumbents: IncumbentsResultResponse | None = None
    emerging_competitors: EmergingCompetitorsResultResponse | None = None
    market_sizing: MarketSizingResultResponse | None = None
    opportunity_assessment: OpportunityAssessmentResponse | None = None
    created_at: str
    completed_at: str | None = None


class AnalysisStatusResponse(CamelModel):
    id: str
    status: str
    steps: list[ResearchStepStatusResponse]


class AnalysisSummaryResponse(CamelModel):
    id: str
    company_name: str
    market_space: str
    status: str
    recommendation: str | None = None
    score: int | None = None
    confidence_level: str | None = None
    confidence_score: int | None = None
    headline: str | None = None
    created_at: str
    completed_at: str | None = None


# ══════════════════════════════════════════════
# Operation schemas
# ══════════════════════════════════════════════

class OperationProgressResponse(CamelModel):
    current_step: str
    steps_completed: int
    steps_total: int
    partial_data: dict[str, Any] | None = None


class OperationResponse(CamelModel):
    id: str
    operation_type: str
    parent_id: str | None = None
    status: str
    progress: OperationProgressResponse | None = None
    error_message: str | None = None
    created_at: str
    completed_at: str | None = None


# ══════════════════════════════════════════════
# Company schemas
# ══════════════════════════════════════════════

class CreateCompanyRequest(CamelModel):
    name: str
    context: str | None = None


class UpdateCompanyContextRequest(CamelModel):
    context: str


class CompanyResponse(CamelModel):
    id: str
    name: str
    context: str | None = None
    created_at: str
    updated_at: str | None = None


class BuildStrategyLensRequest(CamelModel):
    pass  # Uses company context already stored


# ══════════════════════════════════════════════
# Workspace schemas
# ══════════════════════════════════════════════

class WorkspaceStatsResponse(CamelModel):
    total_insights: int
    pinned_insights: int
    visible_insights: int
    collapsed_insights: int
    archived_insights: int
    total_questions: int
    answered_questions: int
    contradiction_count: int


class WorkspaceResponse(CamelModel):
    id: str
    analysis_id: str
    company_id: str | None = None
    company_name: str
    market_space: str
    status: str
    stats: WorkspaceStatsResponse | None = None
    created_at: str
    updated_at: str | None = None


class InsightConfidenceResponse(CamelModel):
    level: str
    score: int
    reasoning: str


class InsightResponse(CamelModel):
    id: str
    workspace_id: str
    question_id: str | None = None
    source_step: str
    display_status: str
    title: str
    body: str
    claim_ids: list[str]
    source_ids: list[str]
    confidence: InsightConfidenceResponse
    tags: list[str]
    contradiction_note: str | None = None
    contradiction_group_id: str | None = None
    related_insight_ids: list[str]
    created_at: str


class UpdateInsightStatusRequest(CamelModel):
    display_status: str


class AskQuestionRequest(CamelModel):
    question_text: str
    parent_question_id: str | None = None


class AskQuestionResponse(CamelModel):
    question_id: str
    operation_id: str
    status: str


class FollowUpResponse(CamelModel):
    id: str
    question_text: str
    reason: str
    status: str


class QuestionAnswerResponse(CamelModel):
    text: str
    confidence: InsightConfidenceResponse
    strategy_lens_applied: bool
    contradictions_found: int


class QuestionResponse(CamelModel):
    id: str
    workspace_id: str
    parent_question_id: str | None = None
    question_text: str
    status: str
    answer: QuestionAnswerResponse | None = None
    insights: list[InsightResponse] | None = None
    follow_ups: list[FollowUpResponse] | None = None
    created_at: str


# ══════════════════════════════════════════════
# Report schemas
# ══════════════════════════════════════════════

class CompileReportRequest(CamelModel):
    report_style: str = "executive_brief"


class CompileReportResponse(CamelModel):
    report_id: str
    operation_id: str
    status: str


class ReportSectionResponse(CamelModel):
    title: str
    body: str
    insight_ids: list[str]
    source_ids: list[str]


class ReportResponse(CamelModel):
    id: str
    workspace_id: str
    analysis_id: str
    report_style: str
    executive_summary: str | None = None
    sections: list[ReportSectionResponse] | None = None
    reasons_to_believe: list[str]
    reasons_to_challenge: list[str]
    open_questions: list[str]
    insight_count: int
    source_count: int
    compiled_at: str | None = None
    created_at: str


# ══════════════════════════════════════════════
# Document schemas
# ══════════════════════════════════════════════

class DocumentResponse(CamelModel):
    id: str
    company_id: str
    filename: str
    content_type: str
    summary: str | None = None
    chunk_count: int
    created_at: str


class UploadDocumentResponse(CamelModel):
    document_id: str
    operation_id: str
    status: str


# ══════════════════════════════════════════════
# Decision Question schemas
# ══════════════════════════════════════════════

class DecisionQuestionResponse(CamelModel):
    id: str
    analysis_id: str
    category: str
    question_text: str
    answer_type: str
    importance: str
    decision_impact: str
    choices: list[str] | None = None
    answer_value: str | None = None
    sort_order: int
    created_at: str


class AnswerDecisionQuestionRequest(CamelModel):
    answer_value: str


class ApplyAnswersResponse(CamelModel):
    recommendation: str
    score: int
    headline: str
    user_inputs_applied: int
    operation_id: str


# ══════════════════════════════════════════════
# Ask about selection schemas
# ══════════════════════════════════════════════

class AskAboutSelectionRequest(CamelModel):
    selected_text: str
    question: str
    block_category: str
    block_label: str


class AskAboutSelectionResponse(CamelModel):
    answer: str
    source_ids: list[str] = []
    confidence: str = "medium"
