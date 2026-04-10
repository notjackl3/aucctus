import { cn } from '@libs/utils/react';
import { getBaseUrl, getLogoUrl } from '@libs/utils/source';
import { ExternalLink, Link } from 'lucide-react';
import React from 'react';

interface SourcePillProps {
  source: string;
  url?: string;
  className?: string;
}

export const SourcePill: React.FC<SourcePillProps> = ({
  source,
  url,
  className,
}) => {
  if (!source) return null;

  const domain = url ? getBaseUrl(url) : null;
  const isClickable = !!url;

  const content = (
    <>
      <span className='flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-full'>
        {domain ? (
          <img
            className='h-full w-full object-contain'
            alt=''
            src={getLogoUrl(domain)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const fallback = e.currentTarget
                .nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          className='hidden h-full w-full items-center justify-center text-white/40'
          style={domain ? undefined : { display: 'flex' }}
        >
          <Link className='h-2.5 w-2.5' />
        </span>
      </span>
      <span className='truncate text-white/70'>{source}</span>
      {isClickable && (
        <ExternalLink className='h-2.5 w-2.5 shrink-0 text-white/25' />
      )}
    </>
  );

  if (isClickable) {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'inline-flex max-w-[200px] items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50 backdrop-blur transition-colors hover:border-white/[0.15] hover:bg-white/[0.1] hover:text-white/70',
          className,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-[200px] items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50 backdrop-blur',
        className,
      )}
    >
      {content}
    </span>
  );
};
