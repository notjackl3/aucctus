"""BaseAgent context and shared helpers for research agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, TYPE_CHECKING

from app.domain.models import Claim, Source

if TYPE_CHECKING:
    from app.retrieval.query_planner import QueryPlan


@dataclass
class AgentContext:
    """Shared context passed to all research agents."""
    analysis_id: str
    company_name: str
    market_space: str
    company_context: str | None = None
    strategy_lens: dict[str, Any] | None = None
    evaluation_posture: str = "established_company"  # established_company | adjacency_expansion | new_market_entry | new_venture
    query_plan: QueryPlan | None = None


@dataclass
class AgentResult:
    """Standard result from a research agent."""
    step: str  # 'incumbents', 'emerging_competitors', 'market_sizing', 'synthesis'
    data: dict[str, Any]  # The structured result matching frontend types
    sources: list[Source] = field(default_factory=list)
    claims: list[Claim] = field(default_factory=list)
    insights: list[dict[str, Any]] = field(default_factory=list)  # Pre-formatted insight dicts
    error: str | None = None
