"""Repository layer — CRUD for all domain entities.

Organized by domain: analyses, steps, operations, sources, claims,
companies, strategy, workspaces, insights, questions, reports, documents.
"""

import json

from app.domain.enums import (
    AnalysisStatus, ClaimType, DisplayStatus, OperationStatus,
    QuestionStatus, SourceTier,
)
from app.domain.models import (
    Analysis, AnalysisStep, Claim, Company, ContradictionGroup,
    Document, DocumentChunk, FollowUpQuestion, InsightNode, Operation,
    Report, Source, Workspace, WorkspaceQuestion,
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
        "INSERT OR IGNORE INTO sources (id, analysis_id, url, title, publisher, tier, snippet, published_date, raw_content, relevance_score, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        (source.id, source.analysis_id, source.url, source.title, source.publisher,
         source.tier.value, source.snippet, source.published_date, source.raw_content,
         source.relevance_score, source.created_at),
    )
    await db.commit()


async def get_sources_for_analysis(analysis_id: str) -> list[Source]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM sources WHERE analysis_id = ? ORDER BY relevance_score DESC", (analysis_id,))
    return [Source(id=r["id"], analysis_id=r["analysis_id"], url=r["url"], title=r["title"],
                   publisher=r["publisher"], tier=SourceTier(r["tier"]), snippet=r["snippet"],
                   published_date=r["published_date"], raw_content=r["raw_content"],
                   relevance_score=r["relevance_score"], created_at=r["created_at"]) for r in rows]


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


async def get_documents_for_company(company_id: str) -> list[Document]:
    db = await get_db()
    rows = await db.execute_fetchall("SELECT * FROM documents WHERE company_id = ? ORDER BY created_at DESC", (company_id,))
    return [Document(id=r["id"], company_id=r["company_id"], filename=r["filename"],
                     content_type=r["content_type"], raw_text=r["raw_text"],
                     summary=r["summary"], chunk_count=r["chunk_count"],
                     created_at=r["created_at"]) for r in rows]


async def create_document_chunk(document_id: str, chunk_index: int, text: str,
                                embedding: list[float] | None = None) -> str:
    db = await get_db()
    chunk_id = generate_id("chk")
    embedding_json = json.dumps(embedding) if embedding else None
    await db.execute("INSERT INTO document_chunks (id, document_id, chunk_index, text, embedding_json, created_at) VALUES (?,?,?,?,?,?)",
                     (chunk_id, document_id, chunk_index, text, embedding_json, utc_now()))
    await db.commit()
    return chunk_id


# ═══════════════════════════════════════════════════════════════
# Embeddings Cache
# ═══════════════════════════════════════════════════════════════

async def save_embedding(source_type: str, source_id: str, text: str, embedding: list[float]) -> None:
    db = await get_db()
    emb_id = generate_id("emb")
    await db.execute("INSERT OR REPLACE INTO embeddings (id, source_type, source_id, text, embedding_json, created_at) VALUES (?,?,?,?,?,?)",
                     (emb_id, source_type, source_id, text, json.dumps(embedding), utc_now()))
    await db.commit()


async def get_all_embeddings(source_type: str | None = None) -> list[dict]:
    db = await get_db()
    if source_type:
        rows = await db.execute_fetchall("SELECT * FROM embeddings WHERE source_type = ?", (source_type,))
    else:
        rows = await db.execute_fetchall("SELECT * FROM embeddings")
    return [{"id": r["id"], "source_type": r["source_type"], "source_id": r["source_id"],
             "text": r["text"], "embedding": json.loads(r["embedding_json"])} for r in rows]


# ═══════════════════════════════════════════════════════════════
# FTS
# ═══════════════════════════════════════════════════════════════

async def index_for_fts(source_id: str, source_type: str, text: str) -> None:
    db = await get_db()
    await db.execute("INSERT INTO fts_content (source_id, source_type, text) VALUES (?,?,?)",
                     (source_id, source_type, text))
    await db.commit()


async def search_fts(query: str, limit: int = 20) -> list[dict]:
    db = await get_db()
    rows = await db.execute_fetchall(
        "SELECT source_id, source_type, text, rank FROM fts_content WHERE fts_content MATCH ? ORDER BY rank LIMIT ?",
        (query, limit))
    return [{"source_id": r["source_id"], "source_type": r["source_type"],
             "text": r["text"], "rank": r["rank"]} for r in rows]
