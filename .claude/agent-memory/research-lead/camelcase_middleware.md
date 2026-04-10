---
name: CamelCaseMiddleware value passthrough
description: The CamelCaseMiddleware at core/django/middleware/camel_case_middleware.py only transforms dict KEYS (snake_case to camelCase on response, camelCase to snake_case on request). String VALUES like enum choices are never modified -- they pass through as-is.
type: project
last_modified: 2026-04-06
---

CamelCaseMiddleware (core/django/middleware/camel_case_middleware.py) uses `inflection.camelize` on dict keys only. The `else: return data` branch returns all non-dict/non-list values unchanged.

**Why:** This matters because enum string values stored in the database (e.g., "metric_chart", "b2c") are passed through as response values without transformation. If a schema Literal expects "METRIC_CHART" but the DB stores "metric_chart", the middleware will NOT fix the casing -- only keys get transformed.

**How to apply:** When defining API response schemas with Literal types for enum fields, the Literal values MUST match the database storage format (the `.value` of Django TextChoices), not the Python enum member name. Or alternatively, the route builder must explicitly transform values.
