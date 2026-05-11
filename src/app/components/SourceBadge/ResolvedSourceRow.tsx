import { useCitationResolver } from '@hooks/useCitationResolver';
import type { ISource } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React from 'react';
import SourceBadge from './SourceBadge';
import { adaptISource } from './adapters';

/**
 * Click-through wrapper for multi-source-tooltip rows. Routes clicks
 * through `useCitationResolver` so internal aucctus:// URIs navigate
 * in-app and external URLs open in a new tab.
 */
const ResolvedSourceRow: React.FC<{
  source: ISource;
  isLast: boolean;
  description: React.ReactNode;
}> = ({ source, isLast, description }) => {
  const resolved = useCitationResolver(source.url);
  const isInteractive = resolved.kind !== 'noop';
  const handleClick = (e: React.MouseEvent) => {
    if (resolved.kind === 'external') {
      window.open(resolved.href, resolved.target, 'noopener,noreferrer');
    } else if (resolved.kind === 'internal') {
      resolved.onClick(e);
    }
  };
  return (
    <div
      className={cn(
        'flex flex-col gap-2 p-3 transition-colors',
        isInteractive && 'cursor-pointer hover:bg-gray-50',
        !isLast && 'aucctus-border-secondary border-b',
      )}
      onClick={isInteractive ? handleClick : undefined}
    >
      <div className='pointer-events-none'>
        <SourceBadge
          citation={adaptISource(source)}
          variant='standard'
          size='sm'
          className='aucctus-text-primary whitespace-nowrap'
        />
      </div>
      <div className='aucctus-text-xs-semibold aucctus-text-primary'>
        {source.title}
      </div>
      {description}
    </div>
  );
};

export default ResolvedSourceRow;
