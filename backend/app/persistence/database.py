"""SQLite database setup and schema initialization."""

import aiosqlite

from app.config import DATABASE_PATH, DATA_DIR

_db: aiosqlite.Connection | None = None

SCHEMA_SQL = """
-- ── Analyses ──
CREATE TABLE IF NOT EXISTS analyses (
    id              TEXT PRIMARY KEY,
    company_name    TEXT NOT NULL,
    market_space    TEXT NOT NULL,
    company_context TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    result_json     TEXT,
    created_at      TEXT NOT NULL,
    completed_at    TEXT
);

CREATE TABLE IF NOT EXISTS analysis_steps (
    id              TEXT PRIMARY KEY,
    analysis_id     TEXT NOT NULL REFERENCES analyses(id),
    step            TEXT NOT NULL,
    label           TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending',
    started_at      TEXT,
    completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_analysis_steps_analysis ON analysis_steps(analysis_id);

-- ── Operations ──
CREATE TABLE IF NOT EXISTS operations (
    id              TEXT PRIMARY KEY,
    operation_type  TEXT NOT NULL,
    parent_id       TEXT,
    status          TEXT NOT NULL DEFAULT 'pending',
    current_step    TEXT,
    steps_completed INTEGER NOT NULL DEFAULT 0,
    steps_total     INTEGER NOT NULL DEFAULT 1,
    partial_data    TEXT,
    error_message   TEXT,
    created_at      TEXT NOT NULL,
    completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_operations_parent ON operations(parent_id, operation_type);

-- ── Evidence: Sources ──
CREATE TABLE IF NOT EXISTS sources (
    id              TEXT PRIMARY KEY,
    analysis_id     TEXT NOT NULL,
    url             TEXT NOT NULL,
    title           TEXT NOT NULL,
    publisher       TEXT NOT NULL,
    tier            TEXT NOT NULL DEFAULT 'unknown',
    snippet         TEXT,
    published_date  TEXT,
    raw_content     TEXT,
    relevance_score REAL DEFAULT 0.0,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sources_analysis ON sources(analysis_id);

-- ── Evidence: Claims ──
CREATE TABLE IF NOT EXISTS claims (
    id               TEXT PRIMARY KEY,
    analysis_id      TEXT NOT NULL,
    statement        TEXT NOT NULL,
    claim_type       TEXT NOT NULL DEFAULT 'general',
    entities_json    TEXT DEFAULT '[]',
    source_ids_json  TEXT DEFAULT '[]',
    confidence_score REAL DEFAULT 50.0,
    source_count     INTEGER DEFAULT 1,
    created_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_claims_analysis ON claims(analysis_id);

-- ── Evidence: Contradictions ──
CREATE TABLE IF NOT EXISTS contradictions (
    id              TEXT PRIMARY KEY,
    analysis_id     TEXT NOT NULL,
    claim_ids_json  TEXT NOT NULL DEFAULT '[]',
    description     TEXT NOT NULL,
    resolution      TEXT,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contradictions_analysis ON contradictions(analysis_id);

-- ── Companies ──
CREATE TABLE IF NOT EXISTS companies (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    context         TEXT,
    created_at      TEXT NOT NULL,
    updated_at      TEXT
);

-- ── Strategy Lens ──
CREATE TABLE IF NOT EXISTS strategy_lenses (
    id              TEXT PRIMARY KEY,
    company_id      TEXT NOT NULL REFERENCES companies(id),
    version         INTEGER NOT NULL DEFAULT 1,
    lens_json       TEXT NOT NULL,
    confidence_note TEXT,
    built_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_strategy_company ON strategy_lenses(company_id);

-- ── Workspaces ──
CREATE TABLE IF NOT EXISTS workspaces (
    id              TEXT PRIMARY KEY,
    analysis_id     TEXT NOT NULL,
    company_id      TEXT,
    company_name    TEXT NOT NULL,
    market_space    TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'active',
    created_at      TEXT NOT NULL,
    updated_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_workspaces_analysis ON workspaces(analysis_id);

-- ── Insights ──
CREATE TABLE IF NOT EXISTS insights (
    id                      TEXT PRIMARY KEY,
    workspace_id            TEXT NOT NULL REFERENCES workspaces(id),
    question_id             TEXT,
    source_step             TEXT NOT NULL,
    display_status          TEXT NOT NULL DEFAULT 'visible',
    title                   TEXT NOT NULL,
    body                    TEXT NOT NULL,
    claim_ids_json          TEXT DEFAULT '[]',
    source_ids_json         TEXT DEFAULT '[]',
    confidence_score        REAL DEFAULT 50.0,
    confidence_level        TEXT DEFAULT 'medium',
    confidence_reasoning    TEXT DEFAULT '',
    tags_json               TEXT DEFAULT '[]',
    contradiction_note      TEXT,
    contradiction_group_id  TEXT,
    related_insight_ids_json TEXT DEFAULT '[]',
    created_at              TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_insights_workspace ON insights(workspace_id);

-- ── Workspace Questions ──
CREATE TABLE IF NOT EXISTS workspace_questions (
    id                          TEXT PRIMARY KEY,
    workspace_id                TEXT NOT NULL REFERENCES workspaces(id),
    parent_question_id          TEXT,
    question_text               TEXT NOT NULL,
    status                      TEXT NOT NULL DEFAULT 'pending',
    answer_text                 TEXT,
    answer_confidence_score     REAL,
    answer_confidence_level     TEXT,
    answer_confidence_reasoning TEXT,
    strategy_lens_applied       INTEGER DEFAULT 0,
    contradictions_found        INTEGER DEFAULT 0,
    depth                       INTEGER DEFAULT 0,
    created_at                  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_questions_workspace ON workspace_questions(workspace_id);

-- ── Follow-up Questions ──
CREATE TABLE IF NOT EXISTS follow_up_questions (
    id                  TEXT PRIMARY KEY,
    parent_question_id  TEXT NOT NULL,
    question_text       TEXT NOT NULL,
    reason              TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_followups_parent ON follow_up_questions(parent_question_id);

-- ── Reports ──
CREATE TABLE IF NOT EXISTS reports (
    id                  TEXT PRIMARY KEY,
    workspace_id        TEXT NOT NULL,
    analysis_id         TEXT NOT NULL,
    report_style        TEXT NOT NULL DEFAULT 'executive_brief',
    executive_summary   TEXT,
    sections_json       TEXT,
    rtb_json            TEXT DEFAULT '[]',
    rtc_json            TEXT DEFAULT '[]',
    open_questions_json TEXT DEFAULT '[]',
    insight_count       INTEGER DEFAULT 0,
    source_count        INTEGER DEFAULT 0,
    compiled_at         TEXT,
    created_at          TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_workspace ON reports(workspace_id);

-- ── Documents ──
CREATE TABLE IF NOT EXISTS documents (
    id              TEXT PRIMARY KEY,
    company_id      TEXT NOT NULL,
    filename        TEXT NOT NULL,
    content_type    TEXT NOT NULL,
    raw_text        TEXT,
    summary         TEXT,
    chunk_count     INTEGER DEFAULT 0,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);

-- ── Document Chunks ──
CREATE TABLE IF NOT EXISTS document_chunks (
    id              TEXT PRIMARY KEY,
    document_id     TEXT NOT NULL REFERENCES documents(id),
    chunk_index     INTEGER NOT NULL,
    text            TEXT NOT NULL,
    embedding_json  TEXT,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id);

-- ── Embedding Cache ──
CREATE TABLE IF NOT EXISTS embeddings (
    id              TEXT PRIMARY KEY,
    source_type     TEXT NOT NULL,
    source_id       TEXT NOT NULL,
    text            TEXT NOT NULL,
    embedding_json  TEXT NOT NULL,
    created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_embeddings_source ON embeddings(source_type, source_id);

-- ── FTS5 for retrieval ──
CREATE VIRTUAL TABLE IF NOT EXISTS fts_content USING fts5(
    source_id, source_type, text, tokenize='porter'
);
"""


async def get_db() -> aiosqlite.Connection:
    """Return the shared database connection, creating it if needed."""
    global _db
    if _db is None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        _db = await aiosqlite.connect(str(DATABASE_PATH))
        _db.row_factory = aiosqlite.Row
        await _db.execute("PRAGMA journal_mode=WAL")
        await _db.execute("PRAGMA foreign_keys=ON")
    return _db


async def init_db() -> None:
    """Create tables if they don't exist."""
    db = await get_db()
    await db.executescript(SCHEMA_SQL)
    await db.commit()


async def close_db() -> None:
    """Close the database connection."""
    global _db
    if _db is not None:
        await _db.close()
        _db = None
