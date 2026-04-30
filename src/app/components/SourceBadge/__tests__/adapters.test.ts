/**
 * Tests for the SourceBadge adapter layer.
 *
 * These adapters are the bridge between heterogeneous source shapes
 * across the app and the canonical `Citation` type. They're pure
 * functions, so the tests focus on shape conversion + the citation-kind
 * detection logic (web / document / internal / ai-reasoning / unknown).
 */

import { describe, it, expect } from 'vitest';
import {
  adaptISource,
  adaptNucleusAnswerSource,
  adaptFinancialProjectionSource,
  adaptJtbdItemSource,
  adaptSourcePillProps,
} from '../adapters';

const VALID_UUID = '11111111-2222-3333-4444-555555555555';
const NUCLEUS_URI = `aucctus://nucleus/sections/${VALID_UUID}`;

describe('adaptISource', () => {
  it('detects internal kind for aucctus:// URIs', () => {
    const c = adaptISource({
      uuid: 'a',
      title: 'Industry overview',
      url: NUCLEUS_URI,
    });
    expect(c.kind).toBe('internal');
    expect(c.url).toBe(NUCLEUS_URI);
  });

  it('detects document kind for nucleus file sources', () => {
    const c = adaptISource({
      uuid: 'a',
      title: 'Untitled.pdf',
      url: '',
      nucleusFileSource: { title: 'My Q3 Plan' },
    });
    expect(c.kind).toBe('document');
    expect(c.label).toBe('My Q3 Plan');
  });

  it('detects ai-reasoning from title heuristic when no url', () => {
    const c = adaptISource({ uuid: 'a', title: 'AI Reasoning', url: '' });
    expect(c.kind).toBe('ai-reasoning');
    expect(c.label).toBe('AI Reasoning');
  });

  it('detects ai-synthesis distinctly from ai-reasoning', () => {
    const c = adaptISource({ uuid: 'a', title: 'AI Synthesis', url: '' });
    expect(c.kind).toBe('ai-synthesis');
    expect(c.label).toBe('AI Synthesis');
  });

  it('falls back to web with the bare domain as label', () => {
    const c = adaptISource({
      uuid: 'a',
      title: 'Stripe Pricing 2024',
      url: 'https://www.stripe.com/pricing',
    });
    expect(c.kind).toBe('web');
    expect(c.label).toBe('stripe.com');
  });

  it('truncates long labels to 25 characters with ellipsis', () => {
    const c = adaptISource({
      uuid: 'a',
      title: 'A very very very very very long source title',
      url: '',
      nucleusFileSource: {
        title: 'A very very very very very long source title',
      },
    });
    expect(c.label.length).toBe(28); // 25 + '...'
    expect(c.label.endsWith('...')).toBe(true);
  });

  it('preserves classification, citations, description through to the Citation', () => {
    const c = adaptISource({
      uuid: 'a',
      title: 'Source X',
      url: 'https://example.com',
      classification: 'authoritative',
      citations: 'verbatim quote',
      description: 'a description',
    });
    expect(c.classification).toBe('authoritative');
    expect(c.citations).toBe('verbatim quote');
    expect(c.description).toBe('a description');
  });
});

describe('adaptNucleusAnswerSource', () => {
  it('uses nucleusFileSource.originalFilename for document filename metadata', () => {
    const c = adaptNucleusAnswerSource({
      uuid: 'a',
      title: 'fallback',
      order: 0,
      createdAt: '',
      updatedAt: '',
      nucleusFileSource: {
        uuid: 'f',
        type: 'pdf',
        title: 'Q3 Plan.pdf',
        originalFilename: 'Q3-Plan-final.pdf',
        createdAt: '',
        updatedAt: '',
      },
    });
    expect(c.kind).toBe('document');
    expect(c.fileType).toBe('pdf');
    expect(c.filename).toBe('Q3-Plan-final.pdf');
  });

  it('detects internal kind for aucctus:// URIs', () => {
    const c = adaptNucleusAnswerSource({
      uuid: 'a',
      title: 'Section X',
      url: NUCLEUS_URI,
      order: 0,
      createdAt: '',
      updatedAt: '',
    });
    expect(c.kind).toBe('internal');
  });
});

describe('adaptFinancialProjectionSource', () => {
  it('captures the reasoning field', () => {
    const c = adaptFinancialProjectionSource({
      uuid: 'a',
      title: 'AI Reasoning',
      reasoning: 'Because of X and Y',
      sourceType: 'ai_reasoning',
    });
    expect(c.kind).toBe('ai-reasoning');
    expect(c.reasoning).toBe('Because of X and Y');
  });

  it('detects internal kind from URI even when sourceType is wrong', () => {
    const c = adaptFinancialProjectionSource({
      uuid: 'a',
      title: 'Some section',
      url: NUCLEUS_URI,
      reasoning: '...',
      sourceType: 'web',
    });
    expect(c.kind).toBe('internal');
  });
});

describe('adaptJtbdItemSource', () => {
  it('uses sourceLabel as the label', () => {
    const c = adaptJtbdItemSource({
      sourceLabel: 'Forrester 2024',
      sourceUrl: 'https://forrester.com/x',
      sourceType: 'web',
      metricsContributed: 'TAM',
    });
    expect(c.kind).toBe('web');
    expect(c.label).toBe('Forrester 2024');
    expect(c.metricsContributed).toBe('TAM');
  });

  it('handles missing sourceLabel by falling back to domain', () => {
    const c = adaptJtbdItemSource({
      sourceLabel: '',
      sourceUrl: 'https://forrester.com/x',
      metricsContributed: '',
    });
    expect(c.label).toBe('forrester.com');
  });
});

describe('adaptSourcePillProps', () => {
  it('detects nucleus sourceType as internal kind', () => {
    const c = adaptSourcePillProps({
      source: 'Industry doc',
      url: NUCLEUS_URI,
      sourceType: 'nucleus',
    });
    expect(c.kind).toBe('internal');
    expect(c.url).toBe(NUCLEUS_URI);
  });

  it('detects user_document as document kind', () => {
    const c = adaptSourcePillProps({
      source: 'Internal upload',
      sourceType: 'user_document',
    });
    expect(c.kind).toBe('document');
  });

  it('passes snippet through to the Citation', () => {
    const c = adaptSourcePillProps({
      source: 'X',
      url: 'https://x.com',
      snippet: 'hovered',
    });
    expect(c.snippet).toBe('hovered');
  });
});
