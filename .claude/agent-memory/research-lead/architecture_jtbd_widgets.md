---
name: jtbd_widget_source_field_audit
description: Source URL/name field availability across all 7 JTBD widget item types -- which layers have source fields and which are missing
type: project
---

Source field audit across 7 JTBD widget item types (2026-04-06):

**Full source support (name + URL):** SurveyItem only
**Name only, no URL:** CardListItem (source_label), StatListItem (source_attribution)
**URL only (post link):** SocialPostItem (url field is the post URL, not a research source URL)
**No source fields at all:** MetricChartItem, TrendChartItem, SparklineStatItem

**Why:** The evidence extraction agent receives JTBDJobSource data as prompt text and generates widget items with inline source fields. There is NO FK link between JTBDJobSource and widget items.

**How to apply:** When adding source URLs to widget items, all 4 layers must be updated in sync: Django model, Pydantic agent output type, API schema, and TypeScript type. The SourcePill frontend component already supports both clickable (with URL) and plain (name only) modes -- no component changes needed to adopt new URL fields.

Key files:
- Django models: projects/server/server/apps/jtbd/models/jtbd_custom_widget.py
- Agent output types: projects/server/server/apps/jtbd/ai/agents/evidence_extraction/types.py
- API schemas: projects/server/server/apps/jtbd/schemas/custom_widget.py
- TypeScript types: aucctus/src/libs/api/types/jtbd.d.ts
- SourcePill component: aucctus/src/app/pages/JTBD/widgets/SourcePill.tsx
- Service persistence: projects/server/server/apps/jtbd/services/jtbd_service.py (lines ~778-863)
