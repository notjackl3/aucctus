import { useCitationResolver } from '@hooks/useCitationResolver';
import type { ISource } from '@libs/api/types';
import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * ExternalLink-icon button routed through `useCitationResolver` so
 * internal aucctus:// URIs navigate in-app instead of window.open.
 */
const LinkButton: React.FC<{ source: ISource }> = ({ source }) => {
  const resolved = useCitationResolver(source.url);
  if (resolved.kind === 'noop') return null;
  const handleClick = (e: React.MouseEvent) => {
    if (resolved.kind === 'external') {
      window.open(resolved.href, resolved.target, 'noopener,noreferrer');
    } else {
      resolved.onClick(e);
    }
  };
  return (
    <div
      className='aucctus-bg-primary-hover cursor-pointer items-center rounded-lg px-2.5 py-2.5 transition-all !duration-200 hover:scale-105'
      onClick={handleClick}
    >
      <ExternalLink />
    </div>
  );
};

export default LinkButton;
