"""BaseAgent context and shared helpers for research agents."""

from dataclasses import dataclass, field
from typing import Any

from app.domain.models import Claim, Source


@dataclass
class AgentContext:
    """Shared context passed to all research agents."""
    analysis_id: str
    company_name: str
    market_space: str
    company_context: str | None = None
    strategy_lens: dict[str, Any] | None = None


@dataclass
class AgentResult:
    """Standard result from a research agent."""
    step: str  # 'incumbents', 'emerging_competitors', 'market_sizing', 'synthesis'
    data: dict[str, Any]  # The structured result matching frontend types
    sources: list[Source] = field(default_factory=list)
    claims: list[Claim] = field(default_factory=list)
    insights: list[dict[str, Any]] = field(default_factory=list)  # Pre-formatted insight dicts
    error: str | None = None
