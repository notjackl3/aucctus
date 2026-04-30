/**
 * SourceBadge — unified citation badge.
 *
 * Single source of truth for "render a clickable source citation". Replaces
 * SourcePill, ItemSources, SourceInfoBadge, NucleusSourceBadge,
 * FinancialProjectionSourceBadge, and the v2/v3 SourceBadgeList fork.
 *
 * Behavior is non-overridable by the caller:
 *   - http(s) URL  → opens in new tab
 *   - aucctus://   → in-app navigation via useCitationResolver
 *   - empty / unparseable → non-interactive display
 *
 * Visual treatment is selected via the `variant` prop. Adding a new visual
 * skin = add a variant; adding a new source data shape = add an adapter.
 */

import images from '@assets/img';
import AucctusLogo from '@assets/aucctus_logo.png';
import { ComponentTooltip } from '@components';
import { useCitationResolver } from '@hooks/useCitationResolver';
import { getBaseUrl, getLogoUrl } from '@libs/utils/source';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Lightbulb, Link } from 'lucide-react';
import React, { useMemo } from 'react';

import type { Citation, CitationKind } from './types';

// File-type icon mapping for document-kind citations.
const FILE_TYPE_ICONS = {
  pdf: 'file-text',
  doc: 'file-text',
  docx: 'file-text',
  txt: 'file-text',
  csv: 'file-spreadsheet',
  xls: 'file-spreadsheet',
  xlsx: 'file-spreadsheet',
  ppt: 'file-text',
  pptx: 'file-text',
  file: 'file',
} as const;

export type SourceBadgeVariant = 'standard' | 'glass';
export type SourceBadgeSize = 'sm' | 'md';

export interface SourceBadgeProps {
  citation: Citation;
  variant?: SourceBadgeVariant;
  size?: SourceBadgeSize;
  className?: string;
  /** Tooltip hide delay in ms. Default 0. */
  hideDelay?: number;
  /**
   * Optional tooltip control:
   * - `undefined` (default): renders the standard tooltip from the citation
   * - `ReactNode`: replaces the tooltip body with the provided node
   * - `false`: skips the tooltip wrapping entirely (use for variants where
   *   the surrounding context already provides a tooltip)
   */
  tooltip?: React.ReactNode | false;
  /**
   * Show ExternalLink chevron in the glass variant when the citation
   * resolves to an interactive target. Default true.
   */
  showExternalIcon?: boolean;
}

const Icon: React.FC<{
  citation: Citation;
  variant: SourceBadgeVariant;
  size: SourceBadgeSize;
}> = ({ citation, variant, size }) => {
  const iconBox = size === 'sm' ? 'h-3.5 w-3.5' : 'h-6 w-6';
  const innerIcon = size === 'sm' ? 'h-2.5 w-2.5' : 'h-4 w-4';
  const isGlass = variant === 'glass';

  if (citation.kind === 'internal') {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white',
          iconBox,
        )}
      >
        <img
          src={AucctusLogo}
          alt='Aucctus'
          className='h-full w-full object-contain p-0.5'
        />
      </span>
    );
  }

  if (citation.kind === 'document') {
    if (isGlass) {
      return (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
            iconBox,
          )}
        >
          <FileText className={cn(innerIcon, 'text-white/40')} />
        </span>
      );
    }
    return (
      <span
        className={cn(
          'aucctus-bg-secondary flex shrink-0 items-center justify-center rounded-full',
          iconBox,
        )}
      >
        <DynamicIcon
          variant={
            (citation.fileType
              ? (FILE_TYPE_ICONS[citation.fileType] ?? 'file')
              : 'file') as 'file'
          }
          className={cn('aucctus-stroke-tertiary', innerIcon)}
        />
      </span>
    );
  }

  if (citation.kind === 'ai-reasoning' || citation.kind === 'ai-synthesis') {
    return (
      <span
        className={cn(
          'aucctus-border-primary flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          iconBox,
        )}
      >
        <Lightbulb
          className={cn(
            isGlass ? 'text-white/40' : 'aucctus-stroke-quaternary',
            innerIcon,
          )}
        />
      </span>
    );
  }

  // web / unknown — favicon if domain available, link icon otherwise.
  const domain = getBaseUrl(citation.url);
  if (!domain) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center overflow-hidden rounded-full',
          iconBox,
        )}
      >
        <Link
          className={cn(
            isGlass ? 'text-white/40' : 'aucctus-stroke-tertiary',
            innerIcon,
          )}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-transparent',
        iconBox,
      )}
    >
      <img
        className='h-full w-full object-contain'
        alt=''
        src={getLogoUrl(domain)}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.onerror = null;
          img.src = images.link;
        }}
      />
    </span>
  );
};

const Tooltip: React.FC<{ citation: Citation }> = ({ citation }) => {
  const body =
    citation.description ??
    citation.reasoning ??
    citation.snippet ??
    citation.metricsContributed ??
    null;

  return (
    <div
      className='aucctus-bg-primary aucctus-border-secondary max-w-xs overflow-hidden rounded-xl border p-4 shadow-lg'
      style={{
        boxShadow:
          '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
      }}
    >
      {citation.title && (
        <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2 break-words'>
          {citation.title}
        </div>
      )}
      {body && (
        <div className='aucctus-text-xs aucctus-text-secondary'>{body}</div>
      )}
      {citation.citations && (
        <div className='aucctus-bg-secondary aucctus-text-xs aucctus-text-tertiary mt-2 rounded-lg p-2 italic'>
          &ldquo;{citation.citations}&rdquo;
        </div>
      )}
      {citation.filename && citation.kind === 'document' && (
        <div className='aucctus-border-secondary aucctus-text-xs aucctus-text-tertiary mt-3 truncate border-t pt-2'>
          {citation.filename}
        </div>
      )}
    </div>
  );
};

const SourceBadge: React.FC<SourceBadgeProps> = ({
  citation,
  variant = 'standard',
  size = 'md',
  className,
  hideDelay = 0,
  tooltip,
  showExternalIcon = true,
}) => {
  const resolved = useCitationResolver(citation.url);
  const isInteractive = resolved.kind !== 'noop';

  const shellClassName = useMemo(() => {
    if (variant === 'glass') {
      return cn(
        'inline-flex max-w-[200px] items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50 backdrop-blur',
        isInteractive &&
          'transition-colors hover:border-white/[0.15] hover:bg-white/[0.1] hover:text-white/70',
        className,
      );
    }
    const padding = size === 'sm' ? 'px-2 py-0.5' : 'p-1';
    const fontClass =
      size === 'sm' ? 'text-xs font-normal' : 'text-sm font-medium';
    return cn(
      'aucctus-border-primary inline-flex items-center gap-2 rounded-full border',
      padding,
      fontClass,
      isInteractive
        ? 'aucctus-bg-primary-hover cursor-pointer transition-all !duration-200'
        : 'cursor-default',
      className,
    );
  }, [variant, size, isInteractive, className]);

  const labelClassName =
    variant === 'glass'
      ? 'truncate text-white/70'
      : cn('pr-2 line-clamp-1', size === 'sm' ? 'aucctus-text-secondary' : '');

  const inner = (
    <>
      <Icon citation={citation} variant={variant} size={size} />
      <span className={labelClassName} title={citation.title}>
        {citation.label || 'Unknown Source'}
      </span>
      {variant === 'glass' && isInteractive && showExternalIcon && (
        <ExternalLink className='h-2.5 w-2.5 shrink-0 text-white/25' />
      )}
    </>
  );

  // Render shell — <a> for clickable (gives hover preview & accessibility),
  // <span> for non-interactive. Glass variant uses plain anchors with
  // stop-propagation; standard variant uses motion.button for the existing
  // hover scale animation in NucleusSourceBadge's call sites.
  let shell: React.ReactElement;
  if (resolved.kind === 'external') {
    shell = (
      <a
        href={resolved.href}
        target={resolved.target}
        rel={resolved.rel}
        onClick={(e) => e.stopPropagation()}
        className={shellClassName}
      >
        {inner}
      </a>
    );
  } else if (resolved.kind === 'internal') {
    shell = (
      <a
        href={resolved.href}
        onClick={(e) => {
          e.stopPropagation();
          resolved.onClick(e);
        }}
        className={shellClassName}
      >
        {inner}
      </a>
    );
  } else if (variant === 'standard') {
    shell = (
      <motion.span
        className={shellClassName}
        whileHover={isInteractive ? { scale: 1.02 } : undefined}
        whileTap={isInteractive ? { scale: 0.98 } : undefined}
      >
        {inner}
      </motion.span>
    );
  } else {
    shell = <span className={shellClassName}>{inner}</span>;
  }

  if (tooltip === false) return shell;

  const tooltipNode = tooltip ?? <Tooltip citation={citation} />;

  return (
    <ComponentTooltip tip={tooltipNode} hideDelay={hideDelay}>
      {shell}
    </ComponentTooltip>
  );
};

export default React.memo(SourceBadge);
export type { Citation, CitationKind };
