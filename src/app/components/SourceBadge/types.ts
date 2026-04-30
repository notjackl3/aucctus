/**
 * Canonical Citation type for the unified `<SourceBadge>` system.
 *
 * Heterogeneous source shapes across the app (ISource, NucleusAnswerSource,
 * IBaseFinancialProjectionSourceV2, IJTBDItemSource, raw {source, url}
 * triples from JTBD widgets) all flow through `adapters.ts` to produce a
 * `Citation` that the badge consumes. Adding a new source shape means
 * adding one adapter — not a new badge component.
 *
 * Click behavior is NEVER stored on the Citation. The badge calls
 * `useCitationResolver(citation.url)` internally and decides:
 *   - http(s) URL  → external link (new tab)
 *   - aucctus://   → in-app navigation
 *   - empty / unparseable → non-clickable display
 *
 * This is by design. Caller-supplied `onClick` overrides were the
 * single largest source of bypassed citation routing in the legacy badges.
 */

import type { FileType } from '@libs/api/types/nucleus';
import type { ReactNode } from 'react';

/** Visual category — drives icon selection, not click behavior. */
export type CitationKind =
  /** http(s) external source — favicon shown via getLogoUrl(domain). */
  | 'web'
  /** User-uploaded document (NucleusFileSource) — file-type icon. */
  | 'document'
  /** Internal Nucleus / Watchtower / Concept resource — Aucctus logo. */
  | 'internal'
  /** AI-generated reasoning row (no URL, lightbulb icon). */
  | 'ai-reasoning'
  /** AI-synthesis row (no URL, lightbulb icon). */
  | 'ai-synthesis'
  /** Anything else with no actionable URL. */
  | 'unknown';

export interface Citation {
  /**
   * Raw source URL — http(s) URL or aucctus:// URI. May be `null` for
   * AI-reasoning / AI-synthesis rows. The badge passes this verbatim to
   * `useCitationResolver`.
   */
  url: string | null;

  /** Visual category — see `CitationKind`. */
  kind: CitationKind;

  /** Display text in the pill body (truncated to ~25 chars by the badge). */
  label: string;

  /** Tooltip header — usually the original `source.title`. Falls back to `label`. */
  title?: string;

  /** Tooltip body. */
  description?: ReactNode;

  /** AI-reasoning rationale (FinancialProjectionSourceBadge). */
  reasoning?: string;

  /** Verbatim quote from the source (NucleusAnswerSource.citations). */
  citations?: string;

  /** Tooltip badge in upper-right corner (ISource.classification). */
  classification?: string;

  /** Document metadata (NucleusFileSource). */
  fileType?: FileType;
  filename?: string;

  /** JTBD-specific. */
  snippet?: string;
  metricsContributed?: string;
}
