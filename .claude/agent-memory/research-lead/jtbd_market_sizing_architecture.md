---
name: JTBD Market Sizing Architecture
description: TAM/SAM/SOM data flow end-to-end: job-level fields (not widget), no source attribution, MarketSizeVisualization with two visual modes, report field never rendered in frontend
type: project
last_modified: 2026-04-10
---

Market sizing is a **job-level** concern, not a widget. Four fields on `JTBDJob`:
- `tam_value` DecimalField(15,2) nullable -- Total Addressable Market in USD
- `sam_value` DecimalField(15,2) nullable -- Serviceable Addressable Market in USD
- `som_value` DecimalField(15,2) nullable -- Serviceable Obtainable Market in USD
- `market_size_label` CharField(50) nullable -- human-readable label e.g. "$2.5B"

**Data source:** Job Discovery Orchestrator agent. Prompt mandates one sub-agent dispatch MUST be a "Size of Prize" agent focused on TAM/SAM/SOM research. No source attribution is stored on the market sizing fields -- traceability exists only in the `report` markdown (inline citations) and general `JTBDJobSource` list.

**Pipeline:** Agent float -> `_safe_decimal()` -> Django Decimal -> `_decimal_to_float()` -> JSON float -> TypeScript `number | null`.

**Frontend rendering:**
- Collapsed card: `marketSizeLabel` as plain text pill (JTBDCard.tsx:511)
- Expanded card: `marketSizeLabel` in badges row + "Opportunity Size" CollapsibleSection with:
  - `MarketSizeVisualization` (jtbd-utils.tsx:113): two modes based on `marketType`:
    - `existing`: nested rectangles (hardcoded proportions, NOT data-proportional)
    - `new`: horizontal stacked bars
  - Summary column: TAM/SAM/SOM values via `formatMarketValue()` ($B/$M/$K formatter)

**Gaps:**
- No source attribution on market sizing numbers
- `report` field (500-1000 word markdown with inline source citations) is sent via API but NEVER rendered in frontend -- this is the richest attribution for market sizing
- MarketSizeVisualization proportions are decorative (hardcoded %) not computed from actual values

Key files:
- Model: projects/server/server/apps/jtbd/models/jtbd_job.py:110-137
- Agent types: projects/server/server/apps/jtbd/ai/agents/job_discovery/types.py:72-76
- Agent prompt: projects/server/server/apps/jtbd/ai/agents/job_discovery/prompts.py:148-157, 205
- Service: projects/server/server/apps/jtbd/services/jtbd_service.py:729-732
- Route serialization: projects/server/server/apps/jtbd/routes/v1/scan.py:215-218
- Schema: projects/server/server/apps/jtbd/schemas/scan.py:33-36
- TS type: aucctus/src/libs/api/types/jtbd.d.ts:233-237
- Frontend card: aucctus/src/app/pages/JTBD/JTBDCard.tsx:362-428
- Frontend visualization: aucctus/src/app/pages/JTBD/jtbd-utils.tsx:113-209
