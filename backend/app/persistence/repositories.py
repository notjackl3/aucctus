"""Repository layer — CRUD for all domain entities.

Organized by domain: analyses, steps, operations, sources, claims,
companies, strategy, workspaces, insights, questions, reports, documents.
"""

import json

from app.domain.enums import (
    AnalysisStatus, AnswerType, ClaimType, DecisionQuestionCategory,
    DisplayStatus, OperationStatus, QuestionStatus, SourceTier,
)
from app.domain.models import (
    Analysis, AnalysisStep, Claim, Company, ContradictionGroup,
    DecisionQuestion, Document, DocumentChunk, FollowUpQuestion,
    InsightNode, Operation, Report, Source, Workspace, WorkspaceQuestion,
)
from app.persistence.database import get_db
from app.shared.utils import generate_id, utc_now


# ═══════════════════════════════════════════════════════════════
# Analysis
# ═══════════════════════════════════════════════════════════════

async def create_analysis(
    company_name: str,
    market_space: str,
    company_context: str | None = None,
) -> Analysis:
    db = await get_db()
    analysis = Analysis(
        id=generate_id("ana"), company_name=company_name,
        market_space=market_space, company_context=company_context,
        status=AnalysisStatus.PENDING, created_at=utc_now(),
    )
    await db.execute(
        "INSERT INTO analyses (id, company_name, market_space, company_context, status, created_at) VALUES (?,?,?,?,?,?)",
        (analysis.id, analysis.company_name, analysis.market_space,
         analysis.company_context, analysis.status.value, analysis.created_at),
    )
    await db.commit()
    return analysis


async def get_analysis(analysis_id: str) -> Analysis | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    if not rows:
        return None
    r = rows[0]
    return Analysis(
        id=r["id"], company_name=r["company_name"], market_space=r["market_space"],
        company_context=r["company_context"], status=AnalysisStatus(r["status"]),
        result_json=r["result_json"], created_at=r["created_at"], completed_at=r["completed_at"],
    )


async def list_analyses() -> list[Analysis]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM analyses ORDER BY created_at DESC")
    return [Analysis(
        id=r["id"], company_name=r["company_name"], market_space=r["market_space"],
        company_context=r["company_context"], status=AnalysisStatus(r["status"]),
        result_json=r["result_json"], created_at=r["created_at"], completed_at=r["completed_at"],
    ) for r in rows]


async def update_analysis_status(analysis_id: str, status: AnalysisStatus, completed_at: str | None = None) -> None:
    db = await get_db()
    await db.execute("UPDATE analyses SET status = ?, completed_at = ? WHERE id = ?",
                     (status.value, completed_at, analysis_id))
    await db.commit()


async def store_analysis_result(analysis_id: str, result_json: str) -> None:
    db = await get_db()
    await db.execute("UPDATE analyses SET result_json = ?, status = ?, completed_at = ? WHERE id = ?",
                     (result_json, AnalysisStatus.COMPLETED.value, utc_now(), analysis_id))
    await db.commit()


async def delete_analysis(analysis_id: str) -> bool:
    """Hard-delete an analysis and all related data."""
    db = await get_db()
    exists = await db.execute_fetchall("SELECT id FROM analyses WHERE id = ?", (analysis_id,))
    if not exists:
        return False
    # Cascade: delete related rows from all dependent tables
    # Workspace chain: insights, questions, follow-ups, reports
    ws_rows = await db.execute_fetchall("SELECT id FROM workspaces WHERE analysis_id = ?", (analysis_id,))
    for ws in ws_rows:
        wid = ws["id"]
        # Follow-ups depend on questions
        q_rows = await db.execute_fetchall("SELECT id FROM workspace_questions WHERE workspace_id = ?", (wid,))
        for q in q_rows:
            await db.execute("DELETE FROM follow_up_questions WHERE parent_question_id = ?", (q["id"],))
        await db.execute("DELETE FROM workspace_questions WHERE workspace_id = ?", (wid,))
        await db.execute("DELETE FROM insights WHERE workspace_id = ?", (wid,))
        await db.execute("DELETE FROM reports WHERE workspace_id = ?", (wid,))
    await db.execute("DELETE FROM workspaces WHERE analysis_id = ?", (analysis_id,))
    # Direct dependents
    await db.execute("DELETE FROM analysis_steps WHERE analysis_id = ?", (analysis_id,))
    await db.execute("DELETE FROM sources WHERE analysis_id = ?", (analysis_id,))
    await db.execute("DELETE FROM claims WHERE analysis_id = ?", (analysis_id,))
    await db.execute("DELETE FROM contradictions WHERE analysis_id = ?", (analysis_id,))
    await db.execute("DELETE FROM operations WHERE parent_id = ?", (analysis_id,))
    # Finally, the analysis itself
    await db.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    await db.commit()
    return True


# ═══════════════════════════════════════════════════════════════
# Analysis Steps
# ═══════════════════════════════════════════════════════════════

async def create_analysis_steps(analysis_id: str, steps: list[tuple[str, str]]) -> list[AnalysisStep]:
    db = await get_db()
    result = []
    for step_key, label in steps:
        step = AnalysisStep(id=generate_id("stp"), analysis_id=analysis_id,
                            step=step_key, label=label, status=AnalysisStatus.PENDING)
        await db.execute("INSERT INTO analysis_steps (id, analysis_id, step, label, status) VALUES (?,?,?,?,?)",
                         (step.id, step.analysis_id, step.step, step.label, step.status.value))
        result.append(step)
    await db.commit()
    return result


async def get_analysis_steps(analysis_id: str) -> list[AnalysisStep]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM analysis_steps WHERE analysis_id = ? ORDER BY rowid", (analysis_id,))
    return [AnalysisStep(id=r["id"], analysis_id=r["analysis_id"], step=r["step"],
                         label=r["label"], status=AnalysisStatus(r["status"]),
                         started_at=r["started_at"], completed_at=r["completed_at"]) for r in rows]


async def update_step_status(step_id: str, status: AnalysisStatus,
                             started_at: str | None = None, completed_at: str | None = None) -> None:
    db = await get_db()
    await db.execute("UPDATE analysis_steps SET status = ?, started_at = COALESCE(?, started_at), completed_at = ? WHERE id = ?",
                     (status.value, started_at, completed_at, step_id))
    await db.commit()


# ═══════════════════════════════════════════════════════════════
# Operations
# ═══════════════════════════════════════════════════════════════

async def create_operation(operation_type: str, parent_id: str | None = None, steps_total: int = 1) -> Operation:
    db = await get_db()
    op = Operation(id=generate_id("op"), operation_type=operation_type, parent_id=parent_id,
                   status=OperationStatus.PENDING, steps_total=steps_total, created_at=utc_now())
    await db.execute("INSERT INTO operations (id, operation_type, parent_id, status, steps_total, created_at) VALUES (?,?,?,?,?,?)",
                     (op.id, op.operation_type, op.parent_id, op.status.value, op.steps_total, op.created_at))
    await db.commit()
    return op


async def get_operation(operation_id: str) -> Operation | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM operations WHERE id = ?", (operation_id,))
    if not rows:
        return None
    r = rows[0]
    partial = json.loads(r["partial_data"]) if r["partial_data"] else None
    return Operation(id=r["id"], operation_type=r["operation_type"], parent_id=r["parent_id"],
                     status=OperationStatus(r["status"]), current_step=r["current_step"],
                     steps_completed=r["steps_completed"], steps_total=r["steps_total"],
                     partial_data=partial, error_message=r["error_message"],
                     created_at=r["created_at"], completed_at=r["completed_at"])


async def update_operation(operation_id: str, *, status: OperationStatus | None = None,
                           current_step: str | None = None, steps_completed: int | None = None,
                           partial_data: dict | None = None, error_message: str | None = None,
                           completed_at: str | None = None) -> None:
    db = await get_db()
    fields, values = [], []
    if status is not None: fields.append("status = ?"); values.append(status.value)
    if current_step is not None: fields.append("current_step = ?"); values.append(current_step)
    if steps_completed is not None: fields.append("steps_completed = ?"); values.append(steps_completed)
    if partial_data is not None: fields.append("partial_data = ?"); values.append(json.dumps(partial_data))
    if error_message is not None: fields.append("error_message = ?"); values.append(error_message)
    if completed_at is not None: fields.append("completed_at = ?"); values.append(completed_at)
    if not fields: return
    values.append(operation_id)
    await db.execute(f"UPDATE operations SET {', '.join(fields)} WHERE id = ?", values)
    await db.commit()


# ═══════════════════════════════════════════════════════════════
# Sources
# ═══════════════════════════════════════════════════════════════

async def create_source(source: Source) -> None:
    db = await get_db()
    await db.execute(
        "INSERT OR IGNORE INTO sources (id, analysis_id, url, title, publisher, tier, snippet, published_date, raw_content, relevance_score, provider, source_category, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (source.id, source.analysis_id, source.url, source.title, source.publisher,
         source.tier.value, source.snippet, source.published_date, source.raw_content,
         source.relevance_score, source.provider, source.source_category, source.created_at),
    )
    await db.commit()


async def get_sources_for_analysis(analysis_id: str) -> list[Source]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM sources WHERE analysis_id = ? ORDER BY relevance_score DESC", (analysis_id,))
    return [_row_to_source(r) for r in rows]


async def find_prior_analyses(market_space: str, max_age_days: int = 30,
                              exclude_id: str | None = None) -> list[Analysis]:
    """Find completed analyses for the same or similar market within a time window."""
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM analyses WHERE status = 'completed' "
        "AND market_space = ? ORDER BY created_at DESC LIMIT 5",
        (market_space,))
    results = []
    from datetime import datetime, timedelta, timezone
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
    for r in rows:
        if exclude_id and r["id"] == exclude_id:
            continue
        try:
            created = datetime.fromisoformat(r["created_at"].replace("Z", "+00:00"))
            if created >= cutoff:
                results.append(Analysis(
                    id=r["id"], company_name=r["company_name"], market_space=r["market_space"],
                    company_context=r["company_context"], status=AnalysisStatus(r["status"]),
                    result_json=r["result_json"], created_at=r["created_at"],
                    completed_at=r["completed_at"],
                ))
        except (ValueError, TypeError):
            continue  # skip rows with unparseable dates
    return results


async def get_sources_for_analyses(analysis_ids: list[str]) -> list[Source]:
    """Get sources from multiple analyses (for evidence reuse)."""
    if not analysis_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in analysis_ids)
    rows = await db.execute_fetchall(
        f"SELECT * FROM sources WHERE analysis_id IN ({placeholders}) ORDER BY relevance_score DESC",
        analysis_ids)
    return [_row_to_source(r) for r in rows]


async def get_claims_for_analyses(analysis_ids: list[str]) -> list[Claim]:
    """Get claims from multiple analyses (for evidence reuse)."""
    if not analysis_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in analysis_ids)
    rows = await db.execute_fetchall(
        f"SELECT * FROM claims WHERE analysis_id IN ({placeholders})", analysis_ids)
    return [Claim(id=r["id"], analysis_id=r["analysis_id"], statement=r["statement"],
                  claim_type=ClaimType(r["claim_type"]), entities=json.loads(r["entities_json"]),
                  source_ids=json.loads(r["source_ids_json"]), confidence_score=r["confidence_score"],
                  source_count=r["source_count"], created_at=r["created_at"]) for r in rows]


def _row_to_source(r) -> Source:
    return Source(
        id=r["id"], analysis_id=r["analysis_id"], url=r["url"], title=r["title"],
        publisher=r["publisher"], tier=SourceTier(r["tier"]), snippet=r["snippet"],
        published_date=r["published_date"], raw_content=r["raw_content"],
        relevance_score=r["relevance_score"],
        provider=r["provider"] if "provider" in r.keys() else "tavily",
        source_category=r["source_category"] if "source_category" in r.keys() else "web",
        created_at=r["created_at"],
    )


async def create_source_metadata(source_id: str, provider: str, metadata_json: str) -> str:
    db = await get_db()
    meta_id = generate_id("smeta")
    await db.execute(
        "INSERT INTO source_metadata (id, source_id, provider, metadata_json, created_at) VALUES (?,?,?,?,?)",
        (meta_id, source_id, provider, metadata_json, utc_now()),
    )
    await db.commit()
    return meta_id


async def get_source_metadata(source_id: str) -> list[dict]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM source_metadata WHERE source_id = ?", (source_id,))
    return [{"id": r["id"], "source_id": r["source_id"], "provider": r["provider"],
             "metadata_json": r["metadata_json"], "created_at": r["created_at"]} for r in rows]


# ═══════════════════════════════════════════════════════════════
# Claims
# ═══════════════════════════════════════════════════════════════

async def create_claim(claim: Claim) -> None:
    db = await get_db()
    await db.execute(
        "INSERT INTO claims (id, analysis_id, statement, claim_type, entities_json, source_ids_json, confidence_score, source_count, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (claim.id, claim.analysis_id, claim.statement, claim.claim_type.value,
         json.dumps(claim.entities), json.dumps(claim.source_ids),
         claim.confidence_score, claim.source_count, claim.created_at),
    )
    await db.commit()


async def get_claims_for_analysis(analysis_id: str) -> list[Claim]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM claims WHERE analysis_id = ?", (analysis_id,))
    return [Claim(id=r["id"], analysis_id=r["analysis_id"], statement=r["statement"],
                  claim_type=ClaimType(r["claim_type"]), entities=json.loads(r["entities_json"]),
                  source_ids=json.loads(r["source_ids_json"]), confidence_score=r["confidence_score"],
                  source_count=r["source_count"], created_at=r["created_at"]) for r in rows]


# ═══════════════════════════════════════════════════════════════
# Contradictions
# ═══════════════════════════════════════════════════════════════

async def create_contradiction(ctg: ContradictionGroup) -> None:
    db = await get_db()
    await db.execute(
        "INSERT INTO contradictions (id, analysis_id, claim_ids_json, description, resolution, created_at) VALUES (?,?,?,?,?,?)",
        (ctg.id, ctg.analysis_id, json.dumps(ctg.claim_ids), ctg.description, ctg.resolution, ctg.created_at),
    )
    await db.commit()


async def get_contradictions_for_analysis(analysis_id: str) -> list[ContradictionGroup]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM contradictions WHERE analysis_id = ?", (analysis_id,))
    return [ContradictionGroup(id=r["id"], analysis_id=r["analysis_id"],
                               claim_ids=json.loads(r["claim_ids_json"]), description=r["description"],
                               resolution=r["resolution"], created_at=r["created_at"]) for r in rows]


# ═══════════════════════════════════════════════════════════════
# Companies
# ═══════════════════════════════════════════════════════════════

async def create_company(name: str, context: str | None = None) -> Company:
    db = await get_db()
    company = Company(id=generate_id("cmp"), name=name, context=context, created_at=utc_now())
    await db.execute("INSERT INTO companies (id, name, context, created_at) VALUES (?,?,?,?)",
                     (company.id, company.name, company.context, company.created_at))
    await db.commit()
    return company


async def get_company(company_id: str) -> Company | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM companies WHERE id = ?", (company_id,))
    if not rows: return None
    r = rows[0]
    return Company(id=r["id"], name=r["name"], context=r["context"],
                   created_at=r["created_at"], updated_at=r["updated_at"])


async def update_company_context(company_id: str, context: str) -> None:
    db = await get_db()
    await db.execute("UPDATE companies SET context = ?, updated_at = ? WHERE id = ?",
                     (context, utc_now(), company_id))
    await db.commit()


async def delete_company(company_id: str) -> None:
    db = await get_db()
    # Get document IDs to cascade into chunks/sections/embeddings
    rows = await db.execute_fetchall("SELECT id FROM documents WHERE company_id = ?", (company_id,))
    doc_ids = [r[0] for r in rows]
    for doc_id in doc_ids:
        await db.execute("DELETE FROM document_chunks WHERE document_id = ?", (doc_id,))
        await db.execute("DELETE FROM document_sections WHERE document_id = ?", (doc_id,))
    await db.execute("DELETE FROM embeddings WHERE company_id = ?", (company_id,))
    await db.execute("DELETE FROM market_suggestions WHERE company_id = ?", (company_id,))
    await db.execute("DELETE FROM strategy_lenses WHERE company_id = ?", (company_id,))
    await db.execute("DELETE FROM documents WHERE company_id = ?", (company_id,))
    await db.execute("DELETE FROM companies WHERE id = ?", (company_id,))
    await db.commit()


async def save_market_suggestions(company_id: str, suggestions: list[str]) -> None:
    db = await get_db()
    import json as _json
    suggestion_id = generate_id("mks")
    await db.execute("DELETE FROM market_suggestions WHERE company_id = ?", (company_id,))
    await db.execute(
        "INSERT INTO market_suggestions (id, company_id, suggestions_json, generated_at) VALUES (?,?,?,?)",
        (suggestion_id, company_id, _json.dumps(suggestions), utc_now()),
    )
    await db.commit()


async def get_market_suggestions(company_id: str) -> list[str] | None:
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT suggestions_json FROM market_suggestions WHERE company_id = ? ORDER BY generated_at DESC LIMIT 1",
        (company_id,),
    )
    if not rows:
        return None
    import json as _json
    return _json.loads(rows[0]["suggestions_json"])


async def list_companies() -> list[Company]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM companies ORDER BY created_at DESC")
    return [Company(id=r["id"], name=r["name"], context=r["context"],
                    created_at=r["created_at"], updated_at=r["updated_at"]) for r in rows]


# ═══════════════════════════════════════════════════════════════
# Strategy Lens
# ═══════════════════════════════════════════════════════════════

async def save_strategy_lens(company_id: str, lens_json: str, confidence_note: str | None = None) -> str:
    db = await get_db()
    lens_id = generate_id("stl")
    # Get current max version
    rows = await db.execute_fetchall("SELECT MAX(version) as v FROM strategy_lenses WHERE company_id = ?", (company_id,))
    version = (rows[0]["v"] or 0) + 1 if rows else 1
    await db.execute("INSERT INTO strategy_lenses (id, company_id, version, lens_json, confidence_note, built_at) VALUES (?,?,?,?,?,?)",
                     (lens_id, company_id, version, lens_json, confidence_note, utc_now()))
    await db.commit()
    return lens_id


async def get_latest_strategy_lens(company_id: str) -> dict | None:
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM strategy_lenses WHERE company_id = ? ORDER BY version DESC LIMIT 1", (company_id,))
    if not rows: return None
    r = rows[0]
    lens = json.loads(r["lens_json"])
    lens["id"] = r["id"]
    lens["companyId"] = r["company_id"]
    lens["version"] = r["version"]
    lens["confidenceNote"] = r["confidence_note"]
    lens["builtAt"] = r["built_at"]
    return lens


# ═══════════════════════════════════════════════════════════════
# Workspaces
# ═══════════════════════════════════════════════════════════════

async def create_workspace(analysis_id: str, company_id: str | None,
                           company_name: str, market_space: str) -> Workspace:
    db = await get_db()
    ws = Workspace(id=generate_id("wks"), analysis_id=analysis_id, company_id=company_id,
                   company_name=company_name, market_space=market_space, created_at=utc_now())
    await db.execute("INSERT INTO workspaces (id, analysis_id, company_id, company_name, market_space, status, created_at) VALUES (?,?,?,?,?,?,?)",
                     (ws.id, ws.analysis_id, ws.company_id, ws.company_name, ws.market_space, ws.status, ws.created_at))
    await db.commit()
    return ws


async def get_workspace_by_analysis(analysis_id: str) -> Workspace | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM workspaces WHERE analysis_id = ? LIMIT 1", (analysis_id,))
    if not rows: return None
    r = rows[0]
    return Workspace(id=r["id"], analysis_id=r["analysis_id"], company_id=r["company_id"],
                     company_name=r["company_name"], market_space=r["market_space"],
                     status=r["status"], created_at=r["created_at"], updated_at=r["updated_at"])


async def get_workspace(workspace_id: str) -> Workspace | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM workspaces WHERE id = ?", (workspace_id,))
    if not rows: return None
    r = rows[0]
    return Workspace(id=r["id"], analysis_id=r["analysis_id"], company_id=r["company_id"],
                     company_name=r["company_name"], market_space=r["market_space"],
                     status=r["status"], created_at=r["created_at"], updated_at=r["updated_at"])


# ═══════════════════════════════════════════════════════════════
# Insights
# ═══════════════════════════════════════════════════════════════

async def create_insight(workspace_id: str, data: dict) -> InsightNode:
    db = await get_db()
    display = data.get("display_status", "visible")
    ins = InsightNode(
        id=generate_id("ins"), workspace_id=workspace_id,
        question_id=data.get("question_id"), source_step=data["source_step"],
        display_status=DisplayStatus(display), title=data["title"], body=data["body"],
        claim_ids=data.get("claim_ids", []), source_ids=data.get("source_ids", []),
        confidence_score=data.get("confidence_score", 50),
        confidence_level=data.get("confidence_level", "medium"),
        confidence_reasoning=data.get("confidence_reasoning", ""),
        tags=data.get("tags", []),
        contradiction_note=data.get("contradiction_note"),
        contradiction_group_id=data.get("contradiction_group_id"),
        related_insight_ids=data.get("related_insight_ids", []),
        created_at=utc_now(),
    )
    await db.execute(
        """INSERT INTO insights (id, workspace_id, question_id, source_step, display_status,
           title, body, claim_ids_json, source_ids_json, confidence_score, confidence_level,
           confidence_reasoning, tags_json, contradiction_note, contradiction_group_id,
           related_insight_ids_json, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (ins.id, ins.workspace_id, ins.question_id, ins.source_step, ins.display_status.value,
         ins.title, ins.body, json.dumps(ins.claim_ids), json.dumps(ins.source_ids),
         ins.confidence_score, ins.confidence_level, ins.confidence_reasoning,
         json.dumps(ins.tags), ins.contradiction_note, ins.contradiction_group_id,
         json.dumps(ins.related_insight_ids), ins.created_at),
    )
    await db.commit()
    return ins


async def get_insights(workspace_id: str, include_archived: bool = False) -> list[InsightNode]:
    db = await get_db()
    if include_archived:
        rows = await db.execute_fetchall("SELECT * FROM insights WHERE workspace_id = ? ORDER BY created_at", (workspace_id,))
    else:
        rows = await db.execute_fetchall(
            "SELECT * FROM insights WHERE workspace_id = ? AND display_status != 'archived' ORDER BY created_at", (workspace_id,))
    return [_row_to_insight(r) for r in rows]


async def get_insight(insight_id: str) -> InsightNode | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM insights WHERE id = ?", (insight_id,))
    if not rows: return None
    return _row_to_insight(rows[0])


async def update_insight_display_status(insight_id: str, status: DisplayStatus) -> None:
    db = await get_db()
    await db.execute("UPDATE insights SET display_status = ? WHERE id = ?", (status.value, insight_id))
    await db.commit()


def _row_to_insight(r) -> InsightNode:
    return InsightNode(
        id=r["id"], workspace_id=r["workspace_id"], question_id=r["question_id"],
        source_step=r["source_step"], display_status=DisplayStatus(r["display_status"]),
        title=r["title"], body=r["body"],
        claim_ids=json.loads(r["claim_ids_json"]), source_ids=json.loads(r["source_ids_json"]),
        confidence_score=r["confidence_score"], confidence_level=r["confidence_level"],
        confidence_reasoning=r["confidence_reasoning"],
        tags=json.loads(r["tags_json"]),
        contradiction_note=r["contradiction_note"],
        contradiction_group_id=r["contradiction_group_id"],
        related_insight_ids=json.loads(r["related_insight_ids_json"]),
        created_at=r["created_at"],
    )


# ═══════════════════════════════════════════════════════════════
# Workspace Questions
# ═══════════════════════════════════════════════════════════════

async def create_question(workspace_id: str, question_text: str,
                          parent_question_id: str | None = None, depth: int = 0) -> WorkspaceQuestion:
    db = await get_db()
    q = WorkspaceQuestion(id=generate_id("wkq"), workspace_id=workspace_id,
                          parent_question_id=parent_question_id, question_text=question_text,
                          status=QuestionStatus.PENDING, depth=depth, created_at=utc_now())
    await db.execute(
        "INSERT INTO workspace_questions (id, workspace_id, parent_question_id, question_text, status, depth, created_at) VALUES (?,?,?,?,?,?,?)",
        (q.id, q.workspace_id, q.parent_question_id, q.question_text, q.status.value, q.depth, q.created_at))
    await db.commit()
    return q


async def get_question(question_id: str) -> WorkspaceQuestion | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM workspace_questions WHERE id = ?", (question_id,))
    if not rows: return None
    return _row_to_question(rows[0])


async def get_questions(workspace_id: str) -> list[WorkspaceQuestion]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM workspace_questions WHERE workspace_id = ? ORDER BY created_at", (workspace_id,))
    return [_row_to_question(r) for r in rows]


async def update_question_answer(question_id: str, answer_text: str, confidence_score: float,
                                 confidence_level: str, confidence_reasoning: str,
                                 strategy_lens_applied: bool, contradictions_found: int) -> None:
    db = await get_db()
    await db.execute(
        """UPDATE workspace_questions SET status = ?, answer_text = ?, answer_confidence_score = ?,
           answer_confidence_level = ?, answer_confidence_reasoning = ?,
           strategy_lens_applied = ?, contradictions_found = ? WHERE id = ?""",
        (QuestionStatus.ANSWERED.value, answer_text, confidence_score, confidence_level,
         confidence_reasoning, int(strategy_lens_applied), contradictions_found, question_id))
    await db.commit()


async def update_question_status(question_id: str, status: QuestionStatus) -> None:
    db = await get_db()
    await db.execute("UPDATE workspace_questions SET status = ? WHERE id = ?", (status.value, question_id))
    await db.commit()


def _row_to_question(r) -> WorkspaceQuestion:
    return WorkspaceQuestion(
        id=r["id"], workspace_id=r["workspace_id"],
        parent_question_id=r["parent_question_id"], question_text=r["question_text"],
        status=QuestionStatus(r["status"]), answer_text=r["answer_text"],
        answer_confidence_score=r["answer_confidence_score"],
        answer_confidence_level=r["answer_confidence_level"],
        answer_confidence_reasoning=r["answer_confidence_reasoning"],
        strategy_lens_applied=bool(r["strategy_lens_applied"]),
        contradictions_found=r["contradictions_found"], depth=r["depth"],
        created_at=r["created_at"],
    )


# ═══════════════════════════════════════════════════════════════
# Follow-up Questions
# ═══════════════════════════════════════════════════════════════

async def create_follow_up(parent_question_id: str, question_text: str, reason: str) -> FollowUpQuestion:
    db = await get_db()
    fu = FollowUpQuestion(id=generate_id("wkq"), parent_question_id=parent_question_id,
                          question_text=question_text, reason=reason)
    await db.execute("INSERT INTO follow_up_questions (id, parent_question_id, question_text, reason, status) VALUES (?,?,?,?,?)",
                     (fu.id, fu.parent_question_id, fu.question_text, fu.reason, fu.status.value))
    await db.commit()
    return fu


async def get_follow_ups(parent_question_id: str) -> list[FollowUpQuestion]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM follow_up_questions WHERE parent_question_id = ?", (parent_question_id,))
    return [FollowUpQuestion(id=r["id"], parent_question_id=r["parent_question_id"],
                             question_text=r["question_text"], reason=r["reason"],
                             status=QuestionStatus(r["status"])) for r in rows]


# ═══════════════════════════════════════════════════════════════
# Reports
# ═══════════════════════════════════════════════════════════════

async def create_report(workspace_id: str, analysis_id: str) -> Report:
    db = await get_db()
    report = Report(id=generate_id("rpt"), workspace_id=workspace_id,
                    analysis_id=analysis_id, created_at=utc_now())
    await db.execute("INSERT INTO reports (id, workspace_id, analysis_id, created_at) VALUES (?,?,?,?)",
                     (report.id, report.workspace_id, report.analysis_id, report.created_at))
    await db.commit()
    return report


async def update_report(report_id: str, *, executive_summary: str | None = None,
                        sections_json: str | None = None, rtb: list[str] | None = None,
                        rtc: list[str] | None = None, open_questions: list[str] | None = None,
                        insight_count: int | None = None, source_count: int | None = None) -> None:
    db = await get_db()
    fields, values = [], []
    if executive_summary is not None: fields.append("executive_summary = ?"); values.append(executive_summary)
    if sections_json is not None: fields.append("sections_json = ?"); values.append(sections_json)
    if rtb is not None: fields.append("rtb_json = ?"); values.append(json.dumps(rtb))
    if rtc is not None: fields.append("rtc_json = ?"); values.append(json.dumps(rtc))
    if open_questions is not None: fields.append("open_questions_json = ?"); values.append(json.dumps(open_questions))
    if insight_count is not None: fields.append("insight_count = ?"); values.append(insight_count)
    if source_count is not None: fields.append("source_count = ?"); values.append(source_count)
    fields.append("compiled_at = ?"); values.append(utc_now())
    values.append(report_id)
    await db.execute(f"UPDATE reports SET {', '.join(fields)} WHERE id = ?", values)
    await db.commit()


async def get_report(report_id: str) -> Report | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM reports WHERE id = ?", (report_id,))
    if not rows: return None
    return _row_to_report(rows[0])


async def get_report_by_workspace(workspace_id: str) -> Report | None:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM reports WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 1", (workspace_id,))
    if not rows: return None
    return _row_to_report(rows[0])


def _row_to_report(r) -> Report:
    return Report(
        id=r["id"], workspace_id=r["workspace_id"], analysis_id=r["analysis_id"],
        report_style=r["report_style"], executive_summary=r["executive_summary"],
        sections_json=r["sections_json"],
        reasons_to_believe=json.loads(r["rtb_json"]) if r["rtb_json"] else [],
        reasons_to_challenge=json.loads(r["rtc_json"]) if r["rtc_json"] else [],
        open_questions=json.loads(r["open_questions_json"]) if r["open_questions_json"] else [],
        insight_count=r["insight_count"], source_count=r["source_count"],
        compiled_at=r["compiled_at"], created_at=r["created_at"],
    )


# ═══════════════════════════════════════════════════════════════
# Documents
# ═══════════════════════════════════════════════════════════════

async def create_document(company_id: str, filename: str, content_type: str,
                          raw_text: str | None = None) -> Document:
    db = await get_db()
    doc = Document(id=generate_id("doc"), company_id=company_id, filename=filename,
                   content_type=content_type, raw_text=raw_text, created_at=utc_now())
    await db.execute("INSERT INTO documents (id, company_id, filename, content_type, raw_text, created_at) VALUES (?,?,?,?,?,?)",
                     (doc.id, doc.company_id, doc.filename, doc.content_type, doc.raw_text, doc.created_at))
    await db.commit()
    return doc


async def update_document(document_id: str, *, summary: str | None = None, chunk_count: int | None = None) -> None:
    db = await get_db()
    fields, values = [], []
    if summary is not None: fields.append("summary = ?"); values.append(summary)
    if chunk_count is not None: fields.append("chunk_count = ?"); values.append(chunk_count)
    if not fields: return
    values.append(document_id)
    await db.execute(f"UPDATE documents SET {', '.join(fields)} WHERE id = ?", values)
    await db.commit()


async def delete_document(document_id: str) -> bool:
    """Hard-delete a document and all related data (chunks, sections, embeddings)."""
    db = await get_db()
    exists = await db.execute_fetchall("SELECT id FROM documents WHERE id = ?", (document_id,))
    if not exists:
        return False
    # Get chunk ids to delete their embeddings
    chunk_rows = await db.execute_fetchall("SELECT id FROM document_chunks WHERE document_id = ?", (document_id,))
    for chunk in chunk_rows:
        await db.execute("DELETE FROM embeddings WHERE source_id = ?", (chunk["id"],))
    await db.execute("DELETE FROM document_chunks WHERE document_id = ?", (document_id,))
    await db.execute("DELETE FROM document_sections WHERE document_id = ?", (document_id,))
    await db.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    await db.commit()
    return True


async def get_documents_for_company(company_id: str) -> list[Document]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM documents WHERE company_id = ? ORDER BY created_at DESC", (company_id,))
    return [Document(id=r["id"], company_id=r["company_id"], filename=r["filename"],
                     content_type=r["content_type"], raw_text=r["raw_text"],
                     summary=r["summary"], chunk_count=r["chunk_count"],
                     created_at=r["created_at"]) for r in rows]


async def create_document_chunk(document_id: str, chunk_index: int, text: str,
                                embedding: list[float] | None = None,
                                section_id: str | None = None,
                                chunk_type: str = "text",
                                page_number: int = 0) -> str:
    db = await get_db()
    chunk_id = generate_id("chk")
    embedding_json = json.dumps(embedding) if embedding else None
    await db.execute(
        "INSERT INTO document_chunks (id, document_id, chunk_index, text, embedding_json, section_id, chunk_type, page_number, created_at) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (chunk_id, document_id, chunk_index, text, embedding_json, section_id, chunk_type, page_number, utc_now()),
    )
    await db.commit()
    return chunk_id


# ── Document Sections ──

async def create_document_section(
    document_id: str,
    section_index: int,
    title: str | None,
    section_type: str,
    text: str,
    summary: str | None = None,
    char_count: int = 0,
    is_boilerplate: bool = False,
    start_page: int = 0,
) -> str:
    """Create a document section record. Returns section ID."""
    db = await get_db()
    section_id = generate_id("sec")
    try:
        await db.execute(
            "INSERT INTO document_sections (id, document_id, section_index, title, section_type, text, summary, char_count, is_boilerplate, start_page, created_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (section_id, document_id, section_index, title, section_type, text, summary, char_count, int(is_boilerplate), start_page, utc_now()),
        )
    except Exception:
        # Fallback for DBs where start_page column may not exist yet
        await db.execute(
            "INSERT INTO document_sections (id, document_id, section_index, title, section_type, text, summary, char_count, is_boilerplate, created_at) "
            "VALUES (?,?,?,?,?,?,?,?,?,?)",
            (section_id, document_id, section_index, title, section_type, text, summary, char_count, int(is_boilerplate), utc_now()),
        )
    await db.commit()
    return section_id


async def get_document_sections(document_id: str) -> list[dict]:
    """Get all sections for a document, ordered by section_index."""
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM document_sections WHERE document_id = ? ORDER BY section_index",
        (document_id,),
    )
    return [dict(r) for r in rows]


async def update_section_summary(section_id: str, summary: str) -> None:
    db = await get_db()
    await db.execute("UPDATE document_sections SET summary = ? WHERE id = ?", (summary, section_id))
    await db.commit()


# ═══════════════════════════════════════════════════════════════
# Embeddings Cache
# ═══════════════════════════════════════════════════════════════

async def save_embedding(source_type: str, source_id: str, text: str, embedding: list[float],
                         company_id: str | None = None, analysis_id: str | None = None,
                         section_id: str | None = None) -> None:
    db = await get_db()
    emb_id = generate_id("emb")
    await db.execute(
        "INSERT OR REPLACE INTO embeddings "
        "(id, source_type, source_id, text, embedding_json, company_id, analysis_id, section_id, created_at) "
        "VALUES (?,?,?,?,?,?,?,?,?)",
        (emb_id, source_type, source_id, text, json.dumps(embedding),
         company_id, analysis_id, section_id, utc_now()))
    await db.commit()


async def get_all_embeddings(source_type: str | None = None) -> list[dict]:
    db = await get_db()
    if source_type:
        rows = await db.execute_fetchall("SELECT * FROM embeddings WHERE source_type = ?", (source_type,))
    else:
        rows = await db.execute_fetchall("SELECT * FROM embeddings")
    return [_embedding_row_to_dict(r) for r in rows]


async def get_embeddings_by_company(company_id: str, source_type: str | None = None) -> list[dict]:
    """Get embeddings scoped to a specific company."""
    db = await get_db()
    if source_type:
        rows = await db.execute_fetchall(
            "SELECT * FROM embeddings WHERE company_id = ? AND source_type = ?",
            (company_id, source_type))
    else:
        rows = await db.execute_fetchall(
            "SELECT * FROM embeddings WHERE company_id = ?", (company_id,))
    return [_embedding_row_to_dict(r) for r in rows]


async def get_embeddings_by_section_ids(section_ids: list[str]) -> list[dict]:
    """Get embeddings for specific section IDs (hierarchical retrieval)."""
    if not section_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in section_ids)
    rows = await db.execute_fetchall(
        f"SELECT * FROM embeddings WHERE section_id IN ({placeholders})", section_ids)
    return [_embedding_row_to_dict(r) for r in rows]


async def get_embeddings_by_source_ids(source_ids: list[str]) -> list[dict]:
    """Get embeddings for specific source IDs."""
    if not source_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in source_ids)
    rows = await db.execute_fetchall(
        f"SELECT * FROM embeddings WHERE source_id IN ({placeholders})", source_ids)
    return [_embedding_row_to_dict(r) for r in rows]


def _embedding_row_to_dict(r) -> dict:
    return {"id": r["id"], "source_type": r["source_type"], "source_id": r["source_id"],
            "text": r["text"], "embedding": json.loads(r["embedding_json"]),
            "company_id": r["company_id"] if "company_id" in r.keys() else None,
            "section_id": r["section_id"] if "section_id" in r.keys() else None}


# ═══════════════════════════════════════════════════════════════
# FTS
# ═══════════════════════════════════════════════════════════════

async def index_for_fts(source_id: str, source_type: str, text: str) -> None:
    db = await get_db()
    await db.execute("INSERT INTO fts_content (source_id, source_type, text) VALUES (?,?,?)",
                     (source_id, source_type, text))
    await db.commit()


async def search_fts(query: str, limit: int = 20, source_type: str | None = None) -> list[dict]:
    """Full-text search, optionally filtered by source_type."""
    db = await get_db()
    if source_type:
        rows = await db.execute_fetchall(
            "SELECT source_id, source_type, text, rank FROM fts_content "
            "WHERE fts_content MATCH ? AND source_type = ? ORDER BY rank LIMIT ?",
            (query, source_type, limit))
    else:
        rows = await db.execute_fetchall(
            "SELECT source_id, source_type, text, rank FROM fts_content "
            "WHERE fts_content MATCH ? ORDER BY rank LIMIT ?",
            (query, limit))
    return [{"source_id": r["source_id"], "source_type": r["source_type"],
             "text": r["text"], "rank": r["rank"]} for r in rows]


async def get_sources_by_ids(source_ids: list[str]) -> list[dict]:
    """Fetch web sources by IDs."""
    if not source_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in source_ids)
    rows = await db.execute_fetchall(
        f"SELECT * FROM sources WHERE id IN ({placeholders})", source_ids)
    return [dict(r) for r in rows]


async def search_doc_chunks_by_embedding(
    query_embedding: list[float],
    company_id: str,
    top_k: int = 3,
) -> list[dict]:
    """Find top-k document chunks by cosine similarity, returning chunk text, page, and filename."""
    import numpy as np
    db = await get_db()

    # Get all document chunk embeddings for this company
    rows = await db.execute_fetchall(
        "SELECT e.source_id, e.embedding_json "
        "FROM embeddings e "
        "WHERE e.source_type = 'document_chunk' AND e.company_id = ?",
        (company_id,),
    )
    if not rows:
        return []

    query = np.array(query_embedding, dtype=np.float32)
    query_norm = query / (np.linalg.norm(query) + 1e-9)

    scored = []
    for r in rows:
        try:
            emb = np.array(json.loads(r["embedding_json"]), dtype=np.float32)
            emb_norm = emb / (np.linalg.norm(emb) + 1e-9)
            score = float(np.dot(query_norm, emb_norm))
            scored.append((score, r["source_id"]))
        except Exception:
            continue

    scored.sort(reverse=True)
    top_ids = [sid for _, sid in scored[:top_k]]

    if not top_ids:
        return []

    # Fetch chunk text + page + filename in one query
    placeholders = ",".join("?" for _ in top_ids)
    chunk_rows = await db.execute_fetchall(
        f"SELECT dc.id, dc.text, dc.page_number, d.filename, d.id as document_id "
        f"FROM document_chunks dc "
        f"JOIN documents d ON dc.document_id = d.id "
        f"WHERE dc.id IN ({placeholders})",
        top_ids,
    )
    chunk_map = {r["id"]: dict(r) for r in chunk_rows}

    # Return in scored order
    return [chunk_map[sid] for sid in top_ids if sid in chunk_map]


async def get_document_ids_for_company(company_id: str) -> list[str]:
    """Get all document IDs belonging to a company."""
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT id FROM documents WHERE company_id = ?", (company_id,))
    return [r["id"] for r in rows]


async def get_sections_for_documents(document_ids: list[str], boilerplate: bool = False) -> list[dict]:
    """Get sections for specific documents, optionally excluding boilerplate."""
    if not document_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in document_ids)
    bp_filter = "" if boilerplate else " AND is_boilerplate = 0"
    rows = await db.execute_fetchall(
        f"SELECT * FROM document_sections WHERE document_id IN ({placeholders}){bp_filter}",
        document_ids)
    return [dict(r) for r in rows]


async def get_chunks_for_sections(section_ids: list[str]) -> list[dict]:
    """Get chunks belonging to specific sections."""
    if not section_ids:
        return []
    db = await get_db()
    placeholders = ",".join("?" for _ in section_ids)
    rows = await db.execute_fetchall(
        f"SELECT * FROM document_chunks WHERE section_id IN ({placeholders})", section_ids)
    return [dict(r) for r in rows]


# ══════════════════════════════════════════════
# Decision Questions
# ══════════════════════════════════════════════

async def create_decision_question(
    analysis_id: str,
    category: str,
    question_text: str,
    answer_type: str,
    importance: str = "medium",
    decision_impact: str = "",
    choices_json: str | None = None,
    sort_order: int = 0,
) -> DecisionQuestion:
    db = await get_db()
    q_id = generate_id("dq")
    now = utc_now()
    await db.execute(
        "INSERT INTO decision_questions (id, analysis_id, category, question_text, answer_type, importance, decision_impact, choices_json, sort_order, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
        (q_id, analysis_id, category, question_text, answer_type, importance, decision_impact, choices_json, sort_order, now),
    )
    await db.commit()
    return DecisionQuestion(
        id=q_id, analysis_id=analysis_id,
        category=DecisionQuestionCategory(category),
        question_text=question_text,
        answer_type=AnswerType(answer_type),
        importance=importance,
        decision_impact=decision_impact,
        choices_json=choices_json,
        sort_order=sort_order,
        created_at=now,
    )


async def get_decision_questions(analysis_id: str) -> list[DecisionQuestion]:
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT * FROM decision_questions WHERE analysis_id = ? ORDER BY sort_order, created_at",
        (analysis_id,),
    )
    return [_row_to_decision_question(r) for r in rows]


async def delete_decision_question(question_id: str) -> bool:
    db = await get_db()
    cursor = await db.execute(
        "DELETE FROM decision_questions WHERE id = ?", (question_id,)
    )
    await db.commit()
    return cursor.rowcount > 0


async def update_decision_question_answer(question_id: str, answer_value: str) -> bool:
    db = await get_db()
    cursor = await db.execute(
        "UPDATE decision_questions SET answer_value = ? WHERE id = ?",
        (answer_value, question_id),
    )
    await db.commit()
    return cursor.rowcount > 0


async def get_decision_question(question_id: str) -> DecisionQuestion | None:
    db = await get_db()
    row = await db.execute_fetchall(
        "SELECT * FROM decision_questions WHERE id = ?", (question_id,),
    )
    if not row:
        return None
    return _row_to_decision_question(row[0])


def _row_to_decision_question(r) -> DecisionQuestion:
    return DecisionQuestion(
        id=r["id"],
        analysis_id=r["analysis_id"],
        category=DecisionQuestionCategory(r["category"]),
        question_text=r["question_text"],
        answer_type=AnswerType(r["answer_type"]),
        importance=r["importance"],
        decision_impact=r["decision_impact"] or "",
        choices_json=r["choices_json"],
        answer_value=r["answer_value"],
        sort_order=r["sort_order"],
        created_at=r["created_at"],
    )


# ══════════════════════════════════════════════
# Workspace Interactions
# ══════════════════════════════════════════════

async def save_interaction(
    analysis_id: str,
    interaction_type: str,
    user_input: str,
    ai_response: str,
    block_category: str | None = None,
    block_label: str | None = None,
) -> str:
    db = await get_db()
    interaction_id = generate_id("int")
    now = utc_now()
    await db.execute(
        "INSERT INTO workspace_interactions (id, analysis_id, interaction_type, user_input, ai_response, block_category, block_label, created_at) VALUES (?,?,?,?,?,?,?,?)",
        (interaction_id, analysis_id, interaction_type, user_input, ai_response, block_category, block_label, now),
    )
    await db.commit()
    return interaction_id


async def get_recent_interactions(analysis_id: str, limit: int = 10) -> list[dict]:
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT interaction_type, user_input, ai_response, block_category, block_label, created_at "
        "FROM workspace_interactions WHERE analysis_id = ? ORDER BY created_at DESC LIMIT ?",
        (analysis_id, limit),
    )
    return [dict(r) for r in rows]
