import { describe, it, expect } from 'vitest';
import {
  isInternalUri,
  parseInternalUri,
  resolveInternalUri,
  SCHEME,
} from '../internalUri';

const VALID_UUID = '11111111-2222-3333-4444-555555555555';
const VALID_UUID_2 = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

describe('SCHEME constant', () => {
  it('matches the URL parser convention (trailing colon)', () => {
    expect(SCHEME).toBe('aucctus:');
  });
});

describe('isInternalUri', () => {
  it('returns true for aucctus:// URIs', () => {
    expect(isInternalUri(`aucctus://nucleus/sections/${VALID_UUID}`)).toBe(
      true,
    );
    expect(isInternalUri(`aucctus://concept/root/AC0001`)).toBe(true);
  });

  it('returns false for http/https URLs', () => {
    expect(isInternalUri('https://example.com')).toBe(false);
    expect(isInternalUri('http://example.com')).toBe(false);
  });

  it('returns false for null / undefined / empty string', () => {
    expect(isInternalUri(null)).toBe(false);
    expect(isInternalUri(undefined)).toBe(false);
    expect(isInternalUri('')).toBe(false);
  });

  it('returns false for non-aucctus schemes that contain "aucctus" elsewhere', () => {
    expect(isInternalUri('https://aucctus.com/foo')).toBe(false);
  });
});

describe('parseInternalUri', () => {
  it('parses every v1 (feature, subfeature) pair', () => {
    const cases = [
      {
        uri: `aucctus://nucleus/sections/${VALID_UUID}`,
        expected: {
          feature: 'nucleus',
          subfeature: 'sections',
          identifier: VALID_UUID,
        },
      },
      {
        uri: `aucctus://nucleus/documents/${VALID_UUID}`,
        expected: {
          feature: 'nucleus',
          subfeature: 'documents',
          identifier: VALID_UUID,
        },
      },
      {
        uri: `aucctus://watchtower/scans/${VALID_UUID_2}`,
        expected: {
          feature: 'watchtower',
          subfeature: 'scans',
          identifier: VALID_UUID_2,
        },
      },
      {
        uri: `aucctus://watchtower/signals/${VALID_UUID}`,
        expected: {
          feature: 'watchtower',
          subfeature: 'signals',
          identifier: VALID_UUID,
        },
      },
      {
        uri: `aucctus://watchtower/patterns/${VALID_UUID}`,
        expected: {
          feature: 'watchtower',
          subfeature: 'patterns',
          identifier: VALID_UUID,
        },
      },
      {
        uri: 'aucctus://concept/root/AC0001',
        expected: {
          feature: 'concept',
          subfeature: 'root',
          identifier: 'AC0001',
        },
      },
    ];
    for (const { uri, expected } of cases) {
      expect(parseInternalUri(uri)).toEqual(expected);
    }
  });

  it('returns null for the wrong scheme', () => {
    expect(parseInternalUri('https://nucleus/sections/abc')).toBeNull();
    expect(parseInternalUri('foo://bar/baz/qux')).toBeNull();
  });

  it('returns null when path components are missing', () => {
    expect(parseInternalUri('aucctus://nucleus')).toBeNull();
    expect(parseInternalUri('aucctus://nucleus/sections')).toBeNull();
    expect(parseInternalUri('aucctus://nucleus/sections/')).toBeNull();
    expect(parseInternalUri('aucctus:///sections/abc')).toBeNull();
  });

  it('returns null for a malformed UUID on UUID-keyed pairs', () => {
    expect(
      parseInternalUri('aucctus://nucleus/sections/not-a-uuid'),
    ).toBeNull();
    expect(parseInternalUri('aucctus://watchtower/scans/12345')).toBeNull();
  });

  it('returns null for a malformed concept identifier', () => {
    expect(parseInternalUri('aucctus://concept/root/ac0001')).toBeNull(); // lowercase
    expect(
      parseInternalUri('aucctus://concept/root/VERY-LONG-IDENT'),
    ).toBeNull(); // dashes / too long
    expect(parseInternalUri('aucctus://concept/root/AC00012345X')).toBeNull(); // 11 chars
  });

  it('parses unknown (feature, subfeature) pairs structurally', () => {
    // These don't have validators, so they parse as long as the shape is right.
    // The registry gate is in resolveInternalUri.
    expect(parseInternalUri('aucctus://jtbd/jobs/anything')).toEqual({
      feature: 'jtbd',
      subfeature: 'jobs',
      identifier: 'anything',
    });
  });
});

describe('resolveInternalUri', () => {
  it('resolves nucleus/sections to /nucleus with section param + sectionId', () => {
    const resolved = resolveInternalUri({
      feature: 'nucleus',
      subfeature: 'sections',
      identifier: VALID_UUID,
    });
    expect(resolved).toEqual({
      path: '/nucleus',
      search: `?tab=company-context&nucleusSection=${VALID_UUID}`,
      sectionId: VALID_UUID,
    });
  });

  it('resolves nucleus/documents to /nucleus with document param', () => {
    const resolved = resolveInternalUri({
      feature: 'nucleus',
      subfeature: 'documents',
      identifier: VALID_UUID,
    });
    expect(resolved?.path).toBe('/nucleus');
    expect(resolved?.search).toBe(`?document=${VALID_UUID}`);
  });

  it('resolves all watchtower subfeatures', () => {
    expect(
      resolveInternalUri({
        feature: 'watchtower',
        subfeature: 'scans',
        identifier: VALID_UUID,
      }),
    ).toEqual({ path: '/watchtower', search: `?scan=${VALID_UUID}` });

    expect(
      resolveInternalUri({
        feature: 'watchtower',
        subfeature: 'signals',
        identifier: VALID_UUID,
      }),
    ).toEqual({ path: '/watchtower', search: `?signal=${VALID_UUID}` });

    expect(
      resolveInternalUri({
        feature: 'watchtower',
        subfeature: 'patterns',
        identifier: VALID_UUID,
      }),
    ).toEqual({ path: '/watchtower', search: `?pattern=${VALID_UUID}` });
  });

  it('resolves concept/root to /concept/<identifier>', () => {
    expect(
      resolveInternalUri({
        feature: 'concept',
        subfeature: 'root',
        identifier: 'AC0001',
      }),
    ).toEqual({ path: '/concept/AC0001' });
  });

  it('returns null for unknown (feature, subfeature)', () => {
    expect(
      resolveInternalUri({
        feature: 'jtbd',
        subfeature: 'jobs',
        identifier: VALID_UUID,
      }),
    ).toBeNull();
    expect(
      resolveInternalUri({
        feature: 'unknown',
        subfeature: 'thing',
        identifier: 'x',
      }),
    ).toBeNull();
  });
});
