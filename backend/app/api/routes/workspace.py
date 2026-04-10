"""Workspace endpoints — CRUD, insights, questions, exploration."""

import json

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel

from app.api.schemas import (
    AskQuestionRequest, AskQuestionResponse, InsightConfidenceResponse,
    InsightResponse, QuestionAnswerResponse, QuestionResponse,
    FollowUpResponse, UpdateInsightStatusRequest,
    WorkspaceResponse, WorkspaceStatsResponse,
)
from app.config import MAX_QUESTIONS_PER_WORKSPACE
from app.domain.enums import DisplayStatus, QuestionStatus
from app.exploration.agent import explore_question
from app.persistence import repositories as repo

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(workspace_id: str):
    ws = await repo.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # Compute stats
    all_insights = await repo.get_insights(ws.id, include_archived=True)
    questions = await repo.get_questions(ws.id)
    contradictions = await repo.get_contradictions_for_analysis(ws.analysis_id)

    stats = WorkspaceStatsResponse(
        total_insights=len(all_insights),
        pinned_insights=sum(1 for i in all_insights if i.display_status == DisplayStatus.PINNED),
        visible_insights=sum(1 for i in all_insights if i.display_status == DisplayStatus.VISIBLE),
        collapsed_insights=sum(1 for i in all_insights if i.display_status == DisplayStatus.COLLAPSED),
        archived_insights=sum(1 for i in all_insights if i.display_status == DisplayStatus.ARCHIVED),
        total_questions=len(questions),
        answered_questions=sum(1 for q in questions if q.status == QuestionStatus.ANSWERED),
        contradiction_count=len(contradictions),
    )

    return WorkspaceResponse(
        id=ws.id, analysis_id=ws.analysis_id, company_id=ws.company_id,
        company_name=ws.company_name, market_space=ws.market_space,
        status=ws.status, stats=stats, created_at=ws.created_at, updated_at=ws.updated_at,
    )


@router.get("/by-analysis/{analysis_id}", response_model=WorkspaceResponse)
async def get_workspace_by_analysis(analysis_id: str):
    ws = await repo.get_workspace_by_analysis(analysis_id)
    if not ws:
        raise HTTPException(status_code=404, detail="No workspace found for this analysis")
    # Reuse the get logic
    return await get_workspace(ws.id)


# ── Insights ──

@router.get("/{workspace_id}/insights", response_model=list[InsightResponse])
async def get_insights(workspace_id: str, include_archived: bool = False):
    ws = await repo.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    insights = await repo.get_insights(workspace_id, include_archived)
    return [_insight_to_response(i) for i in insights]


@router.patch("/{workspace_id}/insights/{insight_id}", response_model=InsightResponse)
async def update_insight_status(workspace_id: str, insight_id: str, req: UpdateInsightStatusRequest):
    insight = await repo.get_insight(insight_id)
    if not insight or insight.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Insight not found")
    try:
        new_status = DisplayStatus(req.display_status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid display status: {req.display_status}")
    await repo.update_insight_display_status(insight_id, new_status)
    insight.display_status = new_status
    return _insight_to_response(insight)


# ── Questions ──

@router.post("/{workspace_id}/questions", response_model=AskQuestionResponse, status_code=201)
async def ask_question(workspace_id: str, req: AskQuestionRequest, background_tasks: BackgroundTasks):
    ws = await repo.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    existing = await repo.get_questions(workspace_id)
    if len(existing) >= MAX_QUESTIONS_PER_WORKSPACE:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_QUESTIONS_PER_WORKSPACE} questions per workspace")

    # Determine depth
    depth = 0
    if req.parent_question_id:
        parent = await repo.get_question(req.parent_question_id)
        if parent:
            depth = parent.depth + 1

    question = await repo.create_question(workspace_id, req.question_text, req.parent_question_id, depth)
    operation = await repo.create_operation("exploration", parent_id=workspace_id, steps_total=4)

    # Get strategy lens if available
    strategy_lens = None
    if ws.company_id:
        strategy_lens = await repo.get_latest_strategy_lens(ws.company_id)

    background_tasks.add_task(explore_question, question.id, workspace_id, operation.id, strategy_lens)

    return AskQuestionResponse(question_id=question.id, operation_id=operation.id, status="pending")


@router.get("/{workspace_id}/questions", response_model=list[QuestionResponse])
async def list_questions(workspace_id: str):
    ws = await repo.get_workspace(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    questions = await repo.get_questions(workspace_id)
    return [await _question_to_response(q) for q in questions]


@router.get("/{workspace_id}/questions/{question_id}", response_model=QuestionResponse)
async def get_question(workspace_id: str, question_id: str):
    q = await repo.get_question(question_id)
    if not q or q.workspace_id != workspace_id:
        raise HTTPException(status_code=404, detail="Question not found")
    return await _question_to_response(q)


# ── Helpers ──

def _insight_to_response(ins) -> InsightResponse:
    return InsightResponse(
        id=ins.id, workspace_id=ins.workspace_id, question_id=ins.question_id,
        source_step=ins.source_step, display_status=ins.display_status.value,
        title=ins.title, body=ins.body,
        claim_ids=ins.claim_ids, source_ids=ins.source_ids,
        confidence=InsightConfidenceResponse(
            level=ins.confidence_level, score=int(ins.confidence_score),
            reasoning=ins.confidence_reasoning,
        ),
        tags=ins.tags,
        contradiction_note=ins.contradiction_note,
        contradiction_group_id=ins.contradiction_group_id,
        related_insight_ids=ins.related_insight_ids,
        created_at=ins.created_at,
    )


async def _question_to_response(q) -> QuestionResponse:
    answer = None
    if q.answer_text:
        answer = QuestionAnswerResponse(
            text=q.answer_text,
            confidence=InsightConfidenceResponse(
                level=q.answer_confidence_level or "medium",
                score=int(q.answer_confidence_score or 50),
                reasoning=q.answer_confidence_reasoning or "",
            ),
            strategy_lens_applied=q.strategy_lens_applied,
            contradictions_found=q.contradictions_found,
        )

    # Get insights for this question
    from app.persistence import repositories as repo
    ws = await repo.get_workspace(q.workspace_id)
    all_insights = await repo.get_insights(q.workspace_id)
    question_insights = [i for i in all_insights if i.question_id == q.id]

    # Get follow-ups
    follow_ups = await repo.get_follow_ups(q.id)

    return QuestionResponse(
        id=q.id, workspace_id=q.workspace_id,
        parent_question_id=q.parent_question_id,
        question_text=q.question_text, status=q.status.value,
        answer=answer,
        insights=[_insight_to_response(i) for i in question_insights] if question_insights else None,
        follow_ups=[
            FollowUpResponse(id=f.id, question_text=f.question_text,
                             reason=f.reason, status=f.status.value)
            for f in follow_ups
        ] if follow_ups else None,
        created_at=q.created_at,
    )



# ── Source lookup ──────────────────────────────────────────────────────────────

def _best_matching_sentence(content: str, query_words: set[str]) -> str | None:
    """Return the sentence in content whose word overlap with query_words is highest."""
    import re
    if not content or not query_words:
        return None
    sentences = re.split(r'(?<=[.!?])\s+', content.strip())
    best_score = 0.0
    best_sentence = None
    for sent in sentences:
        sent = sent.strip()
        if len(sent) < 20:
            continue
        sent_words = set(w for w in sent.lower().split() if len(w) > 3)
        if not sent_words:
            continue
        overlap = len(query_words & sent_words) / len(query_words | sent_words)
        if overlap > best_score:
            best_score = overlap
            best_sentence = sent
    # Only return if meaningful overlap
    return best_sentence if best_score > 0.08 else None


class SourceLookupRequest(BaseModel):
    highlighted_text: str
    insight_id: str | None = None
    block_category: str | None = None  # incumbents | emerging_competitors | market | assessment | ...


@router.post("/{workspace_id}/source-lookup")
async def source_lookup(workspace_id: str, req: SourceLookupRequest):
    """Return web sources (linked to insight) + doc chunk matches for highlighted text.
    workspace_id may also be an analysis_id — we resolve either way."""
    from app.config import use_real_apis
    from app.services import llm as llm_svc

    ws = await repo.get_workspace(workspace_id)
    if not ws:
        # Try resolving by analysis_id
        ws = await repo.get_workspace_by_analysis(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # ── Web sources via claim-based Jaccard matching ──
    web_sources: list[dict] = []

    query_words = set(w for w in req.highlighted_text.lower().split() if len(w) > 3)

    if req.insight_id:
        # Direct path: insight has explicit source_ids set at extraction time
        insight = await repo.get_insight(req.insight_id)
        if insight and insight.source_ids:
            rows = await repo.get_sources_by_ids(insight.source_ids)
            for r in rows:
                content = r.get("snippet") or r.get("raw_content", "")
                matching_quote = _best_matching_sentence(content, query_words)
                web_sources.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "publisher": r.get("publisher", ""),
                    "snippet": content[:400],
                    "date": r.get("published_date"),
                    "matching_quote": matching_quote,
                })
    else:
        # Claim-matching path: find claims whose statement best overlaps with
        # the highlighted text (Jaccard similarity), then return their source_ids.
        # Optionally narrow by block_category so incumbents text maps to
        # incumbents claims, not synthesis claims.
        CATEGORY_TO_CLAIM_TYPES = {
            "incumbents": {"competitive", "revenue", "product", "general"},
            "emerging_competitors": {"funding", "product", "trend", "general"},
            "market": {"market_size", "trend", "general"},
            "market_sizing": {"market_size", "trend", "general"},
            "assessment": None,  # None = no filter, search all
        }
        allowed_types = None
        if req.block_category:
            allowed_types = CATEGORY_TO_CLAIM_TYPES.get(req.block_category)

        all_claims = await repo.get_claims_for_analysis(ws.analysis_id)

        scored_claims: list[tuple[float, object]] = []
        for claim in all_claims:
            # Skip claims whose type doesn't match the section (if filter set)
            if allowed_types is not None and claim.claim_type.value not in allowed_types:
                continue
            claim_words = set(w for w in claim.statement.lower().split() if len(w) > 3)
            if not claim_words or not query_words:
                continue
            intersection = len(query_words & claim_words)
            union = len(query_words | claim_words)
            jaccard = intersection / union if union else 0.0
            if jaccard > 0.10:  # tighter relevance threshold
                scored_claims.append((jaccard, claim))

        scored_claims.sort(key=lambda x: x[0], reverse=True)

        # Collect source IDs from top 2 matching claims only (keep results focused)
        seen_source_ids: set[str] = set()
        for _, claim in scored_claims[:2]:
            for sid in claim.source_ids:
                seen_source_ids.add(sid)

        if seen_source_ids:
            rows = await repo.get_sources_by_ids(list(seen_source_ids))
            # Score each source by sentence-level match and keep top 3
            scored_sources: list[tuple[float, dict]] = []
            for r in rows:
                content = r.get("snippet") or r.get("raw_content", "")
                matching_quote = _best_matching_sentence(content, query_words)
                # Score source by best sentence overlap
                if matching_quote:
                    mq_words = set(w for w in matching_quote.lower().split() if len(w) > 3)
                    score = len(query_words & mq_words) / len(query_words | mq_words) if (query_words | mq_words) else 0.0
                else:
                    score = 0.0
                scored_sources.append((score, {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "publisher": r.get("publisher", ""),
                    "snippet": content[:400],
                    "date": r.get("published_date"),
                    "matching_quote": matching_quote,
                }))
            scored_sources.sort(key=lambda x: x[0], reverse=True)
            web_sources = [s for _, s in scored_sources[:3]]

        # Hard fallback: if no claims matched, return top 2 sources by relevance score
        if not web_sources:
            all_sources = await repo.get_sources_for_analysis(ws.analysis_id)
            for s in all_sources[:2]:
                content = s.snippet or (s.raw_content or "")
                matching_quote = _best_matching_sentence(content, query_words)
                web_sources.append({
                    "title": s.title or "",
                    "url": s.url or "",
                    "publisher": s.publisher or "",
                    "snippet": content[:400],
                    "date": s.published_date,
                    "matching_quote": matching_quote,
                })

    # ── Document chunk matches (semantic search) ──
    doc_sources: list[dict] = []
    company_id = ws.company_id
    if company_id and use_real_apis() and req.highlighted_text.strip():
        try:
            query_emb = await llm_svc.embed_single(req.highlighted_text)
            chunks = await repo.search_doc_chunks_by_embedding(query_emb, company_id, top_k=3)
            for c in chunks:
                doc_sources.append({
                    "filename": c["filename"],
                    "document_id": c["document_id"],
                    "page_number": (c.get("page_number") or 0) + 1,  # convert to 1-indexed
                    "excerpt": c["text"][:600],
                })
        except Exception:
            pass  # embeddings not available — skip doc sources

    return {"web_sources": web_sources, "doc_sources": doc_sources}
