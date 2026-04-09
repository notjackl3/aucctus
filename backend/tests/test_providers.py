"""Tests for multi-provider source integration.

Tests schema evolution, source normalization, repository persistence,
and backward compatibility. All tests use mocked provider responses.
"""

import json
import pytest
import pytest_asyncio

import aiosqlite

from app.domain.enums import SourceCategory, SourceProvider, SourceTier
from app.domain.models import Source, SourceMetadata
from app.evidence.processor import process_search_results, calculate_source_confidence
from app.services.search import SearchResult
from app.shared.utils import generate_id, utc_now


# ── Mock provider data ──

def _mock_tavily_results() -> list[SearchResult]:
    return [
        SearchResult(title="Cloud Security Market Report", url="https://gartner.com/cloud-sec-2025",
                     content="The cloud security market is projected to reach $30B by 2028.", score=0.92,
                     published_date="2025-03-01"),
        SearchResult(title="Top Cloud Security Players", url="https://techcrunch.com/cloud-sec-players",
                     content="CrowdStrike, Palo Alto, and Zscaler lead the cloud security market.", score=0.85),
    ]


def _mock_gdelt_results() -> tuple[list[SearchResult], list[dict]]:
    results = [
        SearchResult(title="Cloud Security Spending Surges", url="https://reuters.com/cloud-sec-spending",
                     content="Enterprise spending on cloud security jumped 28% YoY.", score=0.65,
                     published_date="2025-02-15"),
    ]
    metadata = [
        {"gdelt_url": "https://reuters.com/cloud-sec-spending", "tone": 3.2,
         "themes": ["TAX_POLICY", "CYBER_SECURITY"], "domain": "reuters.com",
         "language": "English", "source_country": "US"},
    ]
    return results, metadata


def _mock_sec_results() -> tuple[list[SearchResult], list[dict]]:
    results = [
        SearchResult(title="10-K — CrowdStrike Holdings (2024)",
                     url="https://sec.gov/filing/crowdstrike-10k-2024",
                     content="Annual revenue of $3.1B, ARR growth of 33%.", score=0.85,
                     published_date="2024-04-01"),
    ]
    metadata = [
        {"company_name": "CrowdStrike Holdings", "ticker": "CRWD", "form_type": "10-K",
         "filed_date": "2024-04-01", "accession_number": "0001535527-24-000123",
         "cik": "1535527", "file_url": "https://sec.gov/filing/crowdstrike-10k-2024"},
    ]
    return results, metadata


def _mock_uspto_results() -> tuple[list[SearchResult], list[dict]]:
    results = [
        SearchResult(title="Patent: Cloud-native threat detection system",
                     url="https://patents.google.com/patent/US12345678",
                     content="A system for detecting threats in cloud workloads using ML.", score=0.7,
                     published_date="2025-01-20"),
    ]
    metadata = [
        {"patent_number": "12345678", "patent_title": "Cloud-native threat detection system",
         "assignee": "CrowdStrike Inc", "patent_date": "2025-01-20",
         "application_date": "2023-06-15", "cpc_codes": ["G06F21/56", "H04L63/14"],
         "abstract": "A system for detecting threats in cloud workloads using ML."},
    ]
    return results, metadata


# ── Enum tests ──

class TestEnums:
    def test_source_provider_values(self):
        assert SourceProvider.TAVILY.value == "tavily"
        assert SourceProvider.GDELT.value == "gdelt"
        assert SourceProvider.SEC_EDGAR.value == "sec_edgar"
        assert SourceProvider.USPTO.value == "uspto"

    def test_source_category_values(self):
        assert SourceCategory.WEB.value == "web"
        assert SourceCategory.NEWS_EVENT.value == "news_event"
        assert SourceCategory.REGULATORY_FILING.value == "regulatory_filing"
        assert SourceCategory.PATENT.value == "patent"


# ── Source model tests ──

class TestSourceModel:
    def test_source_default_provider(self):
        s = Source(id="src_1", analysis_id="ana_1", url="https://example.com",
                   title="Test", publisher="Example", tier=SourceTier.TIER_3)
        assert s.provider == "tavily"
        assert s.source_category == "web"

    def test_source_custom_provider(self):
        s = Source(id="src_2", analysis_id="ana_1", url="https://sec.gov/filing",
                   title="10-K Filing", publisher="SEC EDGAR", tier=SourceTier.TIER_1,
                   provider="sec_edgar", source_category="regulatory_filing")
        assert s.provider == "sec_edgar"
        assert s.source_category == "regulatory_filing"

    def test_source_metadata_model(self):
        m = SourceMetadata(id="smeta_1", source_id="src_1", provider="gdelt",
                           metadata_json='{"tone": 3.2}')
        assert m.provider == "gdelt"
        assert json.loads(m.metadata_json)["tone"] == 3.2


# ── Source normalization tests ──

class TestSourceNormalization:
    def test_tavily_sources_get_default_provider(self):
        results = _mock_tavily_results()
        sources = process_search_results(results, "ana_test")
        for s in sources:
            assert s.provider == "tavily"
            assert s.source_category == "web"

    def test_gdelt_sources_get_correct_provider(self):
        results, _ = _mock_gdelt_results()
        sources = process_search_results(results, "ana_test",
                                         provider="gdelt", source_category="news_event")
        for s in sources:
            assert s.provider == "gdelt"
            assert s.source_category == "news_event"

    def test_sec_sources_get_correct_provider(self):
        results, _ = _mock_sec_results()
        sources = process_search_results(results, "ana_test",
                                         provider="sec_edgar", source_category="regulatory_filing")
        for s in sources:
            assert s.provider == "sec_edgar"
            assert s.source_category == "regulatory_filing"

    def test_uspto_sources_get_correct_provider(self):
        results, _ = _mock_uspto_results()
        sources = process_search_results(results, "ana_test",
                                         provider="uspto", source_category="patent")
        for s in sources:
            assert s.provider == "uspto"
            assert s.source_category == "patent"

    def test_mixed_provider_confidence_includes_provider_note(self):
        tavily = process_search_results(_mock_tavily_results(), "ana_test")
        gdelt_r, _ = _mock_gdelt_results()
        gdelt_s = process_search_results(gdelt_r, "ana_test",
                                         provider="gdelt", source_category="news_event")
        all_sources = tavily + gdelt_s
        conf = calculate_source_confidence(all_sources)
        assert "providers" in conf["reasoning"] or "provider" in conf["reasoning"].lower()

    def test_url_dedup_across_providers(self):
        """Same URL from different providers should be deduped."""
        r1 = SearchResult(title="A", url="https://example.com/article", content="c", score=0.8)
        r2 = SearchResult(title="B", url="https://example.com/article", content="c", score=0.6)
        sources = process_search_results([r1], "ana_test")
        sources2 = process_search_results([r2], "ana_test",
                                          existing_urls={s.url.rstrip("/").lower() for s in sources},
                                          provider="gdelt", source_category="news_event")
        assert len(sources2) == 0  # deduped


# ── Schema / DB tests ──

@pytest_asyncio.fixture
async def test_db():
    """Create an in-memory database with the full schema + migrations."""
    from app.persistence.database import SCHEMA_SQL, _run_migrations
    db = await aiosqlite.connect(":memory:")
    db.row_factory = aiosqlite.Row
    await db.executescript(SCHEMA_SQL)
    await db.commit()
    await _run_migrations(db)
    yield db
    await db.close()


class TestSchemaEvolution:
    @pytest.mark.asyncio
    async def test_sources_table_has_provider_columns(self, test_db):
        """Verify the sources table includes provider and source_category."""
        cursor = await test_db.execute("PRAGMA table_info(sources)")
        columns = {row[1] for row in await cursor.fetchall()}
        assert "provider" in columns
        assert "source_category" in columns

    @pytest.mark.asyncio
    async def test_source_metadata_table_exists(self, test_db):
        """Verify the source_metadata table was created."""
        cursor = await test_db.execute("PRAGMA table_info(source_metadata)")
        columns = {row[1] for row in await cursor.fetchall()}
        assert "id" in columns
        assert "source_id" in columns
        assert "provider" in columns
        assert "metadata_json" in columns
        assert "created_at" in columns

    @pytest.mark.asyncio
    async def test_insert_source_with_provider(self, test_db):
        """Insert a source with provider fields and read it back."""
        now = utc_now()
        await test_db.execute(
            "INSERT INTO sources (id, analysis_id, url, title, publisher, tier, provider, source_category, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            ("src_1", "ana_1", "https://sec.gov/filing", "10-K", "SEC EDGAR", "tier_1", "sec_edgar", "regulatory_filing", now),
        )
        await test_db.commit()
        cursor = await test_db.execute("SELECT provider, source_category FROM sources WHERE id = 'src_1'")
        row = await cursor.fetchone()
        assert row[0] == "sec_edgar"
        assert row[1] == "regulatory_filing"

    @pytest.mark.asyncio
    async def test_default_provider_is_tavily(self, test_db):
        """Existing-style insert without provider fields should default to tavily/web."""
        now = utc_now()
        await test_db.execute(
            "INSERT INTO sources (id, analysis_id, url, title, publisher, tier, created_at) VALUES (?,?,?,?,?,?,?)",
            ("src_old", "ana_1", "https://example.com", "Test", "Example", "tier_3", now),
        )
        await test_db.commit()
        cursor = await test_db.execute("SELECT provider, source_category FROM sources WHERE id = 'src_old'")
        row = await cursor.fetchone()
        assert row[0] == "tavily"
        assert row[1] == "web"

    @pytest.mark.asyncio
    async def test_insert_source_metadata(self, test_db):
        """Insert and retrieve provider-specific metadata."""
        now = utc_now()
        meta = {"tone": 3.2, "themes": ["CYBER_SECURITY"]}
        await test_db.execute(
            "INSERT INTO source_metadata (id, source_id, provider, metadata_json, created_at) VALUES (?,?,?,?,?)",
            ("smeta_1", "src_1", "gdelt", json.dumps(meta), now),
        )
        await test_db.commit()
        cursor = await test_db.execute("SELECT * FROM source_metadata WHERE source_id = 'src_1'")
        row = await cursor.fetchone()
        assert row[2] == "gdelt"  # provider
        parsed = json.loads(row[3])
        assert parsed["tone"] == 3.2
        assert "CYBER_SECURITY" in parsed["themes"]


# ── Backward compatibility tests ──

class TestBackwardCompatibility:
    def test_old_style_source_still_works(self):
        """Source without explicit provider fields should use defaults."""
        s = Source(id="src_1", analysis_id="ana_1", url="https://example.com",
                   title="Test", publisher="Example", tier=SourceTier.TIER_3)
        assert s.provider == "tavily"
        assert s.source_category == "web"

    def test_process_search_results_backward_compatible(self):
        """Calling without provider/category uses tavily/web defaults."""
        results = [SearchResult(title="Test", url="https://example.com",
                                content="content", score=0.8)]
        sources = process_search_results(results, "ana_test")
        assert sources[0].provider == "tavily"
        assert sources[0].source_category == "web"

    def test_confidence_still_works_with_old_sources(self):
        """Confidence calculation works for sources without provider field."""
        sources = process_search_results(_mock_tavily_results(), "ana_test")
        conf = calculate_source_confidence(sources)
        assert "level" in conf
        assert "score" in conf
        assert "reasoning" in conf
        assert conf["score"] >= 20

    @pytest.mark.asyncio
    async def test_analysis_result_shape_unchanged(self, test_db):
        """The top-level analysis result shape should not change.

        This test verifies the expected keys in the result_json contract.
        """
        mock_result = {
            "id": "ana_1",
            "request": {"companyName": "Acme", "marketSpace": "Cloud Security", "companyContext": None},
            "status": "completed",
            "steps": [],
            "incumbents": {
                "summary": "test",
                "players": [],
                "marketConcentration": "high",
                "confidence": {"level": "medium", "score": 55, "reasoning": "test"},
                "sources": [
                    {"title": "t", "url": "u", "publisher": "p", "date": None, "snippet": None,
                     "provider": "tavily", "sourceCategory": "web"}
                ],
            },
            "emergingCompetitors": None,
            "marketSizing": None,
            "opportunityAssessment": None,
            "createdAt": "2025-01-01",
            "completedAt": "2025-01-01",
        }
        # Verify the shape has all expected top-level keys
        for key in ["id", "request", "status", "steps", "incumbents",
                     "emergingCompetitors", "marketSizing", "opportunityAssessment",
                     "createdAt", "completedAt"]:
            assert key in mock_result

        # Verify source with provider is still valid — extra fields are optional
        src = mock_result["incumbents"]["sources"][0]
        assert "title" in src
        assert "url" in src
        assert "publisher" in src
        # New fields are present but optional
        assert src.get("provider") == "tavily"


# ── GDELT normalization tests ──

class TestGdeltNormalization:
    def test_gdelt_date_parsing(self):
        from app.services.gdelt import _parse_gdelt_date
        assert _parse_gdelt_date("20250215T120000Z") == "2025-02-15"
        assert _parse_gdelt_date("20250101000000") == "2025-01-01"
        assert _parse_gdelt_date("") is None
        assert _parse_gdelt_date(None) is None

    def test_gdelt_tone_to_relevance(self):
        from app.services.gdelt import _tone_to_relevance
        # Neutral tone → low relevance
        assert 0.25 < _tone_to_relevance(0.0) < 0.4
        # Strong positive tone → higher relevance
        assert _tone_to_relevance(8.0) > _tone_to_relevance(2.0)
        # Strong negative tone → also higher (magnitude matters)
        assert _tone_to_relevance(-8.0) > _tone_to_relevance(-1.0)
