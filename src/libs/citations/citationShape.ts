/**
 * Pure-shape resolution of a `source_url` string into one of three
 * dispatch shapes:
 *
 * - `external` — http(s) URL, opens in a new tab
 * - `internal` — parses + resolves as `aucctus://...` to an in-app route
 *   (with optional `sectionId` to drive the section-glow overlay)
 * - `noop` — null, empty, malformed, or unknown
 *
 * Lives outside `useCitationResolver` so it can be exercised in tests
 * without dragging the React store / router graph in.
 */

import {
  isInternalUri,
  parseInternalUri,
  resolveInternalUri,
} from './internalUri';

export type CitationShape =
  | { kind: 'external'; href: string }
  | { kind: 'internal'; href: string; sectionId?: string }
  | { kind: 'noop' };

function isExternalUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://');
}

export function resolveCitationShape(
  sourceUrl: string | null | undefined,
): CitationShape {
  if (typeof sourceUrl !== 'string' || sourceUrl.length === 0) {
    return { kind: 'noop' };
  }

  if (isInternalUri(sourceUrl)) {
    const parsed = parseInternalUri(sourceUrl);
    if (!parsed) return { kind: 'noop' };
    const route = resolveInternalUri(parsed);
    if (!route) return { kind: 'noop' };
    return {
      kind: 'internal',
      href: `${route.path}${route.search ?? ''}`,
      sectionId: route.sectionId,
    };
  }

  if (isExternalUrl(sourceUrl)) {
    return { kind: 'external', href: sourceUrl };
  }

  return { kind: 'noop' };
}
