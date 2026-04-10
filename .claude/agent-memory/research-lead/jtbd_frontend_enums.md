---
name: JTBD frontend enum usage
description: Frontend TypeScript types and components for JTBD all expect UPPERCASE enum values. Record lookups in widgets (StatListWidget, SocialPostWidget, WidgetRenderer) are keyed by UPPERCASE strings.
type: project
last_modified: 2026-04-06
---

Frontend types (libs/api/types/jtbd.d.ts) define all enum types as UPPERCASE unions (e.g., JTBDWidgetType = 'METRIC_CHART' | ...).

Components that do Record lookups:
- WidgetRenderer.tsx: switch on widget.widgetType comparing against 'METRIC_CHART', etc.
- StatListWidget.tsx: trendConfig Record keyed by 'UP'/'DOWN'/'STABLE'
- SocialPostWidget.tsx: platformStyles Record keyed by 'REDDIT'/'X'/etc.
- JTBDCard.tsx: tierColors Record keyed by 'HIGH'/'MEDIUM'/'LOW', segmentColors keyed by 'B2C'/'B2B'
- JTBDFilterBar.tsx: matchesAudience compares segment === filter (both expected UPPERCASE)

**Why:** If the API returns lowercase values (e.g., "metric_chart" instead of "METRIC_CHART"), all these lookups will fail silently -- returning undefined from Records and falling through switch defaults.

**How to apply:** Ensure the backend API returns UPPERCASE enum values, or add frontend normalization (`.toUpperCase()`) at the API client or hook layer.
