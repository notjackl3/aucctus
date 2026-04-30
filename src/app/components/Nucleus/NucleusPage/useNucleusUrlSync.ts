/**
 * useNucleusUrlSync — read & write Nucleus deep-link query params.
 *
 * Existing params (`?tab=`, `?section=`) are owned by `NucleusPage` and
 * `CompanyContextTab` directly; this hook does not duplicate that state.
 * It exposes:
 *
 * - `documentUuid` — the value of `?document=<uuid>`, used by internal
 *   `aucctus://nucleus/documents/<uuid>` deep-links. Phase 1 plumbs the
 *   param through (NucleusPage navigates to /nucleus when the URI is
 *   resolved, the deep-link target lands on the page); the document
 *   tile-highlight UI is intentionally out of scope for v1 — see the
 *   Implementation Report.
 * - `nucleusSectionUuid` — the value of `?nucleusSection=<uuid>`, used
 *   by `aucctus://nucleus/sections/<uuid>` deep-links. Note this is
 *   deliberately NOT `?section=` — that param is reserved for the
 *   `ContextSection` literal read by CompanyContextTab. Phase 1 plumbs
 *   the param through; section glow is the Phase 1.5 follow-up.
 * - `setDocument(uuid | null)` / `setNucleusSection(uuid | null)` —
 *   write/clear the params.
 *
 * The hook is intentionally narrow: it does not touch `tab` or
 * `section` so it can co-exist with the existing search-params handlers
 * in NucleusPage and CompanyContextTab without fighting over state.
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface NucleusUrlSync {
  documentUuid: string | null;
  nucleusSectionUuid: string | null;
  setDocument: (uuid: string | null) => void;
  setNucleusSection: (uuid: string | null) => void;
}

export function useNucleusUrlSync(): NucleusUrlSync {
  const [searchParams, setSearchParams] = useSearchParams();

  const documentUuid = useMemo(
    () => searchParams.get('document'),
    [searchParams],
  );

  const nucleusSectionUuid = useMemo(
    () => searchParams.get('nucleusSection'),
    [searchParams],
  );

  const setDocument = useCallback(
    (uuid: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (uuid) {
        next.set('document', uuid);
      } else {
        next.delete('document');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setNucleusSection = useCallback(
    (uuid: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (uuid) {
        next.set('nucleusSection', uuid);
      } else {
        next.delete('nucleusSection');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return { documentUuid, nucleusSectionUuid, setDocument, setNucleusSection };
}
