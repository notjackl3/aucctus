"""Hybrid retrieval — FTS5 keyword search + semantic similarity via numpy.

Supports two modes:
1. **Flat hybrid search** (legacy) — search all embeddings, no scoping.
2. **Hierarchical retrieval** — doc → section → chunk with company scoping
   and token-bounded context assembly.

Local-first: embeddings cached in SQLite, cosine similarity computed with numpy.
"""

import logging
from dataclasses import dataclass, field

import numpy as np

from app.persistence import repositories as repo
from app.services import llm

logger = logging.getLogger(__name__)

# ── Constants ──

TOKEN_BUDGET = 6000  # approximate token budget for assembled context
CHARS_PER_TOKEN = 4  # rough approximation
MAX_CONTEXT_CHARS = TOKEN_BUDGET * CHARS_PER_TOKEN  # 24000 chars

# Hierarchical retrieval defaults
MAX_DOCUMENTS = 5
MAX_SECTIONS = 10
MAX_CHUNKS = 20
RERANK_TOP_K = 12
MIN_SIMILARITY_THRESHOLD = 0.15


# ── Result types ──

@dataclass
class RetrievedChunk:
    """A chunk retrieved with full context metadata."""
    chunk_id: str
    section_id: str | None
    document_id: str
    text: str
    section_title: str | None = None
    section_type: str | None = None
    similarity: float = 0.0
    fts_rank: float = 0.0
    final_score: float = 0.0


@dataclass
class AssembledContext:
    """Token-bounded context ready for LLM consumption."""
    text: str  # concatenated chunk text with section headers
    chunks: list[RetrievedChunk] = field(default_factory=list)
    total_chars: int = 0
    source_documents: list[str] = field(default_factory=list)  # document IDs used


# ── Main entry points ──

async def hybrid_search(query: str, workspace_id: str | None = None,
                        limit: int = 20) -> list[dict]:
    """Run flat hybrid retrieval: FTS5 keyword + semantic similarity.

    This is the legacy API — searches all embeddings without scoping.
    Use hierarchical_retrieve() for scoped, bounded retrieval.
    """
    fts_results = await _fts_search(query, limit)
    semantic_results = await _semantic_search(query, limit)

    seen_ids = set()
    merged = []
    for result in fts_results + semantic_results:
        source_id = result["source_id"]
        if source_id not in seen_ids:
            seen_ids.add(source_id)
            merged.append(result)
        if len(merged) >= limit:
            break

    return merged


async def hierarchical_retrieve(
    query: str,
    company_id: str | None = None,
    analysis_id: str | None = None,
    max_chunks: int = MAX_CHUNKS,
    token_budget: int = TOKEN_BUDGET,
) -> AssembledContext:
    """Hierarchical retrieval: document → section → chunk with bounded context.

    Flow:
    1. FTS on document/section summaries → shortlist documents
    2. FTS + semantic search on section text → shortlist sections
    3. Semantic search on chunk embeddings (scoped to sections) → ranked chunks
    4. Deterministic rerank
    5. Token-bounded context assembly
    """
    max_chars = token_budget * CHARS_PER_TOKEN

    # Step 1: Find relevant documents and sections via FTS
    fts_results = await _fts_search(query, limit=30)

    # Separate section summaries from other FTS hits
    section_summary_ids = set()
    other_source_ids = set()
    for r in fts_results:
        if r["source_type"] == "section_summary":
            section_summary_ids.add(r["source_id"])
        else:
            other_source_ids.add(r["source_id"])

    # Step 2: Get sections — from FTS hits + company document sections
    section_ids = set(section_summary_ids)
    doc_ids = []

    if company_id:
        doc_ids = await repo.get_document_ids_for_company(company_id)
        if doc_ids:
            sections = await repo.get_sections_for_documents(doc_ids[:MAX_DOCUMENTS])
            # Score sections by text overlap with query (lightweight)
            query_terms = set(query.lower().split())
            for s in sections:
                title = (s.get("title") or "").lower()
                text_preview = (s.get("text") or "")[:200].lower()
                overlap = sum(1 for t in query_terms if t in title or t in text_preview)
                if overlap > 0 or s["id"] in section_summary_ids:
                    section_ids.add(s["id"])

    # Step 3: Semantic search on scoped embeddings
    semantic_chunks: list[RetrievedChunk] = []

    if section_ids:
        # Scoped: only search within relevant sections
        embeddings = await repo.get_embeddings_by_section_ids(list(section_ids)[:MAX_SECTIONS])
        if embeddings:
            semantic_chunks = await _score_embeddings(query, embeddings, max_chunks)

    # If no scoped results or no company scoping, fall back to broader search
    if not semantic_chunks:
        if company_id:
            embeddings = await repo.get_embeddings_by_company(company_id)
        else:
            embeddings = await repo.get_all_embeddings()
        if embeddings:
            semantic_chunks = await _score_embeddings(query, embeddings, max_chunks)

    # Step 4: Also include FTS text results as chunks
    fts_chunks: list[RetrievedChunk] = []
    for r in fts_results[:max_chunks]:
        fts_chunks.append(RetrievedChunk(
            chunk_id=r["source_id"],
            section_id=None,
            document_id="",
            text=r["text"],
            fts_rank=abs(r.get("rank", 0)),
        ))

    # Step 5: Merge and deduplicate
    seen = set()
    all_chunks = []
    for chunk in semantic_chunks + fts_chunks:
        key = chunk.chunk_id
        if key not in seen:
            seen.add(key)
            all_chunks.append(chunk)

    # Step 6: Deterministic rerank
    # final_score = 0.5 × semantic_sim + 0.3 × fts_rank_normalized + 0.2 × section_relevance
    max_fts = max((c.fts_rank for c in all_chunks if c.fts_rank > 0), default=1.0)
    for chunk in all_chunks:
        sem_score = chunk.similarity
        fts_score = (chunk.fts_rank / max_fts) if max_fts > 0 else 0.0
        section_bonus = 0.5 if chunk.section_id in section_summary_ids else 0.0
        chunk.final_score = 0.5 * sem_score + 0.3 * fts_score + 0.2 * section_bonus

    all_chunks.sort(key=lambda c: c.final_score, reverse=True)
    top_chunks = all_chunks[:RERANK_TOP_K]

    # Step 7: Token-bounded context assembly
    return _assemble_context(top_chunks, max_chars)


# ── Indexing ──

async def index_text(source_id: str, source_type: str, text: str, embed: bool = True,
                     company_id: str | None = None, analysis_id: str | None = None,
                     section_id: str | None = None) -> None:
    """Index text for both FTS5 and semantic search with optional scoping."""
    await repo.index_for_fts(source_id, source_type, text)

    if embed:
        try:
            embedding = await llm.embed_single(text[:8000])
            if embedding:
                await repo.save_embedding(
                    source_type, source_id, text[:500], embedding,
                    company_id=company_id, analysis_id=analysis_id, section_id=section_id)
        except Exception as e:
            logger.warning(f"Embedding failed for {source_id}: {e}")


# ── Internal helpers ──

async def _fts_search(query: str, limit: int) -> list[dict]:
    """Full-text search using FTS5."""
    try:
        clean_query = " ".join(
            word for word in query.split()
            if word.isalnum() or word.replace("'", "").isalnum()
        )
        if not clean_query:
            return []
        return await repo.search_fts(clean_query, limit)
    except Exception as e:
        logger.warning(f"FTS search failed: {e}")
        return []


async def _semantic_search(query: str, limit: int,
                           embeddings: list[dict] | None = None) -> list[dict]:
    """Semantic search using cached embeddings and cosine similarity."""
    try:
        query_embedding = await llm.embed_single(query)
        if not query_embedding:
            return []

        if embeddings is None:
            embeddings = await repo.get_all_embeddings()
        if not embeddings:
            return []

        query_vec = np.array(query_embedding, dtype=np.float32)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            return []

        scored = []
        for entry in embeddings:
            emb_vec = np.array(entry["embedding"], dtype=np.float32)
            emb_norm = np.linalg.norm(emb_vec)
            if emb_norm == 0:
                continue
            similarity = float(np.dot(query_vec, emb_vec) / (query_norm * emb_norm))
            scored.append({
                "source_id": entry["source_id"],
                "source_type": entry["source_type"],
                "text": entry["text"],
                "similarity": similarity,
            })

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:limit]

    except Exception as e:
        logger.warning(f"Semantic search failed: {e}")
        return []


async def _score_embeddings(query: str, embeddings: list[dict],
                            limit: int) -> list[RetrievedChunk]:
    """Score embeddings against a query and return RetrievedChunk results."""
    try:
        query_embedding = await llm.embed_single(query)
        if not query_embedding:
            return []

        query_vec = np.array(query_embedding, dtype=np.float32)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            return []

        chunks = []
        for entry in embeddings:
            emb_vec = np.array(entry["embedding"], dtype=np.float32)
            emb_norm = np.linalg.norm(emb_vec)
            if emb_norm == 0:
                continue
            similarity = float(np.dot(query_vec, emb_vec) / (query_norm * emb_norm))
            if similarity < MIN_SIMILARITY_THRESHOLD:
                continue
            chunks.append(RetrievedChunk(
                chunk_id=entry["source_id"],
                section_id=entry.get("section_id"),
                document_id="",
                text=entry["text"],
                similarity=similarity,
            ))

        chunks.sort(key=lambda c: c.similarity, reverse=True)
        return chunks[:limit]

    except Exception as e:
        logger.warning(f"Embedding scoring failed: {e}")
        return []


def _assemble_context(chunks: list[RetrievedChunk], max_chars: int) -> AssembledContext:
    """Assemble chunks into a token-bounded context string."""
    parts = []
    used_chars = 0
    included_chunks = []
    doc_ids = set()

    for chunk in chunks:
        # Add section header if available
        header = ""
        if chunk.section_title:
            header = f"[Section: {chunk.section_title}]\n"

        entry = header + chunk.text
        entry_len = len(entry) + 2  # account for separator

        if used_chars + entry_len > max_chars:
            # Try to fit a truncated version
            remaining = max_chars - used_chars - len(header) - 2
            if remaining > 100:  # only include if we can fit at least 100 chars
                truncated = header + chunk.text[:remaining] + "..."
                parts.append(truncated)
                included_chunks.append(chunk)
                used_chars += len(truncated) + 2
            break

        parts.append(entry)
        included_chunks.append(chunk)
        used_chars += entry_len
        if chunk.document_id:
            doc_ids.add(chunk.document_id)

    return AssembledContext(
        text="\n\n".join(parts),
        chunks=included_chunks,
        total_chars=used_chars,
        source_documents=list(doc_ids),
    )


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_vec = np.array(a, dtype=np.float32)
    b_vec = np.array(b, dtype=np.float32)
    norm_a = np.linalg.norm(a_vec)
    norm_b = np.linalg.norm(b_vec)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_vec, b_vec) / (norm_a * norm_b))
