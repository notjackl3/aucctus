import ComponentTooltip from '@components/ToolTip/ComponentTooltip';
import AucctusLogo from '@assets/aucctus_logo.png';
import { cn } from '@libs/utils/react';
import { getBaseUrl, getLogoUrl } from '@libs/utils/source';
import { ExternalLink, FileText, Link } from 'lucide-react';
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
  const isUserDocument = sourceType === 'user_document';
  const isNucleus = sourceType === 'nucleus';
  const isNonHttp = isUserDocument || isNucleus;
  const domain = url && !isNonHttp ? getBaseUrl(url) : null;
  const displaySource = source || domain || '';
  if (!displaySource) return null;
  const isClickable = !!url && !isNonHttp;

  const content = (
    <>
      <span
        className={cn(
          'flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-full',
          // Nucleus pills mirror Idea Playground's nucleus styling — white
          // circular background framing the Aucctus logo, distinct from the
          // grey iconography used for web/document sources.
          { 'bg-white': isNucleus },
        )}
      >
        {isNucleus ? (
          <img
            src={AucctusLogo}
            alt='Aucctus Nucleus'
            className='h-full w-full object-contain p-0.5'
          />
        ) : isUserDocument ? (
          <FileText className='h-2.5 w-2.5 text-white/40' />
        ) : (
          <>
            {domain ? (
              <img
                className='h-full w-full object-contain'
                alt=''
                src={getLogoUrl(domain)}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
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
          </>
        )}
      </span>
      <span className='truncate text-white/70'>{displaySource}</span>
      {isClickable && (
        <ExternalLink className='h-2.5 w-2.5 shrink-0 text-white/25' />
      )}
    </>
  );

  // Render a richer hover tooltip when a snippet is available. Mirrors the
  // pattern used for `opportunityReasoning` in JTBDCard (instant-show, styled
  // dark popover) instead of the slow native browser `title=` tooltip, which
  // had a long delay and could not be styled to match the dark surface.
  const trimmedSnippet = snippet ? snippet.trim() : '';
  const tooltipNode = trimmedSnippet ? (
    <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm leading-snug text-white/90 shadow-2xl'>
      {trimmedSnippet}
    </div>
  ) : null;

  const pill = isClickable ? (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      className={cn(
        'inline-flex max-w-[200px] items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50 backdrop-blur transition-colors hover:border-white/[0.15] hover:bg-white/[0.1] hover:text-white/70',
        className,
      )}
    >
      {content}
    </a>
  ) : (
    <span
      className={cn(
        'inline-flex max-w-[200px] items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50 backdrop-blur',
        className,
      )}
    >
      {content}
    </span>
  );

  if (tooltipNode) {
    return (
      <ComponentTooltip preferredPosition='above' tip={tooltipNode}>
        {pill}
      </ComponentTooltip>
    );
  }

  return pill;
};
