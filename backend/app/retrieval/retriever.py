"""Hybrid retrieval — FTS5 keyword search + semantic similarity via numpy.

Local-first: embeddings cached in SQLite, cosine similarity computed with numpy.
"""

import logging

import numpy as np

from app.persistence import repositories as repo
from app.services import llm

logger = logging.getLogger(__name__)


async def hybrid_search(query: str, workspace_id: str | None = None,
                        limit: int = 20) -> list[dict]:
    """Run hybrid retrieval: FTS5 keyword + semantic similarity."""
    # 1. Keyword search via FTS5
    fts_results = await _fts_search(query, limit)

    # 2. Semantic search via embeddings
    semantic_results = await _semantic_search(query, limit)

    # 3. Merge and deduplicate
    seen_ids = set()
    merged = []

    # Interleave: keyword results first (they're more precise), then semantic
    for result in fts_results + semantic_results:
        source_id = result["source_id"]
        if source_id not in seen_ids:
            seen_ids.add(source_id)
            merged.append(result)
        if len(merged) >= limit:
            break

    return merged


async def _fts_search(query: str, limit: int) -> list[dict]:
    """Full-text search using FTS5."""
    try:
        # Escape FTS5 special chars
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


async def _semantic_search(query: str, limit: int) -> list[dict]:
    """Semantic search using cached embeddings and cosine similarity."""
    try:
        query_embedding = await llm.embed_single(query)
        if not query_embedding:
            return []

        # Load all embeddings from cache
        all_embeddings = await repo.get_all_embeddings()
        if not all_embeddings:
            return []

        # Compute cosine similarities
        query_vec = np.array(query_embedding, dtype=np.float32)
        query_norm = np.linalg.norm(query_vec)
        if query_norm == 0:
            return []

        scored = []
        for entry in all_embeddings:
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


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Compute cosine similarity between two vectors."""
    a_vec = np.array(a, dtype=np.float32)
    b_vec = np.array(b, dtype=np.float32)
    norm_a = np.linalg.norm(a_vec)
    norm_b = np.linalg.norm(b_vec)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_vec, b_vec) / (norm_a * norm_b))


async def index_text(source_id: str, source_type: str, text: str, embed: bool = True) -> None:
    """Index text for both FTS5 and semantic search."""
    # FTS5
    await repo.index_for_fts(source_id, source_type, text)

    # Semantic embedding
    if embed:
        try:
            embedding = await llm.embed_single(text[:8000])
            if embedding:
                await repo.save_embedding(source_type, source_id, text[:500], embedding)
        except Exception as e:
            logger.warning(f"Embedding failed for {source_id}: {e}")
