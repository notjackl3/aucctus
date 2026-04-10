---
name: JTBD Widget Source Attribution Audit
description: Source attribution across all 7 JTBD widget item types -- unified sources JSONField pattern on all non-social types, ItemSources/SourcePill rendering
type: project
last_modified: 2026-04-10
---

Source field audit across 7 JTBD widget item types (updated 2026-04-10):

**Unified `sources` JSONField** (list of `{source_label, source_url, metrics_contributed}` objects):
MetricChartItem, TrendChartItem, CardListItem, StatListItem, SurveyItem, SparklineStatItem -- all 6 non-social types now have this pattern.

**Direct source fields (not the JSONField pattern):** SocialPostItem has `source_url` + `source_label` directly on the model (not a list), plus `engagement_label`, `subreddit_or_channel`.

**Why:** All widget items now carry source attribution. The evidence extraction agent receives JTBDJobSource data as prompt text and generates widget items with inline source fields. There is NO FK link between JTBDJobSource and widget items -- attribution is text-based.

**How to apply:** The 4-layer sync pattern still applies for any changes: Django model, Pydantic agent output type, API schema, TypeScript type. The frontend renders sources via `ItemSources` component (dedupes by URL) -> `SourcePill` (clickable if URL present) with `ComponentTooltip` showing `metricsContributed`.

Key files:
- Django models: projects/server/server/apps/jtbd/models/jtbd_custom_widget.py
- Agent output types: projects/server/server/apps/jtbd/ai/agents/evidence_extraction/types.py
- API schemas: projects/server/server/apps/jtbd/schemas/custom_widget.py
- TypeScript types: aucctus/src/libs/api/types/jtbd.d.ts
- ItemSources component: aucctus/src/app/pages/JTBD/widgets/ItemSources.tsx
- SourcePill component: aucctus/src/app/pages/JTBD/widgets/SourcePill.tsx
- Service persistence: projects/server/server/apps/jtbd/services/jtbd_service.py (_create_widgets method)
