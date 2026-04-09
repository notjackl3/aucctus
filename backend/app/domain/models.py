"""Core domain models.

These are internal domain representations. API-facing shapes live in api/schemas.py.
Organized by domain: analysis, evidence, company.
"""

from dataclasses import dataclass, field
from typing import Any

from app.domain.enums import (
    AnalysisStatus, AnswerType, ClaimType, DecisionQuestionCategory,
    DisplayStatus, OperationStatus, QuestionStatus, SourceCategory,
    SourceProvider, SourceTier,
)


# ── Analysis ──

@dataclass
class Analysis:
    id: str
    company_name: str
    market_space: str
    company_context: str | None
    status: AnalysisStatus
    result_json: str | None = None
    created_at: str = ""
    completed_at: str | None = None


@dataclass
class AnalysisStep:
    id: str
    analysis_id: str
    step: str
    label: str
    status: AnalysisStatus
    started_at: str | None = None
    completed_at: str | None = None


# ── Operations ──

@dataclass
class Operation:
    id: str
    operation_type: str
    parent_id: str | None
    status: OperationStatus
    current_step: str | None = None
    steps_completed: int = 0
    steps_total: int = 1
    partial_data: dict[str, Any] | None = None
    error_message: str | None = None
    created_at: str = ""
    completed_at: str | None = None


# ── Evidence: Sources ──

@dataclass
class Source:
    id: str
    analysis_id: str
    url: str
    title: str
    publisher: str
    tier: SourceTier
    snippet: str | None = None
    published_date: str | None = None
    raw_content: str | None = None
    relevance_score: float = 0.0
    provider: str = "tavily"
    source_category: str = "web"
    created_at: str = ""


@dataclass
class SourceMetadata:
    id: str
    source_id: str
    provider: str
    metadata_json: str  # JSON string of provider-specific payload
    created_at: str = ""


# ── Evidence: Claims ──

@dataclass
class Claim:
    id: str
    analysis_id: str
    statement: str
    claim_type: ClaimType
    entities: list[str] = field(default_factory=list)
    source_ids: list[str] = field(default_factory=list)
    confidence_score: float = 50.0
    source_count: int = 1
    created_at: str = ""


@dataclass
class ContradictionGroup:
    id: str
    analysis_id: str
    claim_ids: list[str]
    description: str
    resolution: str | None = None
    created_at: str = ""


# ── Company ──

@dataclass
class Company:
    id: str
    name: str
    context: str | None = None
    created_at: str = ""
    updated_at: str | None = None


# ── Workspace ──

@dataclass
class Workspace:
    id: str
    analysis_id: str
    company_id: str | None
    company_name: str
    market_space: str
    status: str = "active"
    created_at: str = ""
    updated_at: str | None = None


@dataclass
class InsightNode:
    id: str
    workspace_id: str
    question_id: str | None
    source_step: str
    display_status: DisplayStatus
    title: str
    body: str
    claim_ids: list[str] = field(default_factory=list)
    source_ids: list[str] = field(default_factory=list)
    confidence_score: float = 50.0
    confidence_level: str = "medium"
    confidence_reasoning: str = ""
    tags: list[str] = field(default_factory=list)
    contradiction_note: str | None = None
    contradiction_group_id: str | None = None
    related_insight_ids: list[str] = field(default_factory=list)
    created_at: str = ""


@dataclass
class WorkspaceQuestion:
    id: str
    workspace_id: str
    parent_question_id: str | None
    question_text: str
    status: QuestionStatus
    answer_text: str | None = None
    answer_confidence_score: float | None = None
    answer_confidence_level: str | None = None
    answer_confidence_reasoning: str | None = None
    strategy_lens_applied: bool = False
    contradictions_found: int = 0
    depth: int = 0
    created_at: str = ""


@dataclass
class FollowUpQuestion:
    id: str
    parent_question_id: str
    question_text: str
    reason: str
    status: QuestionStatus = QuestionStatus.PENDING


# ── Report ──

@dataclass
class Report:
    id: str
    workspace_id: str
    analysis_id: str
    report_style: str = "executive_brief"
    executive_summary: str | None = None
    sections_json: str | None = None  # JSON array of sections
    reasons_to_believe: list[str] = field(default_factory=list)
    reasons_to_challenge: list[str] = field(default_factory=list)
    open_questions: list[str] = field(default_factory=list)
    insight_count: int = 0
    source_count: int = 0
    compiled_at: str | None = None
    created_at: str = ""


# ── Document ──

@dataclass
class Document:
    id: str
    company_id: str
    filename: str
    content_type: str
    raw_text: str | None = None
    summary: str | None = None
    chunk_count: int = 0
    created_at: str = ""


@dataclass
class DocumentSection:
    id: str
    document_id: str
    section_index: int
    title: str | None = None
    section_type: str = "body"
    text: str = ""
    summary: str | None = None
    char_count: int = 0
    is_boilerplate: bool = False
    created_at: str = ""


@dataclass
class DocumentChunk:
    id: str
    document_id: str
    chunk_index: int
    text: str
    embedding: list[float] | None = None
    section_id: str | None = None
    chunk_type: str = "text"
    created_at: str = ""


# ── Decision Questions ──

@dataclass
class DecisionQuestion:
    id: str
    analysis_id: str
    category: DecisionQuestionCategory
    question_text: str
    answer_type: AnswerType
    importance: str = "medium"  # high, medium, low
    decision_impact: str = ""  # how answering this affects the recommendation
    choices_json: str | None = None  # JSON array for multiple_choice type
    answer_value: str | None = None  # user's answer (stored as string)
    sort_order: int = 0
    created_at: str = ""
