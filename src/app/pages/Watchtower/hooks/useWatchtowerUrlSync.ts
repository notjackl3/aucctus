/**
 * useWatchtowerUrlSync — read & write Watchtower deep-link query params.
 *
 * Watchtower has historically held selection state purely in
 * `WatchtowerViewContext` (in-memory, no URL). Internal aucctus://
 * citations need stable deep-links, so this hook layers `?scan=`,
 * `?signal=`, and `?pattern=` on top.
 *
 * Behavior:
 * - On mount (and on URL change): if the URL has `?scan=<uuid>` and the
 *   context's `selectedScanUuid` differs, push it into the context. This
 *   makes a navigate-to-/watchtower?scan=<uuid> click land with the
 *   right scan selected.
 * - Symmetric setters write the URL and let `?scan=` propagate naturally
 *   into context via the read effect.
 * - `signalUuid` and `patternUuid` are read-only state for now — there
 *   is no existing context slot for them; callers downstream will pick
 *   them up off `searchParams` directly when their UI lands. Phase 1
 *   plumbs the params so the deep-link arrives on the right page.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWatchtowerView } from '../WatchtowerViewContext';

export interface WatchtowerUrlSync {
  scanUuid: string | null;
  signalUuid: string | null;
  patternUuid: string | null;
  setScan: (uuid: string | null) => void;
  setSignal: (uuid: string | null) => void;
  setPattern: (uuid: string | null) => void;
}

export function useWatchtowerUrlSync(): WatchtowerUrlSync {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedScanUuid, setSelectedScanUuid } = useWatchtowerView();

  const scanUuid = useMemo(() => searchParams.get('scan'), [searchParams]);
  const signalUuid = useMemo(() => searchParams.get('signal'), [searchParams]);
  const patternUuid = useMemo(
    () => searchParams.get('pattern'),
    [searchParams],
  );

  // URL → context: when an aucctus://watchtower/scans/<uuid> citation
  // lands the user on /watchtower?scan=<uuid>, push that selection into
  // the in-memory context so the existing selectors pick it up.
  useEffect(() => {
    if (scanUuid && scanUuid !== selectedScanUuid) {
      setSelectedScanUuid(scanUuid);
    }
  }, [scanUuid, selectedScanUuid, setSelectedScanUuid]);

  const setScan = useCallback(
    (uuid: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (uuid) {
        next.set('scan', uuid);
      } else {
        next.delete('scan');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setSignal = useCallback(
    (uuid: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (uuid) {
        next.set('signal', uuid);
      } else {
        next.delete('signal');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setPattern = useCallback(
    (uuid: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (uuid) {
        next.set('pattern', uuid);
      } else {
        next.delete('pattern');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return {
    scanUuid,
    signalUuid,
    patternUuid,
    setScan,
    setSignal,
    setPattern,
  };
}
