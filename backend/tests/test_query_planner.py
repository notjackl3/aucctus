"""Tests for query planning, provider adapters, coverage evaluation, and refinement.

All tests use mocked provider responses. No live API calls.
"""

from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.agents.base import AgentContext
from app.domain.enums import SourceTier
from app.domain.models import Source
from app.retrieval.query_planner import (
    QueryPlan, ProviderQueries, QueryInterpretation,
    build_query_plan, generate_refinement_queries,
    _build_incumbents_queries, _build_emerging_queries,
    _build_market_sizing_queries, _extract_entities_from_results,
)
from app.retrieval.coverage import (
    evaluate_coverage, CoverageReport, DimensionCoverage, _score_dimension,
)
from app.shared.utils import utc_now


# ── Helpers ──

def _make_source(
    provider: str = "tavily",
    tier: SourceTier = SourceTier.TIER_2,
    relevance: float = 0.7,
    url: str = "https://example.com/article",
) -> Source:
    return Source(
        id="src_test",
        analysis_id="ana_test",
        url=url,
        title="Test Source",
        publisher="Test",
        tier=tier,
        relevance_score=relevance,
        provider=provider,
        source_category="web",
        created_at=utc_now(),
    )


def _make_plan(
    market: str = "cloud security",
    entities: list[str] | None = None,
    synonyms: list[str] | None = None,
    narrower: list[str] | None = None,
    adjacent: list[str] | None = None,
    patent_relevant: bool = False,
    news_heavy: bool = True,
) -> QueryPlan:
    return QueryPlan(
        raw_query=market,
        canonical_market_term=market,
        parent_category="cybersecurity",
        narrower_terms=narrower or ["CNAPP", "CSPM", "CWPP"],
        adjacent_terms=adjacent or ["endpoint security", "SIEM"],
        synonyms=synonyms or ["cloud-native security"],
        entity_candidates=entities or ["CrowdStrike", "Palo Alto Networks", "Zscaler"],
        use_gdelt=news_heavy,
        use_sec_edgar=True,
        use_uspto=patent_relevant,
        market_signals="public-company-heavy, news-heavy",
        interpretation_confidence="high",
    )


# ── QueryPlan output shape tests ──

class TestQueryPlanShape:
    def test_query_plan_has_all_required_fields(self):
        plan = _make_plan()
        assert plan.raw_query == "cloud security"
        assert plan.canonical_market_term == "cloud security"
        assert plan.parent_category == "cybersecurity"
        assert isinstance(plan.narrower_terms, list)
        assert isinstance(plan.adjacent_terms, list)
        assert isinstance(plan.synonyms, list)
        assert isinstance(plan.entity_candidates, list)
        assert isinstance(plan.use_gdelt, bool)
        assert isinstance(plan.use_sec_edgar, bool)
        assert isinstance(plan.use_uspto, bool)
        assert isinstance(plan.market_signals, str)
        assert plan.interpretation_confidence in ("high", "medium", "low")

    def test_provider_queries_default_empty(self):
        pq = ProviderQueries()
        assert pq.tavily == []
        assert pq.gdelt == []
        assert pq.sec_edgar == []
        assert pq.uspto == []

    def test_plan_defaults_are_sane(self):
        plan = QueryPlan(raw_query="test", canonical_market_term="test",
                         parent_category="test")
        assert plan.use_gdelt is True
        assert plan.use_sec_edgar is True
        assert plan.use_uspto is False
        assert plan.local_evidence_count == 0
        assert plan.local_evidence_sufficient is False


# ── Provider-specific query generation tests ──

class TestProviderQueryGeneration:
    def test_incumbents_queries_use_canonical_term(self):
        plan = _make_plan(market="cloud security")
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert len(pq.tavily) > 0
        assert any("cloud security" in q for q in pq.tavily)

    def test_incumbents_sec_edgar_uses_entity_names(self):
        plan = _make_plan(entities=["CrowdStrike", "Palo Alto Networks"])
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert len(pq.sec_edgar) > 0
        sec_q = pq.sec_edgar[0]
        assert "CrowdStrike" in sec_q or "Palo Alto" in sec_q

    def test_incumbents_no_sec_when_disabled(self):
        plan = _make_plan()
        plan.use_sec_edgar = False
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert pq.sec_edgar == []

    def test_emerging_queries_include_funding_terms(self):
        plan = _make_plan()
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert any("startup" in q or "funding" in q for q in pq.tavily)

    def test_emerging_gdelt_when_news_heavy(self):
        plan = _make_plan(news_heavy=True)
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert len(pq.gdelt) > 0

    def test_emerging_no_gdelt_when_not_news_heavy(self):
        plan = _make_plan(news_heavy=False)
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert pq.gdelt == []

    def test_emerging_uspto_when_patent_relevant(self):
        plan = _make_plan(patent_relevant=True)
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert len(pq.uspto) > 0

    def test_emerging_no_uspto_when_not_patent_relevant(self):
        plan = _make_plan(patent_relevant=False)
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert pq.uspto == []

    def test_market_sizing_queries_include_tam_terms(self):
        plan = _make_plan()
        pq = _build_market_sizing_queries(plan, "Acme Corp")
        assert any("TAM" in q or "market size" in q for q in pq.tavily)

    def test_synonyms_used_in_third_query(self):
        plan = _make_plan(synonyms=["CNAPP solutions"])
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert any("CNAPP solutions" in q for q in pq.tavily)

    def test_narrower_terms_used_when_no_synonyms(self):
        # When synonyms are empty, the planner uses narrower terms for the 3rd query
        plan = QueryPlan(
            raw_query="cloud security",
            canonical_market_term="cloud security",
            parent_category="cloud security",  # same as market to skip parent branch
            narrower_terms=["CSPM"],
            synonyms=[],
        )
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert any("CSPM" in q for q in pq.tavily)

    def test_tavily_queries_respect_budget(self):
        plan = _make_plan()
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert len(pq.tavily) <= 3
        pq2 = _build_emerging_queries(plan, "Acme Corp")
        assert len(pq2.tavily) <= 3
        pq3 = _build_market_sizing_queries(plan, "Acme Corp")
        assert len(pq3.tavily) <= 3


# ── Entity extraction from reconnaissance results ──

class TestEntityExtraction:
    def test_extract_entities_from_titles(self):
        results = [
            MagicMock(title="CrowdStrike leads cloud security market", content="test"),
            MagicMock(title="Palo Alto Networks revenue soars", content="test"),
        ]
        plan = _make_plan(entities=["CrowdStrike", "Palo Alto Networks"])
        entities = _extract_entities_from_results(results, plan)
        # Should confirm existing entity candidates
        assert "CrowdStrike" in entities or "Palo Alto Networks" in entities

    def test_extract_entities_handles_empty_results(self):
        plan = _make_plan()
        entities = _extract_entities_from_results([], plan)
        assert entities == []


# ── Refinement query generation tests ──

class TestRefinementQueries:
    def test_refinement_broadens_to_parent_category(self):
        plan = _make_plan(market="cloud security")
        refinements = generate_refinement_queries(plan, ["incumbents"])
        assert "incumbents" in refinements
        pq = refinements["incumbents"]
        assert any("cybersecurity" in q for q in pq.tavily)

    def test_refinement_for_emerging_uses_alt_terms(self):
        plan = _make_plan(synonyms=["CNAPP"])
        refinements = generate_refinement_queries(plan, ["emerging"])
        assert "emerging" in refinements

    def test_refinement_for_market_sizing(self):
        plan = _make_plan()
        refinements = generate_refinement_queries(plan, ["market_sizing"])
        assert "market_sizing" in refinements
        pq = refinements["market_sizing"]
        assert len(pq.tavily) > 0

    def test_refinement_for_signals(self):
        plan = _make_plan()
        refinements = generate_refinement_queries(plan, ["signals"])
        assert "signals" in refinements
        pq = refinements["signals"]
        assert len(pq.gdelt) > 0

    def test_refinement_only_for_weak_dimensions(self):
        plan = _make_plan()
        refinements = generate_refinement_queries(plan, ["incumbents"])
        assert "emerging" not in refinements
        assert "market_sizing" not in refinements


# ── Coverage evaluation tests ──

class TestCoverageEvaluation:
    def test_empty_sources_score_zero(self):
        report = evaluate_coverage({"incumbents": [], "emerging": [], "market_sizing": []})
        assert report.overall_score == 0.0
        assert not report.overall_sufficient
        assert len(report.weak_dimensions) == 3

    def test_sufficient_sources_pass(self):
        sources = [_make_source(tier=SourceTier.TIER_1, relevance=0.9) for _ in range(10)]
        report = evaluate_coverage({
            "incumbents": sources,
            "emerging": sources,
            "market_sizing": sources,
        })
        assert report.overall_score > 0.5
        assert report.overall_sufficient

    def test_mixed_coverage_identifies_weak_dims(self):
        strong = [_make_source(tier=SourceTier.TIER_1, relevance=0.9) for _ in range(10)]
        weak = [_make_source(tier=SourceTier.TIER_3, relevance=0.3)]
        report = evaluate_coverage({
            "incumbents": strong,
            "emerging": weak,
            "market_sizing": strong,
        })
        assert "emerging" in report.weak_dimensions
        assert "incumbents" not in report.weak_dimensions

    def test_score_dimension_factors(self):
        sources = [
            _make_source(tier=SourceTier.TIER_1, relevance=0.9, provider="tavily"),
            _make_source(tier=SourceTier.TIER_2, relevance=0.7, provider="gdelt",
                         url="https://example.com/2"),
        ]
        dim = _score_dimension("test", sources)
        assert dim.source_count == 2
        assert dim.tier1_count == 1
        assert dim.provider_count == 2
        assert dim.avg_relevance > 0.5
        assert dim.score > 0

    def test_should_refine_when_weak(self):
        report = evaluate_coverage(
            {"incumbents": [], "emerging": [], "market_sizing": []},
            refinement_round=0,
        )
        assert report.should_refine

    def test_no_refine_after_max_attempts(self):
        report = evaluate_coverage(
            {"incumbents": [], "emerging": [], "market_sizing": []},
            refinement_round=1,
        )
        assert not report.should_refine

    def test_no_refine_when_sufficient(self):
        sources = [_make_source(tier=SourceTier.TIER_1, relevance=0.9) for _ in range(10)]
        report = evaluate_coverage({
            "incumbents": sources,
            "emerging": sources,
            "market_sizing": sources,
        }, refinement_round=0)
        assert not report.should_refine

    def test_provider_diversity_improves_score(self):
        single_provider = [
            _make_source(provider="tavily", relevance=0.7) for _ in range(5)
        ]
        multi_provider = [
            _make_source(provider="tavily", relevance=0.7, url="https://a.com/1"),
            _make_source(provider="tavily", relevance=0.7, url="https://a.com/2"),
            _make_source(provider="gdelt", relevance=0.7, url="https://b.com/1"),
            _make_source(provider="sec_edgar", relevance=0.7, url="https://c.com/1"),
            _make_source(provider="sec_edgar", relevance=0.7, url="https://c.com/2"),
        ]
        dim_single = _score_dimension("test", single_provider)
        dim_multi = _score_dimension("test", multi_provider)
        assert dim_multi.provider_count > dim_single.provider_count
        assert dim_multi.score > dim_single.score


# ── build_query_plan integration tests (mocked LLM + search) ──

class TestBuildQueryPlan:
    @pytest.mark.asyncio
    async def test_plan_built_without_apis(self):
        """When APIs are not configured, plan falls back to raw query."""
        with patch("app.retrieval.query_planner.use_real_apis", return_value=False):
            plan = await build_query_plan("cloud security", "Acme Corp")
        assert plan.raw_query == "cloud security"
        assert plan.canonical_market_term == "cloud security"
        # Should still generate fallback queries
        assert len(plan.incumbents_queries.tavily) > 0

    @pytest.mark.asyncio
    async def test_plan_with_mocked_llm(self):
        """With mocked LLM, plan incorporates interpretation."""
        mock_interpretation = QueryInterpretation(
            canonical_market_term="cloud security",
            parent_category="cybersecurity",
            narrower_terms=["CNAPP", "CSPM"],
            adjacent_terms=["endpoint security"],
            synonyms=["cloud-native security"],
            likely_public_companies=["CrowdStrike", "Palo Alto Networks"],
            likely_startups=["Wiz", "Orca Security"],
            is_patent_relevant=False,
            is_news_heavy=True,
            is_niche=False,
            confidence="high",
            notes="Well-defined market",
        )
        with patch("app.retrieval.query_planner.use_real_apis", return_value=True), \
             patch("app.retrieval.query_planner.llm") as mock_llm, \
             patch("app.retrieval.query_planner._run_reconnaissance", return_value=[]), \
             patch("app.retrieval.query_planner._check_local_evidence", return_value=0):
            mock_llm.chat_structured = AsyncMock(return_value=mock_interpretation)
            plan = await build_query_plan("cloud security", "Acme Corp")

        assert plan.canonical_market_term == "cloud security"
        assert plan.parent_category == "cybersecurity"
        assert "CrowdStrike" in plan.entity_candidates
        assert plan.use_sec_edgar is True
        assert plan.use_uspto is False
        assert plan.interpretation_confidence == "high"
        # Provider queries should be populated
        assert len(plan.incumbents_queries.tavily) > 0
        assert len(plan.emerging_queries.tavily) > 0
        assert len(plan.market_sizing_queries.tavily) > 0

    @pytest.mark.asyncio
    async def test_plan_with_local_evidence(self):
        """Local evidence count is reflected in plan."""
        with patch("app.retrieval.query_planner.use_real_apis", return_value=False), \
             patch("app.retrieval.query_planner._check_local_evidence", return_value=12):
            plan = await build_query_plan("cloud security", "Acme Corp")
        assert plan.local_evidence_count == 12
        assert plan.local_evidence_sufficient is True

    @pytest.mark.asyncio
    async def test_plan_llm_failure_graceful(self):
        """If LLM fails, plan still produces valid queries from raw input."""
        with patch("app.retrieval.query_planner.use_real_apis", return_value=True), \
             patch("app.retrieval.query_planner.llm") as mock_llm, \
             patch("app.retrieval.query_planner._run_reconnaissance", return_value=[]), \
             patch("app.retrieval.query_planner._check_local_evidence", return_value=0):
            mock_llm.chat_structured = AsyncMock(side_effect=Exception("LLM down"))
            plan = await build_query_plan("cloud security", "Acme Corp")

        # Should still have usable queries from the raw input
        assert plan.canonical_market_term == "cloud security"
        assert len(plan.incumbents_queries.tavily) > 0


# ── Agent compatibility tests (agents use plan when available) ──

class TestAgentCompatibility:
    def test_agent_context_accepts_query_plan(self):
        plan = _make_plan()
        ctx = AgentContext(
            analysis_id="ana_1",
            company_name="Acme Corp",
            market_space="cloud security",
            query_plan=plan,
        )
        assert ctx.query_plan is not None
        assert ctx.query_plan.canonical_market_term == "cloud security"

    def test_agent_context_works_without_plan(self):
        ctx = AgentContext(
            analysis_id="ana_1",
            company_name="Acme Corp",
            market_space="cloud security",
        )
        assert ctx.query_plan is None

    def test_incumbents_fallback_queries(self):
        """Retrieval service should have fallback query templates for incumbents."""
        from app.retrieval.retrieval_service import _FALLBACK_INCUMBENTS
        queries = [q.format(market_space="cloud security") for q in _FALLBACK_INCUMBENTS]
        assert len(queries) == 3
        assert any("market leaders" in q for q in queries)

    def test_emerging_fallback_queries(self):
        from app.retrieval.retrieval_service import _FALLBACK_EMERGING
        queries = [q.format(market_space="cloud security") for q in _FALLBACK_EMERGING]
        assert len(queries) == 3
        assert any("startup" in q or "funding" in q for q in queries)

    def test_market_sizing_fallback_queries(self):
        from app.retrieval.retrieval_service import _FALLBACK_MARKET_SIZING
        queries = [q.format(market_space="cloud security") for q in _FALLBACK_MARKET_SIZING]
        assert len(queries) == 3
        assert any("TAM" in q or "market size" in q for q in queries)


# ── Budget enforcement tests ──

class TestBudgetEnforcement:
    def test_tavily_queries_capped_per_agent(self):
        from app.config import TAVILY_QUERIES_PER_AGENT
        plan = _make_plan()
        for builder in [_build_incumbents_queries, _build_emerging_queries, _build_market_sizing_queries]:
            pq = builder(plan, "Acme Corp")
            assert len(pq.tavily) <= TAVILY_QUERIES_PER_AGENT

    def test_gdelt_queries_capped(self):
        from app.config import GDELT_QUERIES_PER_AGENT
        plan = _make_plan(news_heavy=True)
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert len(pq.gdelt) <= GDELT_QUERIES_PER_AGENT

    def test_sec_edgar_queries_capped(self):
        from app.config import SEC_EDGAR_QUERIES_PER_AGENT
        plan = _make_plan()
        pq = _build_incumbents_queries(plan, "Acme Corp")
        assert len(pq.sec_edgar) <= SEC_EDGAR_QUERIES_PER_AGENT

    def test_uspto_queries_capped(self):
        from app.config import USPTO_QUERIES_PER_AGENT
        plan = _make_plan(patent_relevant=True)
        pq = _build_emerging_queries(plan, "Acme Corp")
        assert len(pq.uspto) <= USPTO_QUERIES_PER_AGENT

    def test_refinement_bounded_by_max_attempts(self):
        """Coverage report respects MAX_REFINEMENT_ATTEMPTS."""
        from app.config import MAX_REFINEMENT_ATTEMPTS
        report = CoverageReport(
            overall_score=0.2,
            overall_sufficient=False,
            weak_dimensions=["incumbents"],
            refinement_attempted=MAX_REFINEMENT_ATTEMPTS,
        )
        assert not report.should_refine
