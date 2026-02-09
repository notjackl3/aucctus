# Codex Working Guide (Aucctus Frontend)

This file applies to `aucctus/**` and overrides root guidance where needed.

## Stack
- React + TypeScript
- npm-based toolchain

## Commands
- Install deps: `npm install`
- Dev server: `npm run dev`
- Type checks: `npm run type-check`
- Lint: `npm run lint`
- Build: `npm run build`

## Coding Conventions
- Keep API contracts aligned with backend types.
- Keep changes focused and avoid broad unrelated refactors.
- Prefer existing hooks/patterns in `libs/api` and query hooks when integrating new API calls.

## Done Criteria
- `npm run type-check` passes for touched code.
- `npm run lint` passes for touched code.

