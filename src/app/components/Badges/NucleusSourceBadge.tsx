/**
 * NucleusSourceBadge — thin wrapper over `<SourceBadge variant="standard">`.
 *
 * The Nucleus answer renderer's existing call-sites pass a richer source
 * shape (`NucleusAnswerSource`) than ISource, with a typed file-source
 * sub-object and per-source citations / credibilityScore fields. The
 * adapter encapsulates the shape conversion and the unified badge handles
 * the rendering.
 */

import { SourceBadge, adaptNucleusAnswerSource } from '@components/SourceBadge';
import type { NucleusAnswerSource } from '@libs/api/types/nucleus';
import React from 'react';

interface NucleusSourceBadgeProps {
  source: NucleusAnswerSource;
  /** @deprecated The resolver determines click behavior; this is unused. */
  onClick?: () => void;
  size?: 'small' | 'medium';
  className?: string;
  /** Maximum characters to show for title before truncating. Currently fixed at 25. */
  maxLength?: number;
  hideDelay?: number;
}

const NucleusSourceBadge: React.FC<NucleusSourceBadgeProps> = ({
  source,
  size = 'small',
  className = '',
  hideDelay = 0,
}) => {
  const citation = adaptNucleusAnswerSource(source);
  return (
    <SourceBadge
      citation={citation}
      variant='standard'
      size={size === 'small' ? 'sm' : 'md'}
      className={className}
      hideDelay={hideDelay}
    />
  );
};

export default React.memo(NucleusSourceBadge);
