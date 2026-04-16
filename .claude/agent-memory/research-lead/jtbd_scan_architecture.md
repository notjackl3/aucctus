---
name: JTBD Scan Architecture
description: JTBD scan initiation flow, isScanning timing gap, WS events inventory, progress bar rendering conditions
type: project
last_modified: 2026-04-15
---

## Scan Initiation Flow

**REST trigger** (`POST /{config}/scan/`):
- Checks `has_active_scan()` (looks for PENDING/RUNNING scan rows)
- Enqueues `scan_jtbd_config_task.delay()` to Celery background queue
- Returns 202 with taskId
- Does NOT create a scan row or set any scanning flag

**Celery worker** (`scan_config()` in `jtbd_service.py`):
- Creates `JTBDScan(status=RUNNING, is_current=False)` inside `_create_scan()`
- This is the first moment `isScanning` becomes queryable as `true`

**Frontend** (`useTriggerJTBDScan` in `jtbd.hook.ts`):
- Calls REST, on success invalidates `configs()` and `config(uuid)` query keys
- No optimistic update of `isScanning`

## isScanning Derivation

**Backend:** `_is_scanning` is an `Exists()` subquery annotation on config queries, checking for any `JTBDScan` with `status__in=[PENDING, RUNNING]`.

**Frontend:** `const isScanning = !!activeConfig?.isScanning;` in `JTBDCanvasInner.tsx:70`. Comes from REST query data.

## Timing Gap (confirmed 2026-04-15)

Between REST 202 and Celery creating the scan row, the config query refetch returns `isScanning=false`. The progress bar won't render during this window. No "scan started" WS event exists to close the gap.

**Why:** Scan row creation was kept inside the Celery task for atomicity with the pipeline. The REST endpoint is intentionally lightweight.

**How to apply:** Fix options: (1) optimistic setQueryData in onSuccess, (2) create scan row in REST endpoint before .delay(), or (3) add a "scan started" WS event from _create_scan().

## WebSocket Events (as of 2026-04-15)

Only terminal events remain (no progress/subagent events):
- `jtbd.scan.completed.account` -- invalidates configs, config, currentScan, scans, activeScan
- `jtbd.scan.error.account` -- invalidates configs, config, scans, activeScan
- `jtbd.video.ready.account` -- invalidates currentScan
- `jtbd.rule_generation.completed.account` -- rule gen flow
- `jtbd.rule_generation.error.account` -- rule gen flow

## Progress Bar

- `AgentProgressBar` in `JTBDCanvasInner.tsx:381-405`, gated on `isScanning`
- Uses time-based fallback estimation (600s), no WS-driven progress stages
- `useJTBDActiveScan` fetches scan start time, also gated on `isScanning`

## is_current Flag

Scans are created with `is_current=False`. Only after all jobs are persisted does `_mark_scan_completed()` flip it to `True` inside `transaction.atomic()`. The `GET /{config}/current-scan/` endpoint filters by `is_current=True`, so during an active scan it returns the previous completed scan.

## Mid-scan Page Refresh

- `config.isScanning` (REST annotation) survives refresh -- correctly reports True once scan row exists
- Progress bar stage/percentage is lost (was in React useState)
- `useJTBDActiveScan` provides `scannedAt` for the progress bar's start time on refresh
