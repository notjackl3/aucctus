/**
 * useCitationResolver — resolve a `source_url` value to a click contract.
 *
 * The hook collapses the "is this an internal aucctus:// URI, an external
 * http(s) URL, or no link at all?" decision into a single discriminated
 * union the badges can spread onto an <a> / <button>. Visual treatment
 * stays in the badges; behavior lives here.
 *
 * Contract:
 * - `null` / `undefined` / empty string → `kind: 'noop'` (non-clickable)
 * - `aucctus://...` that parses + resolves → `kind: 'internal'` with an
 *   `onClick` that navigates in-app and (when applicable) sets the
 *   Overseer section-glow highlight to scroll-into-view + flash the target.
 * - `aucctus://...` that fails to parse or has unknown (feature, subfeature)
 *   → `kind: 'noop'`. This is the "no-op contract" for unresolvable URIs.
 * - http(s) URL → `kind: 'external'` with `target='_blank'` + safe rel.
 * - anything else → `kind: 'noop'`.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  resolveCitationShape,
  type CitationShape,
} from '@libs/citations/citationShape';
import useStore from '@stores/store';

export type { CitationShape } from '@libs/citations/citationShape';
export { resolveCitationShape } from '@libs/citations/citationShape';

export type ResolvedCitation =
  | {
      kind: 'external';
      href: string;
      target: '_blank';
      rel: 'noopener noreferrer';
    }
  | {
      kind: 'internal';
      /** Synthetic href (path + search) — for hover preview only. */
      href: string;
      onClick: (event?: { preventDefault?: () => void }) => void;
    }
  | { kind: 'noop' };

const NOOP: ResolvedCitation = { kind: 'noop' };

export function useCitationResolver(
  sourceUrl: string | null | undefined,
): ResolvedCitation {
  const navigate = useNavigate();
  const setHighlightedSection = useStore(
    (state) => state.overseer.setHighlightedSection,
  );

  // Resolve the structural shape once per `sourceUrl` change. The `onClick`
  // closure is rebuilt only when the resolved target or navigation hooks
  // change, so badge re-renders don't churn handler identity.
  const resolved = useMemo<CitationShape>(
    () => resolveCitationShape(sourceUrl),
    [sourceUrl],
  );

  const internalSectionId =
    resolved.kind === 'internal' ? resolved.sectionId : undefined;
  const internalHref = resolved.kind === 'internal' ? resolved.href : undefined;

  const handleInternalClick = useCallback(
    (event?: { preventDefault?: () => void }) => {
      if (!internalHref) return;
      event?.preventDefault?.();
      navigate(internalHref);
      // Trigger the existing section-glow overlay if the resolver
      // surfaced a section id. The overlay handles scroll-into-view +
      // glow + auto-clear.
      if (internalSectionId) {
        setHighlightedSection(internalSectionId);
      }
    },
    [internalHref, internalSectionId, navigate, setHighlightedSection],
  );

  if (resolved.kind === 'external') {
    return {
      kind: 'external',
      href: resolved.href,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }
  if (resolved.kind === 'internal' && internalHref) {
    return {
      kind: 'internal',
      href: internalHref,
      onClick: handleInternalClick,
    };
  }
  return NOOP;
}
