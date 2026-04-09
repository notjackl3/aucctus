"""Coverage evaluation — assess evidence sufficiency and suggest bounded refinement.

After retrieval, evaluates whether the system has enough evidence across
research dimensions. If coverage is weak, suggests one bounded refinement step.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

from app.config import COVERAGE_SUFFICIENCY_THRESHOLD, MAX_REFINEMENT_ATTEMPTS
from app.domain.enums import SourceTier

logger = logging.getLogger(__name__)


@dataclass
class DimensionCoverage:
    """Coverage assessment for a single research dimension."""
    dimension: str  # incumbents, emerging, market_sizing, signals
    source_count: int = 0
    tier1_count: int = 0
    provider_count: int = 0
    avg_relevance: float = 0.0
    score: float = 0.0  # 0-1 composite coverage score
    sufficient: bool = False


@dataclass
class CoverageReport:
    """Full coverage evaluation across all research dimensions."""
    dimensions: list[DimensionCoverage] = field(default_factory=list)
    overall_score: float = 0.0
    overall_sufficient: bool = False
    weak_dimensions: list[str] = field(default_factory=list)
    refinement_attempted: int = 0

    @property
    def should_refine(self) -> bool:
        return (
            not self.overall_sufficient
            and self.refinement_attempted < MAX_REFINEMENT_ATTEMPTS
            and len(self.weak_dimensions) > 0
        )


def evaluate_coverage(
    agent_sources: dict[str, list],
    refinement_round: int = 0,
) -> CoverageReport:
    """Evaluate evidence coverage across research dimensions.

    Args:
        agent_sources: dict mapping agent step name → list of Source objects.
            Expected keys: "incumbents", "emerging", "market_sizing".
        refinement_round: how many refinement rounds have been attempted.

    Returns a CoverageReport with per-dimension scores and overall assessment.
    """
    dimensions = []

    for dim_name, sources in agent_sources.items():
        dim = _score_dimension(dim_name, sources)
        dimensions.append(dim)

    # Overall score: weighted average
    if dimensions:
        # Incumbents and market sizing are most important
        weights = {"incumbents": 0.35, "emerging": 0.25, "market_sizing": 0.30, "signals": 0.10}
        total_weight = sum(weights.get(d.dimension, 0.2) for d in dimensions)
        overall = sum(
            d.score * weights.get(d.dimension, 0.2) for d in dimensions
        ) / max(total_weight, 0.01)
    else:
        overall = 0.0

    weak = [d.dimension for d in dimensions if not d.sufficient]

    report = CoverageReport(
        dimensions=dimensions,
        overall_score=overall,
        overall_sufficient=overall >= COVERAGE_SUFFICIENCY_THRESHOLD,
        weak_dimensions=weak,
        refinement_attempted=refinement_round,
    )

    logger.info(
        f"Coverage: overall={report.overall_score:.2f}, "
        f"sufficient={report.overall_sufficient}, "
        f"weak={report.weak_dimensions}"
    )

    return report


def _score_dimension(dim_name: str, sources: list) -> DimensionCoverage:
    """Score a single research dimension based on its sources."""
    if not sources:
        return DimensionCoverage(dimension=dim_name, score=0.0, sufficient=False)

    count = len(sources)
    tier1 = sum(1 for s in sources if getattr(s, 'tier', None) == SourceTier.TIER_1)
    providers = len(set(getattr(s, 'provider', 'tavily') for s in sources))

    relevance_scores = [
        getattr(s, 'relevance_score', 0.0) for s in sources
        if getattr(s, 'relevance_score', 0.0) > 0
    ]
    avg_relevance = (
        sum(relevance_scores) / len(relevance_scores) if relevance_scores else 0.0
    )

    # Composite score factors:
    # - Source count (0-1): diminishing returns, 8+ sources = 1.0
    count_score = min(count / 8.0, 1.0)
    # - Tier 1 presence: having any tier-1 source is a big signal
    tier1_score = min(tier1 / 2.0, 1.0)
    # - Provider diversity: more providers = better triangulation
    provider_score = min(providers / 2.0, 1.0)
    # - Relevance quality
    relevance_score = avg_relevance

    # Weighted composite
    score = (
        count_score * 0.35
        + tier1_score * 0.25
        + provider_score * 0.15
        + relevance_score * 0.25
    )

    return DimensionCoverage(
        dimension=dim_name,
        source_count=count,
        tier1_count=tier1,
        provider_count=providers,
        avg_relevance=avg_relevance,
        score=score,
        sufficient=score >= COVERAGE_SUFFICIENCY_THRESHOLD,
    )
