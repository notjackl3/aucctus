"""Tests for evidence reuse across analyses (Phase 5).

Tests cover: prior analysis discovery, source classification heuristics,
evidence loading and deduplication, and query plan enrichment.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timezone, timedelta

import app.config as config
config._force_mock = True

from app.retrieval.retrieval_service import (
    _load_prior_evidence,
    _is_incumbents_source,
    _is_emerging_source,
    _is_market_source,
)
from app.retrieval.query_planner import QueryPlan


def _make_source(title: str, snippet: str = "", category: str = "web", url: str = ""):
    """Create a mock Source for testing classification."""
    s = MagicMock()
    s.title = title
    s.snippet = snippet
    s.source_category = category
    s.url = url or f"https://example.com/{title.replace(' ', '-')}"
    return s


class TestSourceClassification:
    """Tests for dimension classification heuristics."""

    def test_incumbents_by_market_leader(self):
        s = _make_source("Cloud security market leader analysis")
        assert _is_incumbents_source(s)

    def test_incumbents_by_market_share(self):
        s = _make_source("Company X holds 25% market share")
        assert _is_incumbents_source(s)

    def test_incumbents_by_category(self):
        s = _make_source("SEC Filing 10-K", category="regulatory_filing")
        assert _is_incumbents_source(s)

    def test_emerging_by_startup(self):
        s = _make_source("Wiz startup raises Series B funding")
        assert _is_emerging_source(s)

    def test_emerging_by_funding(self):
        s = _make_source("Cloud security funding round announced")
        assert _is_emerging_source(s)

    def test_market_by_size(self):
        s = _make_source("Cloud security market size forecast 2025-2030")
        assert _is_market_source(s)

    def test_market_by_cagr(self):
        s = _make_source("Industry growth at 15% CAGR")
        assert _is_market_source(s)

    def test_generic_source_unclassified(self):
        s = _make_source("Random article about cooking")
        assert not _is_incumbents_source(s)
        assert not _is_emerging_source(s)
        assert not _is_market_source(s)


class TestLoadPriorEvidence:
    """Tests for loading prior analysis evidence."""

    @pytest.mark.asyncio
    async def test_no_prior_analyses(self):
        """Empty prior_analysis_ids returns empty list."""
        plan = QueryPlan(raw_query="cloud security", canonical_market_term="cloud security",
                         parent_category="cybersecurity")
        result = await _load_prior_evidence(plan, "ana_current")
        assert result == []

    @pytest.mark.asyncio
    async def test_loads_and_deduplicates_sources(self):
        """Sources from prior analyses are loaded and deduplicated by URL."""
        plan = QueryPlan(raw_query="cloud security", canonical_market_term="cloud security",
                         parent_category="cybersecurity",
                         prior_analysis_ids=["ana_1", "ana_2"])

        sources = [
            _make_source("Source A", url="https://example.com/a"),
            _make_source("Source B", url="https://example.com/b"),
            _make_source("Source A dup", url="https://example.com/a"),  # duplicate URL
        ]

        with patch("app.retrieval.retrieval_service.repo.get_sources_for_analyses",
                   new_callable=AsyncMock, return_value=sources):
            result = await _load_prior_evidence(plan, "ana_current")

        assert len(result) == 2  # deduplicated
        urls = {s.url for s in result}
        assert "https://example.com/a" in urls
        assert "https://example.com/b" in urls

    @pytest.mark.asyncio
    async def test_graceful_failure(self):
        """Failure in prior evidence loading returns empty list."""
        plan = QueryPlan(raw_query="cloud security", canonical_market_term="cloud security",
                         parent_category="cybersecurity",
                         prior_analysis_ids=["ana_1"])

        with patch("app.retrieval.retrieval_service.repo.get_sources_for_analyses",
                   new_callable=AsyncMock, side_effect=Exception("DB error")):
            result = await _load_prior_evidence(plan, "ana_current")

        assert result == []


class TestPriorAnalysisDiscovery:
    """Integration tests for finding prior analyses."""

    @pytest.mark.asyncio
    async def test_find_prior_analyses_exact_match(self, client):
        """Should find completed analyses for the exact same market."""
        from app.persistence import repositories as repo
        from app.persistence.database import get_db

        # Create a completed analysis
        analysis = await repo.create_analysis("Test Corp", "cloud security")
        db = await get_db()
        await db.execute(
            "UPDATE analyses SET status = 'completed', result_json = '{}' WHERE id = ?",
            (analysis.id,))
        await db.commit()

        # Find prior analyses
        prior = await repo.find_prior_analyses("cloud security")
        assert len(prior) >= 1
        assert any(a.id == analysis.id for a in prior)

    @pytest.mark.asyncio
    async def test_excludes_current_analysis(self, client):
        """Should exclude the current analysis from results."""
        from app.persistence import repositories as repo
        from app.persistence.database import get_db

        analysis = await repo.create_analysis("Test Corp", "cloud security")
        db = await get_db()
        await db.execute(
            "UPDATE analyses SET status = 'completed', result_json = '{}' WHERE id = ?",
            (analysis.id,))
        await db.commit()

        prior = await repo.find_prior_analyses("cloud security", exclude_id=analysis.id)
        assert not any(a.id == analysis.id for a in prior)

    @pytest.mark.asyncio
    async def test_ignores_different_market(self, client):
        """Should not find analyses for different markets."""
        from app.persistence import repositories as repo
        from app.persistence.database import get_db

        analysis = await repo.create_analysis("Test Corp", "cloud security")
        db = await get_db()
        await db.execute(
            "UPDATE analyses SET status = 'completed', result_json = '{}' WHERE id = ?",
            (analysis.id,))
        await db.commit()

        prior = await repo.find_prior_analyses("autonomous vehicles")
        assert not any(a.id == analysis.id for a in prior)

    @pytest.mark.asyncio
    async def test_ignores_incomplete_analyses(self, client):
        """Should not find pending/running analyses."""
        from app.persistence import repositories as repo

        # Create a pending analysis (not completed)
        analysis = await repo.create_analysis("Test Corp", "cloud security")

        prior = await repo.find_prior_analyses("cloud security")
        assert not any(a.id == analysis.id for a in prior)

    @pytest.mark.asyncio
    async def test_multi_analysis_source_retrieval(self, client):
        """Should retrieve sources from multiple prior analyses."""
        from app.persistence import repositories as repo
        from app.persistence.database import get_db
        from app.domain.models import Source
        from app.domain.enums import SourceTier
        from app.shared.utils import utc_now

        # Create two completed analyses
        a1 = await repo.create_analysis("Corp A", "cloud security")
        a2 = await repo.create_analysis("Corp B", "cloud security")
        db = await get_db()
        for a in [a1, a2]:
            await db.execute(
                "UPDATE analyses SET status = 'completed', result_json = '{}' WHERE id = ?",
                (a.id,))
        await db.commit()

        # Add sources to each
        from app.shared.utils import generate_id
        for analysis in [a1, a2]:
            src = Source(
                id=generate_id("src"), analysis_id=analysis.id,
                url=f"https://example.com/{analysis.id}",
                title=f"Source for {analysis.id}", publisher="Test",
                tier=SourceTier.TIER_2, snippet="Test snippet",
                relevance_score=0.8, created_at=utc_now(),
            )
            await repo.create_source(src)

        # Retrieve sources for both
        sources = await repo.get_sources_for_analyses([a1.id, a2.id])
        assert len(sources) == 2
