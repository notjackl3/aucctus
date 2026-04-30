import React, { useCallback } from 'react';
import { useCitationResolver } from '@hooks/useCitationResolver';
import { ExternalLink, File } from 'lucide-react';

interface SignalSourceProps {
  source: {
    title: string;
    url?: string;
  };
}

export const SignalSource: React.FC<SignalSourceProps> = ({ source }) => {
  const resolved = useCitationResolver(source.url);
  const handleSourceClick = useCallback(
    (e: React.MouseEvent) => {
      if (resolved.kind === 'external') {
        window.open(resolved.href, resolved.target, 'noopener,noreferrer');
      } else if (resolved.kind === 'internal') {
        resolved.onClick(e);
      }
    },
    [resolved],
  );
  const isInteractive = resolved.kind !== 'noop';

  return (
    <div
      className={`group flex flex-row items-center gap-2 transition-all duration-300 ${
        isInteractive ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={isInteractive ? handleSourceClick : undefined}
    >
      <span>
        <File className='aucctus-stroke-tertiary group-hover:aucctus-stroke-brand-primary h-4 w-4 transition-colors duration-300' />
      </span>
      <span
        title={source.title}
        className='aucctus-text-tertiary-hover group-hover:aucctus-text-brand-primary aucctus-text-sm line-clamp-1 transition-colors duration-300'
      >
        {source.title}
      </span>
      <span className='flex-1' />
      <span className='aucctus-bg-secondary-hover flex items-center justify-center rounded-lg p-1'>
        <ExternalLink className='aucctus-stroke-tertiary group-hover:aucctus-stroke-brand-primary h-4 w-4 transition-colors duration-300' />
      </span>
    </div>
  );
};
