/**
 * Contract test — the frontend handler registry must cover every edit-kind
 * the backend may emit from the JTBD edit agent. If the backend adds a new
 * kind, this test fails until the frontend registers a handler for it.
 *
 * Source of truth: the Literal kind strings in the backend
 * `projects/server/server/apps/chat/ai/agents/jtbd_edit_agent/types.py`.
 * Keep this list in sync with that module.
 */

import { describe, expect, it } from 'vitest';

import { EDIT_KIND_HANDLERS } from './editKindHandlers';

const BACKEND_EMITTED_EDIT_KINDS = [
  'concept',
  'jtbd_rule',
  'jtbd_scan',
  'jtbd_note_add',
  'jtbd_job_edit',
  'jtbd_job_merge',
  'jtbd_ideate',
  'jtbd_scan_delete',
  'jtbd_config_edit',
  'jtbd_config_clone',
  'jtbd_config_delete',
  'jtbd_config_personas',
  'jtbd_note_update',
  'jtbd_note_delete',
  'jtbd_job_delete',
] as const;

describe('EDIT_KIND_HANDLERS contract', () => {
  it('registers a handler for every backend-emitted edit kind', () => {
    const frontendKinds = new Set(Object.keys(EDIT_KIND_HANDLERS));
    const missing = BACKEND_EMITTED_EDIT_KINDS.filter(
      (kind) => !frontendKinds.has(kind),
    );
    expect(
      missing,
      `Missing frontend handlers for kinds: ${missing.join(', ')}`,
    ).toEqual([]);
  });

  it('binds every handler to a callable function', () => {
    for (const [kind, handler] of Object.entries(EDIT_KIND_HANDLERS)) {
      expect(typeof handler, `handler for kind=${kind}`).toBe('function');
    }
  });
});
