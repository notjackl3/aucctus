"""Section-aware document processing — replaces the primitive regex-based PDF extraction.

Uses pymupdf (fitz) for real PDF text extraction with font-size-based section detection.
Produces DocumentSection and chunk records with section metadata.

Flow:
1. Extract text per page (pymupdf or plain text fallback)
2. Detect section headers using font size / formatting heuristics
3. Split into DocumentSection records
4. Filter boilerplate sections
5. Chunk each section (paragraph → sentence boundaries)
6. Generate section summaries (cached, gpt-4o-mini)
"""

import logging
import re
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

# ── Constants ──

MAX_CHUNK_SIZE = 1500  # chars
MIN_SECTION_SIZE = 50  # skip tiny sections
SUMMARY_THRESHOLD = 2000  # sections shorter than this use text as summary
MAX_SECTIONS = 100  # safety bound


# ── Data structures ──

@dataclass
class DocumentSection:
    """A detected section within a document."""
    index: int
    title: str | None
    section_type: str  # heading_1, heading_2, body, toc, unknown
    text: str
    char_count: int = 0
    is_boilerplate: bool = False

    def __post_init__(self):
        self.char_count = len(self.text)


@dataclass
class DocumentChunkResult:
    """A chunk within a section."""
    section_index: int
    chunk_index: int
    text: str
    chunk_type: str = "text"  # text, header, list


@dataclass
class ProcessedDocument:
    """Full result of processing a document."""
    raw_text: str
    sections: list[DocumentSection] = field(default_factory=list)
    chunks: list[DocumentChunkResult] = field(default_factory=list)


# ── Main entry point ──

def process_document(content: bytes, content_type: str, filename: str = "") -> ProcessedDocument:
    """Process a document into sections and chunks.

    Args:
        content: Raw file bytes
        content_type: MIME type
        filename: Original filename (for type detection fallback)

    Returns:
        ProcessedDocument with sections and section-aware chunks.
    """
    # Step 1: Extract text and detect sections
    if _is_pdf(content_type, filename):
        sections = _extract_pdf_sections(content)
    else:
        raw_text = content.decode("utf-8", errors="replace")
        sections = _extract_text_sections(raw_text)

    # Step 2: Filter boilerplate
    for section in sections:
        section.is_boilerplate = _is_boilerplate(section)

    # Step 3: Chunk each non-boilerplate section
    chunks = []
    chunk_idx = 0
    for section in sections:
        if section.is_boilerplate:
            continue
        section_chunks = _chunk_section(section, chunk_idx)
        chunks.extend(section_chunks)
        chunk_idx += len(section_chunks)

    # Assemble raw text from all sections
    raw_text = "\n\n".join(s.text for s in sections if not s.is_boilerplate)

    result = ProcessedDocument(
        raw_text=raw_text,
        sections=sections[:MAX_SECTIONS],
        chunks=chunks,
    )

    logger.info(
        f"Processed document '{filename}': {len(sections)} sections "
        f"({sum(1 for s in sections if s.is_boilerplate)} boilerplate), "
        f"{len(chunks)} chunks"
    )

    return result


# ── PDF extraction with pymupdf ──

def _extract_pdf_sections(content: bytes) -> list[DocumentSection]:
    """Extract sections from PDF using pymupdf with font-size-based heading detection."""
    try:
        import fitz
    except ImportError:
        logger.warning("pymupdf not installed, falling back to basic extraction")
        text = content.decode("latin-1", errors="replace")[:10000]
        return [DocumentSection(index=0, title=None, section_type="body", text=text)]

    try:
        doc = fitz.open(stream=content, filetype="pdf")
    except Exception as e:
        logger.error(f"Failed to open PDF: {e}")
        return [DocumentSection(index=0, title=None, section_type="body",
                                text=content.decode("latin-1", errors="replace")[:10000])]

    # Pass 1: Collect all text blocks with font size info
    blocks = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        block_dict = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)
        for block in block_dict.get("blocks", []):
            if block["type"] != 0:  # text blocks only
                continue
            for line in block.get("lines", []):
                text_parts = []
                max_font_size = 0
                for span in line.get("spans", []):
                    text_parts.append(span["text"])
                    max_font_size = max(max_font_size, span["size"])
                line_text = "".join(text_parts).strip()
                if line_text:
                    blocks.append({
                        "text": line_text,
                        "font_size": max_font_size,
                        "page": page_num,
                    })

    doc.close()

    if not blocks:
        return [DocumentSection(index=0, title=None, section_type="body", text="")]

    # Pass 2: Determine heading threshold from font size distribution
    font_sizes = [b["font_size"] for b in blocks]
    if font_sizes:
        median_size = sorted(font_sizes)[len(font_sizes) // 2]
        heading_threshold = median_size * 1.15  # 15% larger than median = heading
    else:
        heading_threshold = 14.0

    # Pass 3: Build sections from headings
    sections = []
    current_title = None
    current_type = "body"
    current_lines: list[str] = []
    section_idx = 0

    for block in blocks:
        is_heading = (
            block["font_size"] >= heading_threshold
            and len(block["text"]) < 200  # headings are short
            and not block["text"].endswith(".")  # headings don't end with period
        )
        is_all_caps = block["text"].isupper() and len(block["text"]) > 3

        if is_heading or is_all_caps:
            # Flush current section
            if current_lines:
                text = "\n".join(current_lines).strip()
                if text:
                    sections.append(DocumentSection(
                        index=section_idx,
                        title=current_title,
                        section_type=current_type,
                        text=text,
                    ))
                    section_idx += 1

            current_title = block["text"]
            current_type = "heading_1" if block["font_size"] >= heading_threshold * 1.1 else "heading_2"
            current_lines = []
        else:
            current_lines.append(block["text"])

    # Flush last section
    if current_lines:
        text = "\n".join(current_lines).strip()
        if text:
            sections.append(DocumentSection(
                index=section_idx,
                title=current_title,
                section_type=current_type,
                text=text,
            ))

    # If no sections detected (no headings), treat entire document as one section
    if not sections:
        full_text = "\n".join(b["text"] for b in blocks)
        sections = [DocumentSection(index=0, title=None, section_type="body", text=full_text)]

    return sections


# ── Plain text section extraction ──

def _extract_text_sections(raw_text: str) -> list[DocumentSection]:
    """Extract sections from plain text using heading heuristics."""
    if not raw_text.strip():
        return []

    # Split on apparent heading patterns
    heading_pattern = re.compile(
        r'^(?:'
        r'#{1,3}\s+.+'  # Markdown headings
        r'|[A-Z][A-Z \-]{4,}'  # ALL CAPS lines (5+ chars, may include hyphens)
        r'|Item\s+\d+[A-Za-z]?\..*'  # SEC 10-K items: "Item 1. Business", "Item 1A. Risk Factors"
        r'|\d+\.?\s+[A-Z].+'  # Numbered headings: "1. Introduction"
        r')$',
        re.MULTILINE,
    )

    matches = list(heading_pattern.finditer(raw_text))

    if not matches:
        # No headings detected — single section
        return [DocumentSection(index=0, title=None, section_type="body", text=raw_text.strip())]

    sections = []

    # Text before first heading
    if matches[0].start() > 0:
        pre_text = raw_text[:matches[0].start()].strip()
        if pre_text:
            sections.append(DocumentSection(
                index=0, title=None, section_type="body", text=pre_text,
            ))

    for i, match in enumerate(matches):
        title = match.group().strip().lstrip("#").strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw_text)
        text = raw_text[start:end].strip()

        section_type = "heading_1" if match.group().startswith("#") or match.group().isupper() else "heading_2"

        sections.append(DocumentSection(
            index=len(sections),
            title=title,
            section_type=section_type,
            text=text,
        ))

    return sections


# ── Boilerplate detection ──

_BOILERPLATE_PATTERNS = [
    re.compile(r'table\s+of\s+contents', re.I),
    re.compile(r'forward[- ]looking\s+statements?', re.I),
    re.compile(r'safe\s+harbor', re.I),
    re.compile(r'this\s+(document|report|filing)\s+(contains|includes)\s+forward', re.I),
    re.compile(r'^\s*page\s+\d+\s*$', re.I | re.MULTILINE),
]


def _is_boilerplate(section: DocumentSection) -> bool:
    """Check if a section is boilerplate (TOC, disclaimers, etc.)."""
    # Very short sections without titles are likely noise (page numbers, etc.)
    # But sections with meaningful titles are kept even if short
    if section.char_count < MIN_SECTION_SIZE and not section.title:
        return True

    text = section.text
    title = (section.title or "").lower()

    # Title-based checks
    if "table of contents" in title:
        return True
    if "forward-looking" in title or "forward looking" in title:
        return True
    if "safe harbor" in title:
        return True

    # Content-based checks
    for pattern in _BOILERPLATE_PATTERNS:
        if pattern.search(text[:500]):
            # Only mark as boilerplate if the section is dominated by boilerplate
            if section.char_count < 1000:
                return True

    return False


# ── Section-aware chunking ──

def _chunk_section(section: DocumentSection, start_chunk_idx: int = 0) -> list[DocumentChunkResult]:
    """Chunk a section: split by paragraphs first, then by sentence if too large."""
    text = section.text.strip()
    if not text:
        return []

    # Split by paragraphs (double newline)
    paragraphs = re.split(r'\n\s*\n', text)
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    chunks = []
    chunk_idx = start_chunk_idx
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 <= MAX_CHUNK_SIZE:
            current_chunk = (current_chunk + "\n\n" + para).strip() if current_chunk else para
        else:
            # Flush current chunk
            if current_chunk:
                chunks.append(DocumentChunkResult(
                    section_index=section.index,
                    chunk_index=chunk_idx,
                    text=current_chunk,
                ))
                chunk_idx += 1

            # If paragraph itself exceeds MAX_CHUNK_SIZE, split by sentences
            if len(para) > MAX_CHUNK_SIZE:
                sentence_chunks = _split_by_sentences(para, section.index, chunk_idx)
                chunks.extend(sentence_chunks)
                chunk_idx += len(sentence_chunks)
                current_chunk = ""
            else:
                current_chunk = para

    # Flush remaining
    if current_chunk:
        chunks.append(DocumentChunkResult(
            section_index=section.index,
            chunk_index=chunk_idx,
            text=current_chunk,
        ))

    return chunks


def _split_by_sentences(text: str, section_index: int, start_idx: int) -> list[DocumentChunkResult]:
    """Split a large paragraph into sentence-bounded chunks."""
    # Simple sentence boundary detection
    sentences = re.split(r'(?<=[.!?])\s+', text)

    chunks = []
    current = ""
    idx = start_idx

    for sentence in sentences:
        if len(current) + len(sentence) + 1 <= MAX_CHUNK_SIZE:
            current = (current + " " + sentence).strip() if current else sentence
        else:
            if current:
                chunks.append(DocumentChunkResult(
                    section_index=section_index, chunk_index=idx, text=current,
                ))
                idx += 1
            # If a single sentence exceeds limit, just truncate
            current = sentence[:MAX_CHUNK_SIZE]

    if current:
        chunks.append(DocumentChunkResult(
            section_index=section_index, chunk_index=idx, text=current,
        ))

    return chunks


# ── Helpers ──

def _is_pdf(content_type: str, filename: str) -> bool:
    return "pdf" in content_type.lower() or filename.lower().endswith(".pdf")


# ── Section summary generation ──

async def generate_section_summaries(
    sections: list[DocumentSection],
) -> dict[int, str]:
    """Generate summaries for sections that exceed the summary threshold.

    Returns dict mapping section index → summary text.
    Short sections use their own text as the summary.
    """
    from app.services import llm
    from app.config import use_real_apis

    summaries: dict[int, str] = {}

    for section in sections:
        if section.is_boilerplate:
            continue

        if section.char_count <= SUMMARY_THRESHOLD:
            summaries[section.index] = section.text[:500]
        elif use_real_apis():
            try:
                summary = await llm.chat(
                    f"Summarize this section in 2-3 sentences:\n\n"
                    f"Section: {section.title or 'Untitled'}\n"
                    f"{section.text[:3000]}",
                    model="gpt-4o-mini",
                )
                summaries[section.index] = summary
            except Exception as e:
                logger.warning(f"Section summary failed for '{section.title}': {e}")
                summaries[section.index] = section.text[:500]
        else:
            summaries[section.index] = section.text[:500]

    return summaries
