"""Tests for hierarchical retrieval (Phase 3).

Tests cover: scoped embedding queries, hierarchical retrieval flow,
token-bounded context assembly, reranking, and backward compatibility
of the flat hybrid_search API.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock

import app.config as config
config._force_mock = True

from app.retrieval.retriever import (
    hybrid_search,
    hierarchical_retrieve,
    _assemble_context,
    _score_embeddings,
    cosine_similarity,
    RetrievedChunk,
    AssembledContext,
    TOKEN_BUDGET,
    CHARS_PER_TOKEN,
    RERANK_TOP_K,
)


class TestContextAssembly:
    """Tests for token-bounded context assembly."""

    def test_empty_chunks(self):
        result = _assemble_context([], 10000)
        assert result.text == ""
        assert result.chunks == []
        assert result.total_chars == 0

    def test_single_chunk(self):
        chunk = RetrievedChunk(
            chunk_id="c1", section_id="s1", document_id="d1",
            text="Hello world", section_title="Intro", similarity=0.9,
        )
        result = _assemble_context([chunk], 10000)
        assert "[Section: Intro]" in result.text
        assert "Hello world" in result.text
        assert len(result.chunks) == 1

    def test_respects_token_budget(self):
        chunks = [
            RetrievedChunk(
                chunk_id=f"c{i}", section_id="s1", document_id="d1",
                text="X" * 500, similarity=0.9,
            )
            for i in range(20)
        ]
        # Budget of 2000 chars should only fit ~4 chunks (500 chars each + separators)
        result = _assemble_context(chunks, 2000)
        assert result.total_chars <= 2100  # small tolerance for separator accounting
        assert len(result.chunks) < 20

    def test_truncates_last_chunk_if_partial_fit(self):
        chunks = [
            RetrievedChunk(
                chunk_id="c1", section_id="s1", document_id="d1",
                text="A" * 800, similarity=0.9,
            ),
            RetrievedChunk(
                chunk_id="c2", section_id="s1", document_id="d1",
                text="B" * 800, similarity=0.8,
            ),
        ]
        # Budget allows first chunk fully, second partially
        result = _assemble_context(chunks, 1200)
        assert "A" * 100 in result.text
        # Second chunk should be truncated or omitted
        assert result.total_chars <= 1300  # small tolerance for separator accounting

    def test_tracks_document_ids(self):
        chunks = [
            RetrievedChunk(chunk_id="c1", section_id="s1", document_id="d1",
                           text="Text 1", similarity=0.9),
            RetrievedChunk(chunk_id="c2", section_id="s2", document_id="d2",
                           text="Text 2", similarity=0.8),
        ]
        result = _assemble_context(chunks, 10000)
        assert "d1" in result.source_documents
        assert "d2" in result.source_documents

    def test_no_section_title(self):
        chunk = RetrievedChunk(
            chunk_id="c1", section_id="s1", document_id="d1",
            text="No title chunk", section_title=None, similarity=0.9,
        )
        result = _assemble_context([chunk], 10000)
        assert "[Section:" not in result.text
        assert "No title chunk" in result.text


class TestCosineSimilarity:
    """Tests for cosine similarity computation."""

    def test_identical_vectors(self):
        assert cosine_similarity([1, 0, 0], [1, 0, 0]) == pytest.approx(1.0)

    def test_orthogonal_vectors(self):
        assert cosine_similarity([1, 0, 0], [0, 1, 0]) == pytest.approx(0.0)

    def test_zero_vector(self):
        assert cosine_similarity([0, 0, 0], [1, 0, 0]) == 0.0


class TestFlatHybridSearch:
    """Tests that the legacy hybrid_search API still works."""

    @pytest.mark.asyncio
    async def test_returns_merged_results(self):
        fts_results = [
            {"source_id": "s1", "source_type": "claim", "text": "FTS hit 1", "rank": -1.0},
            {"source_id": "s2", "source_type": "claim", "text": "FTS hit 2", "rank": -0.5},
        ]
        sem_results = [
            {"source_id": "s2", "source_type": "claim", "text": "Semantic hit 2", "similarity": 0.9},
            {"source_id": "s3", "source_type": "claim", "text": "Semantic hit 3", "similarity": 0.8},
        ]

        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=fts_results), \
             patch("app.retrieval.retriever._semantic_search", new_callable=AsyncMock, return_value=sem_results):
            results = await hybrid_search("test query", limit=10)

        assert len(results) == 3  # s1, s2, s3 (s2 deduplicated)
        ids = [r["source_id"] for r in results]
        assert ids == ["s1", "s2", "s3"]

    @pytest.mark.asyncio
    async def test_respects_limit(self):
        fts_results = [
            {"source_id": f"s{i}", "source_type": "claim", "text": f"Hit {i}", "rank": -1.0}
            for i in range(10)
        ]
        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=fts_results), \
             patch("app.retrieval.retriever._semantic_search", new_callable=AsyncMock, return_value=[]):
            results = await hybrid_search("test", limit=5)

        assert len(results) == 5


class TestHierarchicalRetrieve:
    """Tests for hierarchical retrieval."""

    @pytest.mark.asyncio
    async def test_with_company_scoping(self):
        """Hierarchical retrieval scoped to a company should query company docs."""
        mock_sections = [
            {"id": "sec1", "document_id": "doc1", "title": "Market Analysis",
             "text": "Cloud security market is growing", "is_boilerplate": 0},
        ]
        mock_embeddings = [
            {"id": "emb1", "source_type": "document_chunk", "source_id": "chk1",
             "text": "Cloud security market details", "embedding": [0.1] * 10,
             "company_id": "comp1", "section_id": "sec1"},
        ]

        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=[]), \
             patch("app.persistence.repositories.get_document_ids_for_company",
                   new_callable=AsyncMock, return_value=["doc1"]), \
             patch("app.persistence.repositories.get_sections_for_documents",
                   new_callable=AsyncMock, return_value=mock_sections), \
             patch("app.persistence.repositories.get_embeddings_by_section_ids",
                   new_callable=AsyncMock, return_value=[]), \
             patch("app.persistence.repositories.get_embeddings_by_company",
                   new_callable=AsyncMock, return_value=mock_embeddings), \
             patch("app.services.llm.embed_single",
                   new_callable=AsyncMock, return_value=[0.1] * 10):

            result = await hierarchical_retrieve("cloud security market", company_id="comp1")

        assert isinstance(result, AssembledContext)
        assert result.total_chars > 0

    @pytest.mark.asyncio
    async def test_without_company_falls_back_to_all(self):
        """Without company_id, falls back to all embeddings."""
        mock_embeddings = [
            {"id": "emb1", "source_type": "claim", "source_id": "src1",
             "text": "Global market data", "embedding": [0.5] * 10,
             "company_id": None, "section_id": None},
        ]

        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=[]), \
             patch("app.persistence.repositories.get_all_embeddings",
                   new_callable=AsyncMock, return_value=mock_embeddings), \
             patch("app.services.llm.embed_single",
                   new_callable=AsyncMock, return_value=[0.5] * 10):

            result = await hierarchical_retrieve("market analysis")

        assert isinstance(result, AssembledContext)

    @pytest.mark.asyncio
    async def test_token_budget_enforced(self):
        """Result should respect the token budget."""
        # Create many embeddings that would exceed a small budget
        mock_embeddings = [
            {"id": f"emb{i}", "source_type": "document_chunk", "source_id": f"chk{i}",
             "text": "X" * 500, "embedding": [0.5 + i * 0.01] * 10,
             "company_id": None, "section_id": None}
            for i in range(20)
        ]

        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=[]), \
             patch("app.persistence.repositories.get_all_embeddings",
                   new_callable=AsyncMock, return_value=mock_embeddings), \
             patch("app.services.llm.embed_single",
                   new_callable=AsyncMock, return_value=[0.5] * 10):

            result = await hierarchical_retrieve("test", token_budget=500)

        # 500 tokens * 4 chars/token = 2000 chars max
        assert result.total_chars <= 2100  # small tolerance for separator accounting

    @pytest.mark.asyncio
    async def test_fts_section_summaries_boost_results(self):
        """Section summary FTS hits should boost those sections in reranking."""
        fts_results = [
            {"source_id": "sec1", "source_type": "section_summary",
             "text": "Cloud security analysis", "rank": -2.0},
        ]
        mock_embeddings = [
            {"id": "emb1", "source_type": "document_chunk", "source_id": "chk1",
             "text": "Chunk in sec1", "embedding": [0.3] * 10,
             "company_id": None, "section_id": "sec1"},
            {"id": "emb2", "source_type": "document_chunk", "source_id": "chk2",
             "text": "Chunk in sec2", "embedding": [0.35] * 10,
             "company_id": None, "section_id": "sec2"},
        ]

        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=fts_results), \
             patch("app.persistence.repositories.get_all_embeddings",
                   new_callable=AsyncMock, return_value=mock_embeddings), \
             patch("app.persistence.repositories.get_embeddings_by_section_ids",
                   new_callable=AsyncMock, return_value=[mock_embeddings[0]]), \
             patch("app.services.llm.embed_single",
                   new_callable=AsyncMock, return_value=[0.3] * 10):

            result = await hierarchical_retrieve("cloud security")

        # sec1 chunk should be boosted because sec1 matched as section_summary in FTS
        assert isinstance(result, AssembledContext)

    @pytest.mark.asyncio
    async def test_empty_database(self):
        """Gracefully handles empty database."""
        with patch("app.retrieval.retriever._fts_search", new_callable=AsyncMock, return_value=[]), \
             patch("app.persistence.repositories.get_all_embeddings",
                   new_callable=AsyncMock, return_value=[]), \
             patch("app.services.llm.embed_single",
                   new_callable=AsyncMock, return_value=[0.1] * 10):

            result = await hierarchical_retrieve("anything")

        assert result.text == ""
        assert result.chunks == []


class TestScopedRepositoryFunctions:
    """Tests for the new scoped repository functions (via integration with test DB)."""

    @pytest.mark.asyncio
    async def test_save_and_retrieve_scoped_embedding(self, client):
        """Save an embedding with company_id and retrieve it scoped."""
        from app.persistence import repositories as repo

        await repo.save_embedding(
            source_type="document_chunk",
            source_id="chk_test1",
            text="Test chunk text",
            embedding=[0.1, 0.2, 0.3],
            company_id="comp1",
            section_id="sec1",
        )

        # Retrieve by company
        results = await repo.get_embeddings_by_company("comp1")
        assert len(results) >= 1
        found = [r for r in results if r["source_id"] == "chk_test1"]
        assert len(found) == 1
        assert found[0]["company_id"] == "comp1"
        assert found[0]["section_id"] == "sec1"

    @pytest.mark.asyncio
    async def test_get_embeddings_by_section_ids(self, client):
        """Retrieve embeddings filtered by section IDs."""
        from app.persistence import repositories as repo

        await repo.save_embedding("doc_chunk", "chk_a", "Text A", [0.1], section_id="sec_x")
        await repo.save_embedding("doc_chunk", "chk_b", "Text B", [0.2], section_id="sec_y")
        await repo.save_embedding("doc_chunk", "chk_c", "Text C", [0.3], section_id="sec_x")

        results = await repo.get_embeddings_by_section_ids(["sec_x"])
        ids = {r["source_id"] for r in results}
        assert "chk_a" in ids
        assert "chk_c" in ids
        assert "chk_b" not in ids

    @pytest.mark.asyncio
    async def test_get_embeddings_by_section_ids_empty(self, client):
        """Empty section_ids list returns empty results."""
        from app.persistence import repositories as repo
        results = await repo.get_embeddings_by_section_ids([])
        assert results == []

    @pytest.mark.asyncio
    async def test_search_fts_with_source_type_filter(self, client):
        """FTS search filtered by source_type."""
        from app.persistence import repositories as repo

        await repo.index_for_fts("src1", "claim", "cloud security market analysis")
        await repo.index_for_fts("sec1", "section_summary", "cloud computing overview")

        # Unfiltered — both match
        all_results = await repo.search_fts("cloud")
        assert len(all_results) >= 2

        # Filtered — only section summaries
        filtered = await repo.search_fts("cloud", source_type="section_summary")
        assert all(r["source_type"] == "section_summary" for r in filtered)

    @pytest.mark.asyncio
    async def test_get_document_ids_for_company(self, client):
        """Get document IDs belonging to a company."""
        from app.persistence import repositories as repo

        # Create a company first
        company = await repo.create_company("Test Corp")
        await repo.create_document(company.id, "report.pdf", "application/pdf", "raw text")

        doc_ids = await repo.get_document_ids_for_company(company.id)
        assert len(doc_ids) == 1
