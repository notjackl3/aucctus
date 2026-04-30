/**
 * Tests for `useCitationResolver`.
 *
 * The full hook is React-coupled (useNavigate, useStore) so we test the
 * routing logic via the pure `resolveCitationShape` helper — that helper
 * encapsulates 100% of the dispatch decisions (external vs internal vs
 * noop). The hook itself is a thin wrapper that wires the shape into a
 * navigate-bound onClick + the section-glow store action.
 */

import { describe, it, expect } from 'vitest';
import { resolveCitationShape } from '@libs/citations/citationShape';

const VALID_UUID = '11111111-2222-3333-4444-555555555555';

describe('resolveCitationShape', () => {
  it('returns noop for null / undefined / empty', () => {
    expect(resolveCitationShape(null)).toEqual({ kind: 'noop' });
    expect(resolveCitationShape(undefined)).toEqual({ kind: 'noop' });
    expect(resolveCitationShape('')).toEqual({ kind: 'noop' });
  });

  it('returns external for http(s) URLs', () => {
    expect(resolveCitationShape('https://example.com/foo')).toEqual({
      kind: 'external',
      href: 'https://example.com/foo',
    });
    expect(resolveCitationShape('http://localhost:5173/x')).toEqual({
      kind: 'external',
      href: 'http://localhost:5173/x',
    });
  });

  it('returns internal for parsable + resolvable aucctus:// URIs', () => {
    expect(
      resolveCitationShape(`aucctus://watchtower/scans/${VALID_UUID}`),
    ).toEqual({
      kind: 'internal',
      href: `/watchtower?scan=${VALID_UUID}`,
    });

    expect(
      resolveCitationShape(`aucctus://nucleus/sections/${VALID_UUID}`),
    ).toEqual({
      kind: 'internal',
      href: `/nucleus?tab=company-context&nucleusSection=${VALID_UUID}`,
      sectionId: VALID_UUID,
    });

    expect(resolveCitationShape('aucctus://concept/root/AC0001')).toEqual({
      kind: 'internal',
      href: '/concept/AC0001',
    });
  });

  it('returns noop for malformed aucctus:// URIs', () => {
    expect(resolveCitationShape('aucctus://nucleus')).toEqual({ kind: 'noop' });
    expect(
      resolveCitationShape('aucctus://nucleus/sections/not-a-uuid'),
    ).toEqual({
      kind: 'noop',
    });
    expect(resolveCitationShape('aucctus://concept/root/lowercase')).toEqual({
      kind: 'noop',
    });
  });

  it('returns noop for parsable-but-unknown (feature, subfeature)', () => {
    // jtbd is intentionally out of scope for v1
    expect(resolveCitationShape(`aucctus://jtbd/jobs/${VALID_UUID}`)).toEqual({
      kind: 'noop',
    });
  });

  it('returns noop for unknown schemes / non-URL strings', () => {
    expect(resolveCitationShape('mailto:foo@bar.com')).toEqual({
      kind: 'noop',
    });
    expect(resolveCitationShape('not a url at all')).toEqual({ kind: 'noop' });
  });
});
