---
name: JTBD Scan Architecture
description: JTBD scan lifecycle, is_current flag, mid-scan refresh gap, WebSocket-only progress state
type: project
last_modified: 2026-04-09
---

JTBD scans use an explicit `is_current` boolean flag (not latest-by-timestamp) to determine which scan is displayed. The flag is flipped atomically in `_mark_scan_completed()` inside a `transaction.atomic()`.

**Why:** Scans are created with `is_current=False` while running. Only after all jobs are persisted does the flag flip. This prevents showing incomplete data.

**How to apply:**
- Backend `GET /{config}/current-scan/` filters by `is_current=True` with full prefetch chain.
- Backend `GET /{config}/scans/` returns light `JTBDScanSchema[]` (no jobs) ordered by `-scanned_at`.
- Frontend `useJTBDScans` hook exists but is unused -- ready for scan switcher.
- **Gap**: No endpoint to fetch `IJTBDScanDetail` for a historical scan by UUID. Need `GET /{config}/scans/{scan_uuid}/` with the same prefetch chain as `get_current_scan`.
- WebSocket `jtbd.scan.completed.account` invalidates both `currentScan` and `scans` query keys.
- `IJTBDScan` shape: uuid, status, isCurrent, jobsDiscovered, scannedAt, completedAt.

**Mid-scan refresh bug (identified 2026-04-09):**
- `get_current_scan()` filters `is_current=True` -- returns the PREVIOUS completed scan during an active scan (new scan has `is_current=False`).
- `config.isScanning` (REST annotation via Exists subquery on PENDING/RUNNING scans) DOES survive refresh and correctly reports True.
- WebSocket progress state (stage, progress %, message) lives only in React `useState` via `useJTBDScanSocketEvents` -- completely lost on page refresh.
- The `list_scans` endpoint returns all scans with `status` field, so the frontend COULD find the RUNNING scan from the list, but currently does not.
- Fix requires: (1) a REST endpoint or query that returns the active scan's progress/stage from the DB, or (2) persisting progress stage to the scan model and exposing it via API, or (3) having the frontend derive a "scanning in progress" skeleton from `config.isScanning=true` even without granular progress.
