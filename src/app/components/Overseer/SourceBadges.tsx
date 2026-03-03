import React, { useState } from 'react';

export interface Source {
  name: string;
  url?: string;
}

const getFaviconUrl = (url?: string): string | null => {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

const SourcePill: React.FC<{ source: Source }> = ({ source }) => {
  const favicon = getFaviconUrl(source.url);
  return (
    <a
      href={source.url || '#'}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium !text-white/60 no-underline backdrop-blur-sm transition-colors hover:border-white/15 hover:!text-white/80'
    >
      {favicon ? (
        <img
          src={favicon}
          alt=''
          className='h-3 w-3 rounded-full'
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className='h-3 w-3 rounded-full bg-white/15' />
      )}
      {source.name}
    </a>
  );
};

interface SourceBadgesProps {
  sources: Source[];
}

const SourceBadges: React.FC<SourceBadgesProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources.length) return null;

  // 2 or fewer: show all inline
  if (sources.length <= 2) {
    return (
      <div className='mt-2.5 flex flex-wrap gap-1.5'>
        {sources.map((source, i) => (
          <SourcePill key={i} source={source} />
        ))}
      </div>
    );
  }

  // Expanded: show all pills
  if (expanded) {
    return (
      <div className='mt-2.5 flex flex-wrap gap-1.5'>
        {sources.map((source, i) => (
          <SourcePill key={i} source={source} />
        ))}
        <button
          onClick={(e) => {
            e.preventDefault();
            setExpanded(false);
          }}
          className='inline-flex items-center rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-white/35 transition-colors hover:text-white/55'
        >
          ‹
        </button>
      </div>
    );
  }

  // Collapsed: stacked avatars + count (cap visible avatars at 5)
  const MAX_VISIBLE_AVATARS = 5;
  const visibleSources = sources.slice(0, MAX_VISIBLE_AVATARS);

  return (
    <div className='mt-2.5'>
      <button
        onClick={(e) => {
          e.preventDefault();
          setExpanded(true);
        }}
        className='group inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-1 backdrop-blur-sm transition-colors hover:border-white/15'
      >
        {/* Stacked avatars */}
        <div className='flex items-center'>
          {visibleSources.map((source, i) => {
            const favicon = getFaviconUrl(source.url);
            return (
              <div
                key={i}
                className='relative h-4 w-4 shrink-0 overflow-hidden rounded-full border border-black/30 bg-white/[0.12]'
                style={{
                  marginLeft: i > 0 ? '-5px' : '0',
                  zIndex: visibleSources.length - i,
                }}
              >
                {favicon ? (
                  <img
                    src={favicon}
                    alt=''
                    className='h-full w-full object-cover'
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className='h-full w-full bg-white/15' />
                )}
              </div>
            );
          })}
        </div>
        <span className='text-[10px] font-medium text-white/50 transition-colors group-hover:text-white/70'>
          +{sources.length} sources
        </span>
      </button>
    </div>
  );
};

export default SourceBadges;
