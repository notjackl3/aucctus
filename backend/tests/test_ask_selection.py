"""Tests for ask-about-selection workflow (Phase 4).

Tests cover: claim matching, context assembly, bounded output,
graceful handling of missing data, and endpoint integration.
"""

import json
import pytest
from unittest.mock import AsyncMock, patch

import app.config as config
config._force_mock = True

from app.workflows.ask_selection import (
    ask_about_selection,
    _extract_category_context,
    AskSelectionResult,
    MAX_CLAIM_CONTEXT_CHARS,
    MAX_DOC_CONTEXT_CHARS,
    MAX_ANALYSIS_CONTEXT_CHARS,
)


def _make_mock_analysis(result_data=None):
    """Create a mock analysis object."""
    from unittest.mock import MagicMock
    a = MagicMock()
    a.id = "ana_1"
    a.company_name = "Acme Corp"
    a.market_space = "cloud security"
    a.company_context = "Large enterprise security vendor"
    a.result_json = json.dumps(result_data) if result_data else json.dumps({
        "incumbents": {
            "summary": "The market is dominated by Palo Alto and CrowdStrike",
            "players": [
                {"name": "Palo Alto Networks", "description": "Leader in network security", "marketShare": "25%"},
                {"name": "CrowdStrike", "description": "Endpoint security leader", "marketShare": "15%"},
            ]
        },
        "emerging_competitors": {
            "summary": "Several AI-native startups emerging",
            "competitors": [{"name": "Wiz", "differentiator": "Cloud-native approach"}]
        },
        "market_sizing": {"tam": "$45B", "sam": "$15B", "cagr": "12%"},
        "opportunity_assessment": {
            "recommendation": "Conditional Go",
            "score": 72,
            "headline": "Promising but competitive",
            "reasoning": "Strong market growth offset by intense competition",
        }
    })
    return a


def _make_mock_claims():
    """Create mock claims for testing."""
    from unittest.mock import MagicMock
    claims = []
    for i, (stmt, entities) in enumerate([
        ("Palo Alto Networks holds 25% market share in cloud security", ["Palo Alto Networks"]),
        ("CrowdStrike revenue grew 35% YoY in Q3 2025", ["CrowdStrike"]),
        ("Cloud security market valued at $45B globally", []),
        ("Wiz raised $300M at $10B valuation", ["Wiz"]),
    ]):
        c = MagicMock()
        c.statement = stmt
        c.entities = entities
        c.source_ids = [f"src_{i}"]
        c.confidence_score = 0.8
        claims.append(c)
    return claims


def _make_mock_sources():
    """Create mock sources."""
    from unittest.mock import MagicMock
    sources = []
    for i in range(4):
        s = MagicMock()
        s.id = f"src_{i}"
        s.title = f"Source {i}"
        s.tier = MagicMock()
        s.tier.value = "tier_1"
        s.snippet = f"Snippet for source {i}"
        sources.append(s)
    return sources


class TestExtractCategoryContext:
    """Tests for category-based context extraction."""

    def test_incumbents_category(self):
        result_data = {
            "incumbents": {
                "summary": "Market leaders include Palo Alto",
                "players": [{"name": "Palo Alto", "description": "Security leader"}]
            },
            "opportunity_assessment": {"recommendation": "Go", "score": 80, "reasoning": "Good fit"},
        }
        ctx = _extract_category_context(result_data, "incumbents", "Acme", "cloud security")
        assert "Palo Alto" in ctx
        assert "Go" in ctx

    def test_market_category(self):
        result_data = {
            "market_sizing": {"tam": "$45B", "sam": "$15B", "cagr": "12%"},
            "opportunity_assessment": {"recommendation": "Go", "score": 80, "reasoning": "Good"},
        }
        ctx = _extract_category_context(result_data, "market", "Acme", "cloud")
        assert "$45B" in ctx

    def test_bounded_output(self):
        result_data = {
            "incumbents": {"summary": "X" * 5000, "players": []},
            "opportunity_assessment": {"recommendation": "Go", "score": 80, "reasoning": "Y" * 5000},
        }
        ctx = _extract_category_context(result_data, "incumbents", "Acme", "cloud")
        assert len(ctx) <= MAX_ANALYSIS_CONTEXT_CHARS

    def test_empty_result_data(self):
        ctx = _extract_category_context({}, "incumbents", "Acme", "cloud")
        assert ctx == ""


class TestAskAboutSelection:
    """Tests for the full ask-about-selection workflow."""

    @pytest.mark.asyncio
    async def test_basic_ask(self):
        """Basic ask with claim matching and LLM response."""
        mock_analysis = _make_mock_analysis()
        mock_claims = _make_mock_claims()
        mock_sources = _make_mock_sources()
        mock_workspace = None  # No workspace = no doc context

        with patch("app.workflows.ask_selection.repo.get_analysis",
                   new_callable=AsyncMock, return_value=mock_analysis), \
             patch("app.workflows.ask_selection.repo.get_claims_for_analysis",
                   new_callable=AsyncMock, return_value=mock_claims), \
             patch("app.workflows.ask_selection.repo.get_sources_for_analysis",
                   new_callable=AsyncMock, return_value=mock_sources), \
             patch("app.workflows.ask_selection.repo.get_workspace_by_analysis",
                   new_callable=AsyncMock, return_value=mock_workspace), \
             patch("app.workflows.ask_selection.llm.chat",
                   new_callable=AsyncMock, return_value="Based on the evidence, Palo Alto has 25% share."):

            result = await ask_about_selection(
                analysis_id="ana_1",
                selected_text="Palo Alto Networks dominates with 25% market share",
                question="How reliable is this number?",
                block_category="incumbents",
            )

        assert isinstance(result, AskSelectionResult)
        assert "25%" in result.answer
        assert len(result.source_ids) > 0  # matched claims found sources

    @pytest.mark.asyncio
    async def test_claim_matching_by_entity(self):
        """Claims should be matched by entity names in the selected text."""
        mock_analysis = _make_mock_analysis()
        mock_claims = _make_mock_claims()
        mock_sources = _make_mock_sources()

        with patch("app.workflows.ask_selection.repo.get_analysis",
                   new_callable=AsyncMock, return_value=mock_analysis), \
             patch("app.workflows.ask_selection.repo.get_claims_for_analysis",
                   new_callable=AsyncMock, return_value=mock_claims), \
             patch("app.workflows.ask_selection.repo.get_sources_for_analysis",
                   new_callable=AsyncMock, return_value=mock_sources), \
             patch("app.workflows.ask_selection.repo.get_workspace_by_analysis",
                   new_callable=AsyncMock, return_value=None), \
             patch("app.workflows.ask_selection.llm.chat",
                   new_callable=AsyncMock, return_value="Answer about Wiz."):

            result = await ask_about_selection(
                analysis_id="ana_1",
                selected_text="Wiz is a rapidly growing competitor",
                question="What's their funding status?",
                block_category="emerging",
            )

        # Should have matched the Wiz claim
        assert "src_3" in result.source_ids

    @pytest.mark.asyncio
    async def test_no_matching_claims(self):
        """When no claims match, confidence should be low."""
        mock_analysis = _make_mock_analysis()
        mock_claims = _make_mock_claims()
        mock_sources = _make_mock_sources()

        with patch("app.workflows.ask_selection.repo.get_analysis",
                   new_callable=AsyncMock, return_value=mock_analysis), \
             patch("app.workflows.ask_selection.repo.get_claims_for_analysis",
                   new_callable=AsyncMock, return_value=mock_claims), \
             patch("app.workflows.ask_selection.repo.get_sources_for_analysis",
                   new_callable=AsyncMock, return_value=mock_sources), \
             patch("app.workflows.ask_selection.repo.get_workspace_by_analysis",
                   new_callable=AsyncMock, return_value=None), \
             patch("app.workflows.ask_selection.llm.chat",
                   new_callable=AsyncMock, return_value="I don't have strong evidence for this."):

            result = await ask_about_selection(
                analysis_id="ana_1",
                selected_text="Some completely unrelated topic about farming",
                question="Is this accurate?",
                block_category="incumbents",
            )

        assert result.confidence == "low"
        assert result.source_ids == []

    @pytest.mark.asyncio
    async def test_with_company_doc_context(self):
        """When workspace has company_id, hierarchical retrieval is used."""
        from app.retrieval.retriever import AssembledContext
        from unittest.mock import MagicMock

        mock_analysis = _make_mock_analysis()
        mock_workspace = MagicMock()
        mock_workspace.company_id = "comp_1"

        assembled = AssembledContext(
            text="From company docs: Cloud strategy focuses on SASE.",
            chunks=[], total_chars=50, source_documents=["doc_1"],
        )

        with patch("app.workflows.ask_selection.repo.get_analysis",
                   new_callable=AsyncMock, return_value=mock_analysis), \
             patch("app.workflows.ask_selection.repo.get_claims_for_analysis",
                   new_callable=AsyncMock, return_value=[]), \
             patch("app.workflows.ask_selection.repo.get_sources_for_analysis",
                   new_callable=AsyncMock, return_value=[]), \
             patch("app.workflows.ask_selection.repo.get_workspace_by_analysis",
                   new_callable=AsyncMock, return_value=mock_workspace), \
             patch("app.workflows.ask_selection.retriever.hierarchical_retrieve",
                   new_callable=AsyncMock, return_value=assembled), \
             patch("app.workflows.ask_selection.llm.chat",
                   new_callable=AsyncMock, return_value="Based on company docs, SASE is the focus."):

            result = await ask_about_selection(
                analysis_id="ana_1",
                selected_text="Network security investment",
                question="How does this align with our strategy?",
                block_category="incumbents",
            )

        assert "SASE" in result.answer

    @pytest.mark.asyncio
    async def test_analysis_not_found(self):
        """Should raise ValueError when analysis doesn't exist."""
        with patch("app.workflows.ask_selection.repo.get_analysis",
                   new_callable=AsyncMock, return_value=None):
            with pytest.raises(ValueError, match="not found"):
                await ask_about_selection("bad_id", "text", "question", "cat")

    @pytest.mark.asyncio
    async def test_confidence_levels(self):
        """Confidence should scale with number of matched claims."""
        mock_analysis = _make_mock_analysis()
        mock_sources = _make_mock_sources()

        # Create 4 claims all mentioning "Palo Alto Networks"
        from unittest.mock import MagicMock
        many_claims = []
        for i in range(4):
            c = MagicMock()
            c.statement = f"Palo Alto Networks claim {i} about market share"
            c.entities = ["Palo Alto Networks"]
            c.source_ids = [f"src_{i}"]
            many_claims.append(c)

        with patch("app.workflows.ask_selection.repo.get_analysis",
                   new_callable=AsyncMock, return_value=mock_analysis), \
             patch("app.workflows.ask_selection.repo.get_claims_for_analysis",
                   new_callable=AsyncMock, return_value=many_claims), \
             patch("app.workflows.ask_selection.repo.get_sources_for_analysis",
                   new_callable=AsyncMock, return_value=mock_sources), \
             patch("app.workflows.ask_selection.repo.get_workspace_by_analysis",
                   new_callable=AsyncMock, return_value=None), \
             patch("app.workflows.ask_selection.llm.chat",
                   new_callable=AsyncMock, return_value="Well-supported finding."):

            result = await ask_about_selection(
                analysis_id="ana_1",
                selected_text="Palo Alto Networks leads the market",
                question="How reliable?",
                block_category="incumbents",
            )

        assert result.confidence == "high"  # >= 3 matched claims


class TestEndpointIntegration:
    """Integration tests for the /ask endpoint."""

    @pytest.mark.asyncio
    async def test_endpoint_returns_response(self, client):
        """POST /analyses/{id}/ask should return a response."""
        from app.persistence import repositories as repo

        # Create an analysis with result data
        analysis = await repo.create_analysis("Test Corp", "cloud security")
        result_data = {
            "incumbents": {"summary": "Market leaders", "players": []},
            "opportunity_assessment": {"recommendation": "Go", "score": 75, "reasoning": "Good"},
        }
        from app.persistence.database import get_db
        db = await get_db()
        await db.execute(
            "UPDATE analyses SET result_json = ?, status = 'completed' WHERE id = ?",
            (json.dumps(result_data), analysis.id))
        await db.commit()

        resp = await client.post(f"/api/analyses/{analysis.id}/ask", json={
            "selectedText": "Market leaders in cloud security",
            "question": "Who are they?",
            "blockCategory": "incumbents",
            "blockLabel": "Incumbents",
        })

        assert resp.status_code == 200
        data = resp.json()
        assert "answer" in data
        assert "sourceIds" in data
        assert "confidence" in data

    @pytest.mark.asyncio
    async def test_endpoint_404_for_missing_analysis(self, client):
        resp = await client.post("/api/analyses/nonexistent/ask", json={
            "selectedText": "text",
            "question": "question",
            "blockCategory": "incumbents",
            "blockLabel": "label",
        })
        assert resp.status_code == 404

    @pytest.mark.asyncio
    async def test_endpoint_400_for_no_results(self, client):
        """Analysis without results should return 400."""
        from app.persistence import repositories as repo
        analysis = await repo.create_analysis("Test Corp", "cloud security")

        resp = await client.post(f"/api/analyses/{analysis.id}/ask", json={
            "selectedText": "text",
            "question": "question",
            "blockCategory": "incumbents",
            "blockLabel": "label",
        })
        assert resp.status_code == 400
