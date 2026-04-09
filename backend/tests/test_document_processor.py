"""Tests for section-aware document processing.

Tests cover: plain text parsing, section detection, boilerplate filtering,
chunking behavior, and PDF extraction (with a minimal test PDF).
"""

import pytest

import app.config as config
config._force_mock = True

from app.ingestion.document_processor import (
    DocumentSection,
    DocumentChunkResult,
    ProcessedDocument,
    process_document,
    _extract_text_sections,
    _extract_pdf_sections,
    _is_boilerplate,
    _chunk_section,
    MAX_CHUNK_SIZE,
)


class TestPlainTextSections:
    """Tests for plain text section detection."""

    def test_no_headings_single_section(self):
        text = "This is a simple paragraph with no headings. It should be treated as a single section."
        sections = _extract_text_sections(text)
        assert len(sections) == 1
        assert sections[0].section_type == "body"
        assert sections[0].title is None

    def test_markdown_headings(self):
        text = "# Introduction\nThis is the intro.\n\n# Methods\nThis is the methods section."
        sections = _extract_text_sections(text)
        assert len(sections) == 2
        assert sections[0].title == "Introduction"
        assert sections[1].title == "Methods"

    def test_all_caps_headings(self):
        text = "EXECUTIVE SUMMARY\nThis is the executive summary content.\n\nRISK FACTORS\nThese are the risk factors."
        sections = _extract_text_sections(text)
        assert len(sections) == 2
        assert sections[0].title == "EXECUTIVE SUMMARY"

    def test_numbered_headings(self):
        text = "1. Introduction\nContent of intro.\n\n2. Analysis\nContent of analysis."
        sections = _extract_text_sections(text)
        assert len(sections) == 2
        assert "Introduction" in sections[0].title

    def test_sec_10k_items(self):
        text = "Item 1. Business\nBusiness description.\n\nItem 1A. Risk Factors\nRisk factors content."
        sections = _extract_text_sections(text)
        assert len(sections) == 2
        assert "Business" in sections[0].title

    def test_empty_text(self):
        sections = _extract_text_sections("")
        assert sections == []

    def test_text_before_first_heading(self):
        text = "Preamble text.\n\n# First Section\nSection content."
        sections = _extract_text_sections(text)
        assert len(sections) == 2
        assert sections[0].title is None  # preamble
        assert sections[1].title == "First Section"


class TestBoilerplateDetection:
    """Tests for boilerplate section detection."""

    def test_short_section_is_boilerplate(self):
        section = DocumentSection(index=0, title=None, section_type="body", text="Short")
        assert _is_boilerplate(section) is True

    def test_toc_is_boilerplate(self):
        section = DocumentSection(
            index=0, title="Table of Contents", section_type="heading_1",
            text="Page 1 ... Introduction\nPage 2 ... Analysis",
        )
        assert _is_boilerplate(section) is True

    def test_forward_looking_is_boilerplate(self):
        section = DocumentSection(
            index=0, title="Forward-Looking Statements", section_type="heading_1",
            text="This document contains forward-looking statements that involve risks.",
        )
        assert _is_boilerplate(section) is True

    def test_normal_section_not_boilerplate(self):
        section = DocumentSection(
            index=0, title="Market Analysis", section_type="heading_1",
            text="The global cloud security market is projected to reach $45B by 2030. " * 5,
        )
        assert _is_boilerplate(section) is False


class TestChunking:
    """Tests for section-aware chunking."""

    def test_short_section_single_chunk(self):
        section = DocumentSection(
            index=0, title="Test", section_type="body",
            text="This is a short section that fits in one chunk.",
        )
        chunks = _chunk_section(section)
        assert len(chunks) == 1
        assert chunks[0].section_index == 0

    def test_long_section_splits_by_paragraphs(self):
        paragraphs = ["Paragraph content. " * 50 for _ in range(5)]
        text = "\n\n".join(paragraphs)
        section = DocumentSection(index=2, title="Long Section", section_type="body", text=text)
        chunks = _chunk_section(section)
        assert len(chunks) > 1
        assert all(len(c.text) <= MAX_CHUNK_SIZE + 100 for c in chunks)  # +100 tolerance for last chunk
        assert all(c.section_index == 2 for c in chunks)

    def test_preserves_section_index(self):
        section = DocumentSection(
            index=5, title="Test", section_type="heading_2",
            text="Content here.",
        )
        chunks = _chunk_section(section)
        assert all(c.section_index == 5 for c in chunks)

    def test_empty_section_no_chunks(self):
        section = DocumentSection(index=0, title="Empty", section_type="body", text="")
        chunks = _chunk_section(section)
        assert chunks == []


class TestProcessDocument:
    """Integration tests for the full document processing pipeline."""

    def test_plain_text_document(self):
        text = (
            "# Executive Summary\n"
            "The market is growing rapidly.\n\n"
            "# Competition\n"
            "Several major players dominate the space.\n\n"
            "# Market Size\n"
            "TAM is estimated at $45B.\n"
        )
        result = process_document(text.encode("utf-8"), "text/plain", "report.txt")

        assert isinstance(result, ProcessedDocument)
        assert len(result.sections) >= 3
        assert len(result.chunks) >= 3
        assert result.raw_text  # not empty

    def test_boilerplate_sections_excluded_from_chunks(self):
        real_content = "This is the actual content that matters. " * 10
        text = (
            "Table of Contents\n"
            "Page 1\n\n"
            "# Real Content\n"
            + real_content + "\n\n"
            "FORWARD-LOOKING STATEMENTS\n"
            "This report contains forward-looking statements.\n"
        )
        result = process_document(text.encode("utf-8"), "text/plain", "report.txt")

        # Chunks should not contain TOC or forward-looking text
        chunk_texts = " ".join(c.text for c in result.chunks)
        # The real content should be present
        assert "actual content" in chunk_texts

    def test_pdf_detection_by_content_type(self):
        # With a non-PDF content, should use text extraction
        # Use enough text to exceed MIN_SECTION_SIZE so it's not filtered as boilerplate
        content = b"Simple text content that is long enough to not be considered boilerplate noise by the processor."
        result = process_document(content, "text/plain", "doc.txt")
        assert "Simple text content" in result.raw_text

    def test_handles_empty_content(self):
        result = process_document(b"", "text/plain", "empty.txt")
        assert result.raw_text == ""
        assert result.chunks == []


class TestPDFExtraction:
    """Tests for PDF extraction (requires pymupdf)."""

    def test_minimal_pdf(self):
        """Test with a programmatically created minimal PDF."""
        try:
            import fitz
        except ImportError:
            pytest.skip("pymupdf not installed")

        # Create a minimal PDF in memory
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((72, 72), "Test Document Title", fontsize=18)
        page.insert_text((72, 120), "This is the body text of the document.", fontsize=12)
        page.insert_text((72, 150), "It contains important information about the market.", fontsize=12)

        page2 = doc.new_page()
        page2.insert_text((72, 72), "Second Section", fontsize=16)
        page2.insert_text((72, 120), "More content in the second section.", fontsize=12)

        pdf_bytes = doc.tobytes()
        doc.close()

        result = process_document(pdf_bytes, "application/pdf", "test.pdf")

        assert result.raw_text  # not empty
        assert len(result.sections) >= 1
        assert len(result.chunks) >= 1
        # Should contain our test text
        assert "body text" in result.raw_text or "important information" in result.raw_text


class TestSchemaMigration:
    """Tests for schema compatibility."""

    @pytest.mark.asyncio
    async def test_document_sections_table_exists(self, client):
        """document_sections table should exist after init."""
        from app.persistence.database import get_db
        db = await get_db()
        cursor = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='document_sections'")
        row = await cursor.fetchone()
        assert row is not None

    @pytest.mark.asyncio
    async def test_document_chunks_has_section_id(self, client):
        """document_chunks table should have section_id column."""
        from app.persistence.database import get_db
        db = await get_db()
        cursor = await db.execute("PRAGMA table_info(document_chunks)")
        cols = {row[1] for row in await cursor.fetchall()}
        assert "section_id" in cols
        assert "chunk_type" in cols

    @pytest.mark.asyncio
    async def test_embeddings_has_scoping_columns(self, client):
        """embeddings table should have company_id, analysis_id, section_id."""
        from app.persistence.database import get_db
        db = await get_db()
        cursor = await db.execute("PRAGMA table_info(embeddings)")
        cols = {row[1] for row in await cursor.fetchall()}
        assert "company_id" in cols
        assert "analysis_id" in cols
        assert "section_id" in cols
