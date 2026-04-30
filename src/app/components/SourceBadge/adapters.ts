/**
 * Adapters convert domain-specific source shapes into canonical `Citation`s.
 *
 * Each adapter is a pure function — easy to test, easy to compose, easy
 * to extend. New source shape → new adapter; the badge component itself
 * never branches on the input shape.
 */

import { isInternalUri } from '@libs/citations/internalUri';
import type { ISource } from '@libs/api/types';
import type { IBaseFinancialProjectionSourceV2 } from '@libs/api/types';
import type { IJTBDItemSource } from '@libs/api/types/jtbd';
import type { NucleusAnswerSource } from '@libs/api/types/nucleus';

import type { Citation, CitationKind } from './types';

const truncate = (s: string, max = 25): string =>
  s.length > max ? `${s.slice(0, max)}...` : s;

/**
 * Inlined to avoid pulling `@libs/api` into the test bundle (transitive
 * abort-controller resolution fails under vitest's deps optimizer). This
 * mirrors `getBaseUrl` in `@libs/utils/source` exactly — keep them in sync.
 */
const getBaseDomain = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('aucctus://')) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const aiReasoningKind = (title?: string): CitationKind | null => {
  const lowered = title?.toLowerCase();
  if (lowered?.includes('ai synthesis')) return 'ai-synthesis';
  if (lowered?.includes('ai reasoning')) return 'ai-reasoning';
  return null;
};

/**
 * Detect the visual category from `(url, sourceType, title)`. Order
 * matters: aucctus:// wins over sourceType, sourceType wins over title
 * heuristics, title-heuristics are the last resort.
 */
function detectKind(
  url: string | null | undefined,
  sourceType: string | undefined,
  title: string | undefined,
): CitationKind {
  if (url && isInternalUri(url)) return 'internal';
  if (sourceType === 'nucleus') return 'internal';
  if (sourceType === 'user_document' || sourceType === 'file')
    return 'document';
  if (sourceType === 'ai_reasoning') return 'ai-reasoning';
  const aiKind = aiReasoningKind(title);
  if (aiKind) return aiKind;
  if (!url) return 'unknown';
  return 'web';
}

export function adaptISource(source: ISource): Citation {
  const kind = source.nucleusFileSource
    ? 'document'
    : detectKind(source.url, source.sourceType, source.title);

  let label: string;
  if (kind === 'document') {
    label = source.nucleusFileSource?.title || source.title;
  } else if (kind === 'internal') {
    label = source.nucleusFileSource?.title || source.title;
  } else if (kind === 'ai-reasoning' || kind === 'ai-synthesis') {
    label = kind === 'ai-synthesis' ? 'AI Synthesis' : 'AI Reasoning';
  } else {
    label = getBaseDomain(source.url) || source.title || 'Source';
  }

  return {
    url: source.url || null,
    kind,
    label: truncate(label),
    title: source.title,
    description: source.description,
    citations: source.citations,
    classification: source.classification,
    filename: source.nucleusFileSource?.title,
  };
}

export function adaptNucleusAnswerSource(
  source: NucleusAnswerSource,
): Citation {
  const kind: CitationKind = source.nucleusFileSource
    ? 'document'
    : detectKind(source.url, undefined, source.title);

  let label: string;
  if (kind === 'document' && source.nucleusFileSource) {
    label = source.nucleusFileSource.title || source.title;
  } else if (kind === 'ai-reasoning' || kind === 'ai-synthesis') {
    label = kind === 'ai-synthesis' ? 'AI Synthesis' : 'AI Reasoning';
  } else if (kind === 'internal') {
    label = source.title;
  } else {
    label = getBaseDomain(source.url) || source.title || 'Source';
  }

  return {
    url: source.url || null,
    kind,
    label: truncate(label),
    title: source.title,
    description: source.description,
    citations: source.citations,
    fileType: source.nucleusFileSource?.type,
    filename: source.nucleusFileSource?.originalFilename,
  };
}

export function adaptFinancialProjectionSource(
  source: IBaseFinancialProjectionSourceV2,
): Citation {
  const kind = detectKind(source.url, source.sourceType, source.title);

  let label: string;
  if (kind === 'internal') {
    label = source.title || 'Internal source';
  } else if (kind === 'ai-reasoning' || kind === 'ai-synthesis') {
    label = 'AI Reasoning';
  } else if (source.url) {
    label = getBaseDomain(source.url) || source.title;
  } else {
    label = source.title;
  }

  return {
    url: source.url || null,
    kind,
    label: truncate(label),
    title: source.title,
    reasoning: source.reasoning,
  };
}

export function adaptJtbdItemSource(source: IJTBDItemSource): Citation {
  const kind = detectKind(
    source.sourceUrl,
    source.sourceType,
    source.sourceLabel,
  );
  const url = source.sourceUrl || null;

  let label = source.sourceLabel;
  if (!label && url && kind === 'web') {
    label = getBaseDomain(url) || '';
  }

  return {
    url,
    kind,
    label: truncate(label || ''),
    title: source.sourceLabel,
    metricsContributed: source.metricsContributed,
  };
}

/**
 * Adapter for the loose `{ source, url, sourceType, snippet }` shape used
 * by JTBD's `SourcePill` — many call-sites pass these props inline rather
 * than through a typed source object.
 */
export function adaptSourcePillProps(input: {
  source: string;
  url?: string | null;
  sourceType?: string;
  snippet?: string;
}): Citation {
  const kind = detectKind(input.url, input.sourceType, input.source);
  const url = input.url || null;
  const domain = url && kind === 'web' ? getBaseDomain(url) : '';
  const label = input.source || domain || '';

  return {
    url,
    kind,
    label: truncate(label),
    title: input.source,
    snippet: input.snippet,
  };
}
