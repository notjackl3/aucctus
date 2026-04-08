# Aucctus

A competitive landscape research platform that helps companies evaluate whether a market opportunity is worth pursuing. Provide a company profile and a target market — the system researches incumbents, emerging competitors, and market sizing, then synthesizes a Go / No-Go recommendation with evidence-backed reasoning.

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

# Create .env with your API keys
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

> **Mock mode:** If API keys are missing, the system falls back to realistic mock data so you can explore the full UI without incurring any API costs.

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Tailwind)                │
│  InputPage → AnalysisPage (polling) → WorkspacePage     │
└────────────────────────┬────────────────────────────────┘
                         │ /api
┌────────────────────────▼────────────────────────────────┐
│  FastAPI                                                 │
│  POST /analyses → Background Task → Operation polling    │
├──────────────────────────────────────────────────────────┤
│  Orchestrator                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Incumbents   │  │   Emerging   │  │   Market     │  │
│  │  Agent        │  │   Agent      │  │   Sizing     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │    (parallel)    │                  │          │
│         └──────────────────┴──────────────────┘          │
│                            │                             │
│                  ┌─────────▼─────────┐                   │
│                  │  Synthesis Agent   │                   │
│                  │  (Go / No-Go)     │                   │
│                  └───────────────────┘                   │
├──────────────────────────────────────────────────────────┤
│  Evidence Pipeline                                       │
│  Sources → Tiering → Claims → Dedup → Contradictions    │
├──────────────────────────────────────────────────────────┤
│  SQLite (WAL mode, FTS5, embeddings)                    │
└──────────────────────────────────────────────────────────┘
```

### Agent Architecture

Four agents, each with a well-scoped research domain:

| Agent | Purpose | Inputs | Outputs |
|-------|---------|--------|---------|
| **Incumbents** | Established players — who they are, market share, strengths/weaknesses | 3 Tavily searches | Structured player profiles, market concentration |
| **Emerging Competitors** | Seed-to-Series B funding activity, new entrants, capital velocity | 3 Tavily searches | Competitor profiles with funding details, trend analysis |
| **Market Sizing** | TAM/SAM/SOM, CAGR, growth drivers, constraints | 3 Tavily searches | Quantitative market estimates with timeframes |
| **Synthesis** | Cross-references all three research spaces | Agent outputs + strategy lens | Go/No-Go recommendation, score, strategic fit, conditions to pursue |

The orchestrator runs the three research agents **in parallel**, then feeds their combined output into synthesis. Each agent follows the same pattern: search → process sources → extract claims → LLM structured analysis → generate insights.

### Evidence Pipeline

Every finding traces back to sources:

1. **Search** — Tavily web search with in-memory caching (24h TTL) and credit tracking
2. **Source processing** — URL dedup, publisher inference, tier assignment (tier 1/2/3 by publisher quality)
3. **Claim extraction** — LLM extracts structured claims (market size, funding, competitive, trend, etc.)
4. **Dedup** — Deterministic rules: exact match, Jaccard similarity > 0.80, same-entity numeric overlap
5. **Contradiction detection** — Deterministic rules before any LLM reasoning: numeric divergence (ratio > 1.25), directional conflicts (growth vs decline), funding discrepancies
6. **Confidence scoring** — Weighted by source tier, corroboration count, and coverage breadth

### Strategy Lens

Company profiles are stored as first-class entities. When a company has enough context, the system builds a **Strategy Lens** — a structured representation of:

- Strategic priorities (with importance and evidence)
- Product adjacencies
- Target customers (segments, pain points, buying criteria, anti-patterns)
- GTM strengths
- Constraints (hard/soft with sources)
- Geographic focus
- Risk posture (aggressive/moderate/conservative)
- Fit and misfit signals

The synthesis agent uses the lens to evaluate strategic fit, right to win, and conditions for pursuit. The exploration agent uses it to contextualize follow-up research.

### Data Flow

```
User submits company + market
        │
        ▼
POST /api/analyses → creates Analysis + Operation
        │
        ▼ (background task)
Orchestrator runs pipeline:
  1. Three research agents in parallel (Tavily → Sources → Claims → LLM analysis)
  2. Synthesis agent (cross-references all findings + strategy lens)
  3. Evidence merge (dedup claims, detect contradictions)
  4. Workspace creation (seeds 16 initial insights)
  5. Operation marked complete
        │
        ▼
Frontend polls GET /api/operations/{id} every 1.5s
        │
        ▼
On completion → navigates to Workspace
  - Browse research categories
  - Pin key findings
  - Ask follow-up questions (conditional Tavily, capped at 3 insights per question)
  - Compile a report
```

## Key Design Decisions

**Deterministic rules before LLM reasoning.** Claim deduplication, contradiction nomination, and confidence scoring all use rule-based logic. LLMs are reserved for extraction and synthesis where judgment is needed. This makes the evidence pipeline testable and predictable.

**One shared pipeline, posture-adapted synthesis.** The research agents are identical regardless of company type. Only the synthesis layer adapts — via an `evaluation_posture` parameter that adjusts prompt framing for established companies vs. new ventures. This avoids pipeline duplication while allowing strategic nuance.

**Tavily budget control.** Each agent makes exactly 3 searches at basic depth (1 credit each). Results are cached in-memory with a 24-hour TTL. Exploration searches are conditional — Tavily is only called when local retrieval returns fewer than 5 results. A full analysis uses ~12 Tavily credits.

**Local-first retrieval.** No external vector database. Embeddings are cached in SQLite, similarity computed via numpy. FTS5 handles keyword matching. This keeps the stack simple and the system runnable on a single machine with no infrastructure dependencies.

**Operation polling over WebSockets.** All long-running flows (analysis, exploration, report compilation) create an Operation record. The frontend polls a single endpoint. This is simpler to implement, debug, and reason about than WebSocket state management, and the 1.5-second polling interval is imperceptible to users.

**Company profile as a reusable entity.** Company context is defined once and reused across assessments. The main analysis input is opportunity-centric: pick a market, optionally add a framing question, and the system resolves company context automatically. This avoids re-entering the same information for each run.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, Pydantic v2 |
| Database | SQLite (WAL mode, FTS5 for full-text search) |
| LLM | OpenAI GPT-4o (structured extraction), GPT-4o-mini (lightweight tasks) |
| Search | Tavily (web search API) |
| Embeddings | OpenAI text-embedding-3-small (1536 dims), stored in SQLite |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Icons | Lucide React |

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Centralized configuration
│   ├── agents/              # Research agents (incumbents, emerging, market_sizing, synthesis)
│   ├── api/
│   │   ├── routes/          # REST endpoints
│   │   └── schemas.py       # Pydantic request/response models (camelCase serialization)
│   ├── domain/              # Data models and enums
│   ├── evidence/            # Source processing, claim extraction, contradiction detection
│   ├── services/            # LLM and search wrappers
│   ├── workflows/           # Orchestrator (analysis pipeline)
│   ├── persistence/         # SQLite database + repository layer
│   ├── retrieval/           # Hybrid FTS5 + embedding search
│   ├── exploration/         # Follow-up question agent
│   ├── strategy/            # Strategy lens builder + critic
│   ├── reports/             # Report compiler
│   └── mock/               # Mock data fallback
└── tests/

frontend/
├── src/
│   ├── pages/               # InputPage, AnalysisPage, WorkspacePage, HistoryPage, SettingsPage
│   ├── components/          # ScoreGauge, ConfidenceBadge, RecommendationBadge, SourceCard, etc.
│   ├── api/client.ts        # Typed API client
│   └── types/analysis.ts    # TypeScript type contracts
└── vite.config.ts           # Dev server + API proxy
```

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/analyses` | Create analysis, starts background research |
| GET | `/api/analyses` | List all analyses with summaries |
| GET | `/api/analyses/{id}` | Full analysis result |
| GET | `/api/operations/{id}` | Poll operation progress |
| POST | `/api/companies` | Create company profile |
| GET | `/api/companies` | List companies |
| PUT | `/api/companies/{id}/context` | Update company context |
| POST | `/api/companies/{id}/strategy` | Build strategy lens |
| GET | `/api/workspaces/{id}` | Get workspace |
| POST | `/api/workspaces/{id}/questions` | Ask exploration question |
| POST | `/api/reports` | Compile report from workspace |
| POST | `/api/documents` | Upload company document |

## Running Tests

```bash
cd backend
python3 -m pytest tests/ -v
```

Tests cover deterministic evidence rules (claim dedup, contradiction detection), operation status transitions, and API endpoint contracts.
