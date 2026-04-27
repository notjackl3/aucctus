---
name: JTBD Scan/Edit Mutex Protocol
description: Cross-store mutual-exclusion protocol between JTBD scans (DB row) and Ask Aucctus edits (Redis lock + counter), with fail-closed Redis semantics
type: project
last_modified: 2026-04-26
---

# JTBD Scan/Edit Mutex Protocol

For a given `JTBDConfig`, EITHER scans exist OR edits exist on it — never both. Concurrent operations corrupt job/widget rows because scans rebuild state that edits are mid-flight modifying.

## Three primitives in two stores

- **`JTBDScan` row** with `select_for_update` — Postgres scan-side mutex. Status enum: `PENDING`/`RUNNING`/`COMPLETED`/`FAILED`.
- **`cache.add(lock_key, NX)`** — per-job Redis mutex (key `jtbd_job_edit:{uuid}`).
- **`editing_count` (counter) + `editing_set` (set)** — per-config Redis "any edit in flight?" gate. Helpers in `apps/jtbd/services/edit_tracking.py`.

## Ordering invariant

Each side MUTATES its own primitive BEFORE checking the OTHER side's primitive. Otherwise both sides race past each other's gates.

### `trigger_scan` (scan side)

1. `service.has_active_scan(config_uuid)` cheap pre-check.
2. `service.create_pending_scan(config_uuid)` — INSERT a `JTBDScan` row in `PENDING` state inside `transaction.atomic() + select_for_update()`. This is the durable serialization point — committed before the edit-side gate is read.
3. `has_active_edits(config_uuid)` (Redis read).
4. If `True`: `service.delete_pending_scan(pending_scan)` rollback, return 409 `edits_in_progress`.
5. Else: `scan_jtbd_config_task.delay(..., scan_uuid=str(pending_scan.uuid))`. Worker promotes PENDING → RUNNING via `_create_scan(existing_scan_uuid=...)`.

### `edit_job` / `merge_jobs` (edit side)

Pattern lives in route helper `_acquire_single_job_edit_mutex` (single) and inline in `merge_jobs` (multi):

1. `cache.add(lock_key, ...)` — acquire per-job Redis lock NX.
2. `begin_edit(config_uuid, job_uuid)` — bump per-config counter so a concurrent `trigger_scan` observes us via `has_active_edits` BEFORE it inserts its PENDING row.
3. `service.has_active_scan(config_uuid)` last. If True (scan won the race), `end_edit` + `cache.delete(lock_key)` rollback, return 409 `scan_in_progress`.

For merge, `_begin_merge_edit_tracking` registers ALL participants and rolls back partial registrations if `EditTrackingUnavailable` raises mid-loop.

## Fail-closed Redis semantics

`apps/jtbd/services/edit_tracking.py` exports `EditTrackingUnavailable(RuntimeError)`.

- `begin_edit` and `has_active_edits` RAISE on Redis failure.
- `end_edit` and `list_active_edit_jobs` SWALLOW (cleanup/UX paths must not mask underlying task errors).

Routes that call the raising helpers MUST translate `EditTrackingUnavailable` into `503 SERVICE_UNAVAILABLE` with `code="edit_tracking_unavailable"`.

## Lock-key canonicalization

Every site that builds a JTBD edit lock key MUST go through `_jtbd_edit_lock_key(str(parsed_uuid))` after parsing the URL UUID via `_parse_uuid`. Keys built from the raw URL string can collide on casing/padding. Merge participant UUIDs from JSON body must also be canonicalized via `[str(UUID(u)) for u in payload.secondary_job_uuids]`.

## `delete_job` mutex

Use `cache.add(lock_key, ...)` (NX), NOT `cache.get(lock_key) is not None` (READ-only). The latter has a TOCTOU window between read and delete. Wrap the delete in `try/finally` and `cache.delete(lock_key)` in `finally`.

## Tests

- `tests/apps/jtbd/test_edit_tracking.py` — Redis-failure semantics, `_FakeRedis` / `_BrokenRedis` doubles.
- `tests/apps/jtbd/test_scan_edit_mutex.py` — cross-side route-level tests. Patch `django.core.cache.cache` (NOT `apps.jtbd.routes.v1.scan.cache`, which doesn't exist as a module attribute since the route imports `cache` locally).

Run with `--import-mode=importlib` to dodge the pre-existing `tests/apps/jtbd/__init__.py` ↔ `server/apps/jtbd/__init__.py` collision.
