/**
 * SourcePill — thin wrapper over the unified `<SourceBadge variant="glass">`.
 *
 * Preserved as a named export so existing call-sites (JTBD widgets,
 * Overseer chat re-export at `components/Overseer/SourceBadges.tsx`)
 * compile unchanged. New call-sites should import `SourceBadge` from
 * `@components/SourceBadge` directly.
 */

import { SourceBadge, adaptSourcePillProps } from '@components/SourceBadge';
import React from 'react';

interface SourcePillProps {
  source: string;
  url?: string;
  sourceType?: string;
  snippet?: string;
  className?: string;
}

export const SourcePill: React.FC<SourcePillProps> = ({
  source,
  url,
  sourceType,
  snippet,
  className,
}) => {
  const citation = adaptSourcePillProps({ source, url, sourceType, snippet });
  if (!citation.label) return null;

  // Glass variant: only wrap in a tooltip when there's a snippet, and use
  // the dark popover styling that matches JTBDCard's opportunityReasoning
  // hover (instead of the lighter default tooltip).
  const trimmed = snippet?.trim();
  const tooltip = trimmed ? (
    <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm leading-snug text-white/90 shadow-2xl'>
      {trimmed}
    </div>
  ) : (
    (false as const)
  );

  return (
    <SourceBadge
      citation={citation}
      variant='glass'
      size='sm'
      className={className}
      tooltip={tooltip}
    />
  );
};
