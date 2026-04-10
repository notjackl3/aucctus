---
name: JTBD enum pipeline mapping
description: Complete mapping of JTBD enum values through all layers (Django enums -> agent types -> service persistence -> response schemas -> route builders -> frontend types). Identifies critical case mismatches.
type: project
last_modified: 2026-04-06
---

JTBD enums are defined in apps/jtbd/enums.py as Django TextChoices with **lowercase** stored values (e.g., "metric_chart", "b2c", "up").

Agent output types (evidence_extraction/types.py) use **lowercase** Literals matching the enums.

The service (jtbd_service.py) normalizes agent output with `.lower()` for segment/market_type/source_type and validates against sets of lowercase enum values. Widget/chart/trend/platform values are validated without case normalization.

Response schemas (custom_widget.py) declare **UPPERCASE** Literals (e.g., "METRIC_CHART", "UP", "REDDIT").

Route builders (scan.py) pass raw model attribute values directly into schemas with NO case transformation.

**Why:** This creates a mismatch: DB stores lowercase, schemas expect uppercase. The CamelCaseMiddleware does not transform values. The frontend TypeScript types expect UPPERCASE.

**How to apply:** Either (a) the route builders must `.upper()` values before passing to schemas, (b) the schemas must use lowercase Literals, or (c) the frontend must handle both cases.
