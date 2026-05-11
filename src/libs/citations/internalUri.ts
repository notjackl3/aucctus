/**
 * Internal aucctus:// URI parsing and resolution.
 *
 * URI shape: `aucctus://<feature>/<subfeature>/<identifier>`
 *
 * Backend agents emit these into existing `source_url` columns when citing
 * in-app resources (Nucleus sections, Watchtower scans/signals/patterns,
 * Concept roots, etc). The frontend parses + resolves them to in-app
 * navigation. Anything that fails to parse or fails to resolve falls back
 * to the no-op contract — non-clickable display.
 *
 * `new URL()` is unreliable for non-special schemes across browsers — some
 * implementations stuff everything into `pathname`, others split it into
 * `hostname` + `pathname`. We avoid the cross-browser surface by parsing
 * with a regex.
 */

export const SCHEME = 'aucctus:';

const SCHEME_PREFIX = 'aucctus://';

// Matches `aucctus://<feature>/<subfeature>/<identifier>` where each
// segment is non-empty and identifier may contain additional path
// characters (we accept the rest of the URI as identifier verbatim).
const URI_REGEX = /^aucctus:\/\/([^/]+)\/([^/]+)\/(.+)$/;

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const IDENTIFIER_REGEX = /^[A-Z0-9]{1,10}$/;

export type InternalFeature = 'nucleus' | 'watchtower' | 'concept';

export interface ParsedInternalUri {
  feature: string;
  subfeature: string;
  identifier: string;
}

export interface ResolvedInternalRoute {
  /** Pathname to navigate to (e.g. '/nucleus', '/watchtower', '/concept/AC0001'). */
  path: string;
  /** Optional search-string including leading '?' (e.g. '?scan=<uuid>'). */
  search?: string;
  /** Optional in-page section id used to trigger the section-glow overlay. */
  sectionId?: string;
}

/**
 * Returns true when `s` looks like an aucctus:// URI. Non-string / nullish
 * values short-circuit to false.
 */
export function isInternalUri(s: string | null | undefined): boolean {
  if (typeof s !== 'string' || s.length === 0) return false;
  return s.startsWith(SCHEME_PREFIX);
}

/**
 * Parse an aucctus:// URI. Returns null on malformed input.
 *
 * Validation rules per (feature, subfeature):
 * - nucleus/sections, nucleus/documents → identifier must be a UUID
 * - watchtower/scans, watchtower/signals, watchtower/patterns → UUID
 * - concept/root → identifier must match [A-Z0-9]{1,10}
 *
 * Unknown (feature, subfeature) pairs still parse structurally — the
 * resolver's registry is the gate for "is this a known link target".
 */
export function parseInternalUri(s: string): ParsedInternalUri | null {
  if (!isInternalUri(s)) return null;
  const match = URI_REGEX.exec(s);
  if (!match) return null;
  const [, feature, subfeature, identifier] = match;
  if (!feature || !subfeature || !identifier) return null;

  const idValidator = ID_VALIDATORS[`${feature}/${subfeature}`];
  if (idValidator && !idValidator(identifier)) return null;

  return { feature, subfeature, identifier };
}

const ID_VALIDATORS: Record<string, (id: string) => boolean> = {
  'nucleus/sections': (id: string): boolean => UUID_REGEX.test(id),
  'nucleus/documents': (id: string): boolean => UUID_REGEX.test(id),
  'watchtower/scans': (id: string): boolean => UUID_REGEX.test(id),
  'watchtower/signals': (id: string): boolean => UUID_REGEX.test(id),
  'watchtower/patterns': (id: string): boolean => UUID_REGEX.test(id),
  'concept/root': (id: string): boolean => IDENTIFIER_REGEX.test(id),
};

/**
 * Resolve a parsed URI to an in-app route. Returns null when the
 * (feature, subfeature) pair is not in the v1 registry — callers fall
 * back to the no-op contract.
 *
 * v1 registry (Phase 1):
 * - nucleus/sections   → /nucleus?section=intelligence&nucleusSection=<uuid>
 *   (deliberately NOT ?section= — that param is reserved for the
 *   ContextSection literal {'overview'|'intelligence'|'data-uploads'|
 *   'personalization'} read by CompanyContextTab. A UUID there breaks
 *   the active-tab indicator.)
 * - nucleus/documents  → /nucleus?document=<uuid>
 * - watchtower/scans   → /watchtower?scan=<uuid>
 * - watchtower/signals → /watchtower?signal=<uuid>
 * - watchtower/patterns→ /watchtower?pattern=<uuid>
 * - concept/root       → /concept/<identifier>
 *
 * JTBD (jtbd/jobs, jtbd/scans) is intentionally out of scope for v1 —
 * lands in Phase 2.
 */
export function resolveInternalUri(
  parsed: ParsedInternalUri,
): ResolvedInternalRoute | null {
  const { feature, subfeature, identifier } = parsed;
  const key = `${feature}/${subfeature}`;
  const resolver = RESOLVERS[key];
  if (!resolver) return null;
  return resolver(identifier);
}

const RESOLVERS: Record<string, (identifier: string) => ResolvedInternalRoute> =
  {
    'nucleus/sections': (id: string): ResolvedInternalRoute => ({
      path: '/nucleus',
      search: `?section=intelligence&nucleusSection=${encodeURIComponent(id)}`,
      sectionId: id,
    }),
    'nucleus/documents': (id: string): ResolvedInternalRoute => ({
      path: '/nucleus',
      search: `?document=${encodeURIComponent(id)}`,
      sectionId: id,
    }),
    'watchtower/scans': (id: string): ResolvedInternalRoute => ({
      path: '/watchtower',
      search: `?scan=${encodeURIComponent(id)}`,
    }),
    'watchtower/signals': (id: string): ResolvedInternalRoute => ({
      path: '/watchtower',
      search: `?signal=${encodeURIComponent(id)}`,
    }),
    'watchtower/patterns': (id: string): ResolvedInternalRoute => ({
      path: '/watchtower',
      search: `?pattern=${encodeURIComponent(id)}`,
    }),
    'concept/root': (id: string): ResolvedInternalRoute => ({
      path: `/concept/${encodeURIComponent(id)}`,
    }),
  };
