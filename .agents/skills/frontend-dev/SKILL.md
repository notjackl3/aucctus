---
name: frontend-dev
description: Implement and validate frontend-only changes in the Aucctus app.
---

# frontend-dev

## Use when
- Working only in `aucctus/**`.

## Workflow
1. Read `aucctus/AGENTS.md` and relevant feature files.
2. Implement focused frontend changes.
3. Validate:
   - `cd aucctus && npm run type-check`
   - `cd aucctus && npm run lint`
4. Summarize changed files and verification output.
