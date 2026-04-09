"""Tests for the centralized retrieval service.

All provider calls are mocked — no live API calls.
Tests cover: provider execution, source partitioning, enrichment,
graceful failure handling, refinement, and claim extraction integration.
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio

import app.config as config
config._force_mock = True

from app.domain.enums import SourceTier
from app.domain.models import Claim, Source
from app.retrieval.query_planner import ProviderQueries, QueryPlan
from app.retrieval.retrieval_service import (
    DimensionEvidence,
    RetrievalResult,
    retrieve_evidence,
    _fetch_tavily_for_dimension,
    _enrich_sec_edgar,
    _enrich_gdelt,
    _enrich_uspto,
    _run_refinement,
)
from app.services.search import SearchResult


# ── Fixtures ──

def _make_search_result(title: str, url: str, content: str = "Test content", score: float = 0.8) -> SearchResult:
    return SearchResult(title=title, url=url, content=content, score=score, published_date="2025-01-01")


def _make_query_plan(market: str = "cloud security") -> QueryPlan:
    return QueryPlan(
        raw_query=market,
        canonical_market_term=market,
        parent_category="cybersecurity",
        use_gdelt=False,
        use_sec_edgar=False,
        use_uspto=False,
        incumbents_queries=ProviderQueries(
            tavily=[f"{market} market leaders", f"{market} enterprise players", f"{market} analysis"],
        ),
        emerging_queries=ProviderQueries(
            tavily=[f"{market} startup funding", f"{market} emerging companies", f"{market} VC investment"],
        ),
        market_sizing_queries=ProviderQueries(
            tavily=[f"{market} market size TAM", f"{market} industry report", f"{market} growth forecast"],
        ),
    )


def _make_source(analysis_id: str = "test-analysis", url: str = "https://example.com/1", title: str = "Test") -> Source:
    return Source(
        id="src-1", analysis_id=analysis_id, url=url, title=title,
        publisher="Example", tier=SourceTier.TIER_2, snippet="test snippet",
        raw_content="test content", relevance_score=0.8, provider="tavily",
        source_category="web", created_at="2025-01-01T00:00:00Z",
    )


# ── Tests ──

class TestFetchTavilyForDimension:
    """Tests for individual dimension Tavily fetching."""

    @pytest.mark.asyncio
    async def test_fetches_all_queries(self):
        """Should execute all provided queries."""
        mock_results = [_make_search_result("Result 1", "https://a.com")]

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = mock_results
            sources = await _fetch_tavily_for_dimension(
                ["query1", "query2", "query3"], "analysis-1", [], "cloud security"
            )

        assert mock_search.call_count == 3
        assert len(sources) > 0

    @pytest.mark.asyncio
    async def test_uses_fallback_when_no_queries(self):
        """Should use fallback templates when no planned queries."""
        fallback = ["{market_space} test fallback"]

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = [_make_search_result("R", "https://a.com")]
            sources = await _fetch_tavily_for_dimension(
                [], "analysis-1", fallback, "cloud security"
            )

        mock_search.assert_called_once()
        call_args = mock_search.call_args[0][0]
        assert "cloud security" in call_args

    @pytest.mark.asyncio
    async def test_graceful_search_failure(self):
        """Should handle search failures gracefully."""
        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_search:
            mock_search.side_effect = Exception("API error")
            sources = await _fetch_tavily_for_dimension(
                ["query1"], "analysis-1", [], "cloud security"
            )

        assert sources == []

    @pytest.mark.asyncio
    async def test_deduplicates_across_queries(self):
        """Results from multiple queries should be deduplicated."""
        same_result = _make_search_result("Same", "https://same.com/page")

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = [same_result]
            sources = await _fetch_tavily_for_dimension(
                ["query1", "query2"], "analysis-1", [], "test"
            )

        # process_search_results deduplicates by URL
        assert len(sources) == 1


class TestEnrichment:
    """Tests for secondary provider enrichment."""

    @pytest.mark.asyncio
    async def test_sec_edgar_enrichment_graceful_failure(self):
        """SEC EDGAR failure should return empty list, not crash."""
        pq = ProviderQueries(sec_edgar=["test query"])
        with patch("app.services.sec_edgar.search_filings", new_callable=AsyncMock) as mock:
            mock.side_effect = Exception("SEC EDGAR down")
            result = await _enrich_sec_edgar(pq, "analysis-1", [])

        assert result == []

    @pytest.mark.asyncio
    async def test_gdelt_enrichment_graceful_failure(self):
        """GDELT failure should return empty list, not crash."""
        pq = ProviderQueries(gdelt=["test query"])
        with patch("app.services.gdelt.search_news", new_callable=AsyncMock) as mock:
            mock.side_effect = Exception("GDELT down")
            result = await _enrich_gdelt(pq, "analysis-1", [])

        assert result == []

    @pytest.mark.asyncio
    async def test_uspto_enrichment_graceful_failure(self):
        """USPTO failure should return empty list, not crash."""
        pq = ProviderQueries(uspto=["test query"])
        with patch("app.services.uspto.search_patents", new_callable=AsyncMock) as mock:
            mock.side_effect = Exception("USPTO 410 Gone")
            result = await _enrich_uspto(pq, "analysis-1", [])

        assert result == []

    @pytest.mark.asyncio
    async def test_no_enrichment_without_queries(self):
        """Should return empty if no queries provided."""
        pq = ProviderQueries()  # no queries
        result = await _enrich_sec_edgar(pq, "analysis-1", [])
        assert result == []


class TestRetrieveEvidence:
    """Integration tests for the full retrieve_evidence pipeline."""

    @pytest.mark.asyncio
    async def test_full_pipeline_returns_partitioned_results(self):
        """Should return sources partitioned by dimension."""
        plan = _make_query_plan()

        inc_results = [_make_search_result("Inc", f"https://inc.com/{i}") for i in range(3)]
        emg_results = [_make_search_result("Emg", f"https://emg.com/{i}") for i in range(3)]
        mkt_results = [_make_search_result("Mkt", f"https://mkt.com/{i}") for i in range(3)]

        call_count = 0

        async def mock_search(query, max_results=5):
            nonlocal call_count
            idx = call_count // 3  # 0=inc, 1=emg, 2=mkt (3 queries each)
            call_count += 1
            if idx == 0:
                return [inc_results[call_count % 3]]
            elif idx == 1:
                return [emg_results[call_count % 3]]
            else:
                return [mkt_results[call_count % 3]]

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_s, \
             patch("app.retrieval.retrieval_service.extract_claims_from_sources", new_callable=AsyncMock) as mock_claims:
            mock_s.side_effect = mock_search
            mock_claims.return_value = []

            result = await retrieve_evidence(plan, "analysis-1")

        assert isinstance(result, RetrievalResult)
        assert isinstance(result.incumbents, DimensionEvidence)
        assert isinstance(result.emerging, DimensionEvidence)
        assert isinstance(result.market_sizing, DimensionEvidence)
        assert result.coverage is not None

    @pytest.mark.asyncio
    async def test_pipeline_with_all_searches_failing(self):
        """Should return empty evidence when all searches fail, not crash."""
        plan = _make_query_plan()

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_s, \
             patch("app.retrieval.retrieval_service.extract_claims_from_sources", new_callable=AsyncMock) as mock_claims:
            mock_s.side_effect = Exception("All searches fail")
            mock_claims.return_value = []

            result = await retrieve_evidence(plan, "analysis-1")

        assert len(result.all_sources) == 0
        assert len(result.all_claims) == 0

    @pytest.mark.asyncio
    async def test_enrichment_disabled_when_plan_says_no(self):
        """Secondary providers should not be called when plan disables them."""
        plan = _make_query_plan()
        plan.use_gdelt = False
        plan.use_sec_edgar = False
        plan.use_uspto = False

        # Generate enough results so coverage is sufficient (no refinement)
        results = [_make_search_result(f"Test {i}", f"https://test{i}.com") for i in range(8)]

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_s, \
             patch("app.retrieval.retrieval_service.extract_claims_from_sources", new_callable=AsyncMock) as mock_claims:
            mock_s.return_value = results
            mock_claims.return_value = []

            result = await retrieve_evidence(plan, "analysis-1")

        # Only Tavily should be called (9 queries = 3 agents × 3 queries)
        # No refinement because coverage is sufficient with 8 results per query
        assert mock_s.call_count == 9


class TestRefinement:
    """Tests for bounded coverage refinement."""

    @pytest.mark.asyncio
    async def test_refinement_adds_sources_to_weak_dimensions(self):
        """Refinement should add new sources to weak dimensions."""
        plan = _make_query_plan()

        from app.retrieval.coverage import CoverageReport, DimensionCoverage
        coverage = CoverageReport(
            dimensions=[
                DimensionCoverage(dimension="incumbents", score=0.3, sufficient=False),
            ],
            overall_score=0.3,
            overall_sufficient=False,
            weak_dimensions=["incumbents"],
        )

        inc_sources = [_make_source(url="https://existing.com")]
        emg_sources = []
        mkt_sources = []

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_s:
            mock_s.return_value = [_make_search_result("New", "https://new.com")]
            inc_out, emg_out, mkt_out = await _run_refinement(
                plan, "analysis-1", coverage, inc_sources, emg_sources, mkt_sources
            )

        # Incumbents should have gained sources
        assert len(inc_out) > 1

    @pytest.mark.asyncio
    async def test_refinement_graceful_failure(self):
        """Refinement search failure should not crash."""
        plan = _make_query_plan()
        from app.retrieval.coverage import CoverageReport
        coverage = CoverageReport(
            weak_dimensions=["market_sizing"],
        )

        with patch("app.retrieval.retrieval_service.search_svc.search", new_callable=AsyncMock) as mock_s:
            mock_s.side_effect = Exception("Search failed")
            inc, emg, mkt = await _run_refinement(plan, "a-1", coverage, [], [], [])

        # Should return original (empty) lists without crashing
        assert inc == []
        assert emg == []
        assert mkt == []


class TestDimensionEvidence:
    """Tests for DimensionEvidence data structure."""

    def test_default_confidence(self):
        de = DimensionEvidence()
        assert de.confidence["level"] == "low"
        assert de.sources == []
        assert de.claims == []
