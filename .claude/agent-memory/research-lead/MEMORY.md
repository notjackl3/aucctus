# Research Lead Memory Index

## Architecture (Backend)
- [jtbd_enum_pipeline.md](jtbd_enum_pipeline.md) - JTBD enum/choice field data pipeline: where values are defined, transformed, and mismatched across layers (2026-04-06)
- [jtbd_scan_architecture.md](jtbd_scan_architecture.md) - JTBD scan lifecycle: is_current flag, mid-scan refresh gap, WebSocket-only progress state (2026-04-09)
- [architecture_jtbd_widgets.md](architecture_jtbd_widgets.md) - Source URL/name field audit across all 7 JTBD widget item types: which have source fields, which are missing, and the 4-layer update pattern (2026-04-06)
- [architecture_jtbd_agent_tooling.md](architecture_jtbd_agent_tooling.md) - JTBD agent tool inventory: which agents have which tools, source URL lifecycle from Perplexity through sub-agents to evidence extraction, builder tool methods (2026-04-06)

## Architecture (Frontend)
- [jtbd_frontend_enums.md](jtbd_frontend_enums.md) - JTBD frontend enum usage patterns: TypeScript types expect UPPERCASE, widgets/cards use Record lookups keyed by UPPERCASE (2026-04-06)
- [jtbd_card_expansion_architecture.md](jtbd_card_expansion_architecture.md) - JTBD card expansion pattern: layoutId shared between collapsed/expanded, missing AnimatePresence, float animation conflicts (2026-04-06)

## Patterns & Conventions
- [camelcase_middleware.md](camelcase_middleware.md) - CamelCaseMiddleware only transforms dict KEYS, never values. Enum string values pass through untouched. (2026-04-06)
