# Aucctus

An interactive competitive landscape research workspace. Provide a company profile and a target market — the system researches incumbents, emerging competitors, and market sizing, then synthesizes a Go/No-Go recommendation with evidence-backed reasoning and a 0–100 confidence score.

> For a full technical breakdown, see [ARCHITECTURE_WALKTHROUGH.md](./ARCHITECTURE_WALKTHROUGH.md).

---

## What it does

The system answers one question:

> **"Should this company pursue this opportunity — and under what conditions?"**

It is built for established companies evaluating market opportunities, not startup idea validation.

**Workflow:**
1. Set up a company profile (name, context, optional internal documents)
2. Pick a market space and optional framing question
3. Four AI agents research in parallel — incumbents, emerging competitors, market sizing, synthesis
4. Interactive workspace: browse findings, pin insights, ask follow-up questions, answer decision questions
5. AI re-synthesizes the recommendation based on your answers
6. Compile a report

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Tavily API key](https://app.tavily.com/)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cat > .env << 'EOF'
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
EOF

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` requests to the backend at port 8000.

> **Mock mode:** If API keys are not set, the system falls back to realistic mock data so you can explore the full UI without incurring API costs.

---

## Running Tests

```bash
cd backend
python3 -m pytest tests/ -v
```

Tests cover: claim deduplication rules, contradiction detection, confidence scoring, operation status transitions, decision question generation, ask-about-selection grounding, and API endpoint contracts.

---

## Architecture

### System overview

```
Frontend (React + TypeScript + Tailwind)
  InputPage → AnalysisPage (polling) → WorkspacePage → HistoryPage
       │
       │  /api (HTTP/JSON, Vite proxy)
       ▼
FastAPI + Pydantic v2
  POST /analyses → BackgroundTask → Operation polling
       │
       ▼
Orchestrator (app/workflows/orchestrator.py)
  1. Query planning (LLM-assisted)
  2. Centralized retrieval (one provider pass, partitioned by dimension)
  3. Three research agents in parallel:
     ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
     │ Incumbents  │  │  Emerging   │  │Market Sizing │
     └─────────────┘  └─────────────┘  └──────────────┘
  4. Synthesis agent (consumes agent outputs + strategy lens)
  5. Evidence persistence + workspace seeding (16 insights)
  6. Decision question generation
       │
       ▼
SQLite (WAL mode, FTS5, embeddings table)
  16 tables: analyses, operations, sources, claims, contradictions,
  companies, strategy_lenses, workspaces, insights, questions,
  reports, documents, document_chunks, embeddings, workspace_interactions
```

### Agent architecture

| Agent | Purpose | Output |
|-------|---------|--------|
| **Incumbents** | Established players — profiles, strengths/weaknesses, market concentration | Structured player list |
| **Emerging Competitors** | Startup activity — funding stages, investors, differentiators | Competitor list with funding data |
| **Market Sizing** | TAM/SAM/SOM, CAGR, growth drivers, constraints | Quantified market estimates |
| **Synthesis** | Cross-references all research + company strategy lens | Go/No-Go score, conditions, risks, right to win |

All three research agents run in parallel. Synthesis runs after they complete. Each agent receives pre-fetched, pre-processed evidence from the centralized retrieval service — agents never make provider calls directly.

### Evidence pipeline

```
Provider results (Tavily, GDELT, SEC EDGAR, USPTO)
  → Source tiering (tier 1/2/3 by publisher quality)
  → Claim extraction (GPT-4o structured output)
  → Deterministic dedup (Jaccard > 0.80, entity match)
  → Deterministic contradiction detection (numeric divergence, directional conflicts)
  → Confidence scoring (tier × corroboration × coverage)
  → Partitioned by research dimension → agents
```

### Strategy lens

Company profiles are stored as first-class entities. When a company has enough context, the system builds a **Strategy Lens** — a structured JSON representation of strategic priorities, product adjacencies, ICP, GTM strengths, constraints, geographic focus, risk posture, and fit/misfit signals.

The synthesis agent uses the lens to evaluate strategic fit, right to win, and conditions for market entry.

### Retrieval

| Layer | Technology |
|-------|-----------|
| Web search | Tavily (~12 credits per analysis, 24h in-memory cache) |
| News events | GDELT (conditional) |
| SEC filings | SEC EDGAR (conditional) |
| Patent landscape | USPTO (conditional) |
| Local keyword search | SQLite FTS5 |
| Local semantic search | numpy cosine similarity over cached 1536-dim embeddings |

Exploration searches are conditional — Tavily is only called when local retrieval returns fewer than 5 results.

### Workspace

After analysis completes, the user lands in a workspace with:
- **16 seeded insights** (4 per agent), filterable by category
- **Insight management** — pin, archive, or collapse findings
- **Exploration questions** — ask follow-up questions with grounded retrieval
- **Decision questions** — structured inputs that refine the recommendation
- **Ask-about-selection** — highlight any text and ask a grounded question
- **User memory** — prior answers and interactions are injected into future prompts
- **Report compilation** — generate an executive brief from workspace findings

---

## Major Subsystems

| Subsystem | Location |
|-----------|---------|
| Orchestrator / pipeline | `backend/app/workflows/orchestrator.py` |
| Retrieval service | `backend/app/retrieval/retrieval_service.py` |
| Query planner | `backend/app/retrieval/query_planner.py` |
| Evidence pipeline | `backend/app/evidence/` |
| Research agents | `backend/app/agents/` |
| Strategy lens | `backend/app/strategy/engine.py` |
| Exploration agent | `backend/app/exploration/agent.py` |
| Decision questions | `backend/app/workflows/decision_questions.py` |
| Ask-about-selection | `backend/app/workflows/ask_selection.py` |
| User memory | `backend/app/workflows/user_memory.py` |
| Document ingestion | `backend/app/ingestion/document_processor.py` |
| Report compiler | `backend/app/reports/compiler.py` |
| Database schema | `backend/app/persistence/database.py` |
| Repository layer | `backend/app/persistence/repositories.py` |
| LLM wrapper | `backend/app/services/llm.py` |
| Search wrapper | `backend/app/services/search.py` |
| API routes | `backend/app/api/routes/` |
| Frontend pages | `frontend/src/pages/` |
| Typed API client | `frontend/src/api/client.ts` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, FastAPI, Pydantic v2 |
| Database | SQLite (WAL mode, FTS5 for full-text search) |
| LLM — structured | OpenAI GPT-4o |
| LLM — fast | OpenAI GPT-4o-mini |
| Embeddings | OpenAI text-embedding-3-small (1536 dims) |
| Web search | Tavily |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Icons | Lucide React |

---

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyses` | Create analysis, start background research |
| GET | `/api/analyses` | List all analyses |
| GET | `/api/analyses/{id}` | Full analysis result |
| GET | `/api/operations/{id}` | Poll operation progress |
| POST | `/api/companies` | Create company profile |
| GET | `/api/companies` | List companies |
| PUT | `/api/companies/{id}/context` | Update company context |
| POST | `/api/companies/{id}/strategy` | Build strategy lens |
| GET | `/api/workspaces/{id}` | Get workspace |
| GET | `/api/workspaces/{id}/insights` | List insights |
| PATCH | `/api/workspaces/{id}/insights/{insightId}` | Update insight display status |
| POST | `/api/workspaces/{id}/questions` | Ask exploration question |
| GET | `/api/analyses/{id}/decision-questions` | Get decision questions |
| PATCH | `/api/analyses/{id}/decision-questions/{questionId}` | Answer a decision question |
| POST | `/api/analyses/{id}/apply-answers` | Re-synthesize with answered questions |
| POST | `/api/analyses/{id}/ask` | Ask about selected text |
| POST | `/api/reports` | Compile report |
| POST | `/api/documents` | Upload company document |

---

## Key Design Decisions

**Deterministic rules before LLM reasoning.** Claim dedup, contradiction nomination, and confidence scoring use rule-based logic. LLMs are only used for judgment tasks.

**Centralized retrieval.** One provider pass per analysis. Evidence is partitioned to agents — agents never call providers directly. This reduces API spend and enables cross-dimension deduplication.

**SQLite over a vector database.** No infrastructure dependencies. Embeddings cached in SQLite, similarity computed via numpy. Simple and self-contained for local use.

**Operation polling over WebSockets.** All async flows create an Operation record. Frontend polls at 1.5s intervals. Simpler to implement and debug than WebSocket state management.

**Company profile as a reusable entity.** Company context is defined once and reused across analyses. The input is opportunity-centric — pick a market, the system resolves company context automatically.

**One pipeline, posture-adapted synthesis.** Research agents are shared. Only the synthesis prompt framing adapts to `evaluation_posture` (established_company, adjacency_expansion, new_market_entry, new_venture).

---

## Build Progress

- Phase 1 — App skeleton + mock endpoints (complete)
- Phase 2 — Services + evidence pipeline (complete)
- Phase 3 — Research agents + orchestration (complete)
- Phase 4 — Strategy lens + synthesis (complete)
- Phase 5 — Workspace + exploration (complete)
- Phase 6 — Reports + documents (complete)
- Phase 7 — Hardening + tests (in progress)
