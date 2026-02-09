---
name: osiris-aucctus-porting
description: Port and align behavior between the Osiris backend and Aucctus frontend.
---

# osiris-aucctus-porting

## Use when
- Porting or aligning feature behavior between backend (`osiris`) and frontend (`aucctus`).

## Workflow
1. Identify backend contract and frontend usage points.
2. Update API client/types/hooks first, then UI consumption.
3. Validate both sides:
   - `projects/server`: lint + type checks
   - `aucctus`: type-check + lint
4. Document any compatibility or rollout constraints.
