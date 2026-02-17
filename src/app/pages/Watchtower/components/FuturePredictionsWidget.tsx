import React, { useRef } from 'react';
import { ComponentCarousel, Badge } from '@components';
import { useWatchtowerPredictions } from '@hooks/query/watchtower.hook';
import type { ISource } from '@libs/api/types';
import type { PredictionSource } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, Telescope } from 'lucide-react';

/**
 * Converts a PredictionSource to ISource format for SourceInfoBadge
 */
const toISource = (source: PredictionSource): ISource => ({
  uuid: source.uuid,
  title: source.title,
  url: source.url,
  citations: source.citations,
  description: source.description,
  classification: source.classification,
});

/**
 * Creates source description with citations (verbatim quotes) for tooltip display.
 * Follows the same pattern as EcosystemV2 FuturePredictions component.
 */
const createSourceDescriptionWithCitations = (
  source: PredictionSource,
): React.ReactNode => {
  const citations = source.citations;

  if (!source.description && !citations) {
    return null; // Will fallback to URL in SourceInfoBadge
  }

  // Parse citations - handle both single string and potential formats
  const parseCitations = (citationsStr: string): string[] => {
    if (!citationsStr) return [];

    // Handle bracket-separated format [citation1],[citation2]
    if (citationsStr.includes('], [')) {
      return citationsStr
        .split('], [')
        .map((c) => c.replace(/^\[/, '').replace(/\]$/, '').trim())
        .filter(Boolean);
    }

    // Single citation - return as array
    return [citationsStr.trim()];
  };

  const citationsList = citations ? parseCitations(citations) : [];

  return (
    <div className='space-y-2'>
      {source.description && (
        <div className='aucctus-text-xs aucctus-text-secondary'>
          {source.description}
        </div>
      )}
      {citationsList.length > 0 && (
        <div className='aucctus-text-xs aucctus-text-tertiary space-y-1 italic'>
          {citationsList.map((citation, index) => {
            // Strip existing quotes to prevent double-quoting
            let cleaned = citation.trim();
            cleaned = cleaned.replace(/^[""]/, '').replace(/[""]$/, '');
            cleaned = cleaned.replace(/^['']/, '').replace(/['']$/, '');
            cleaned = cleaned.replace(/^[`]/, '').replace(/[`]$/, '');
            return (
              <div key={`citation-${index}-${cleaned.substring(0, 20)}`}>
                &ldquo;{cleaned}&rdquo;
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * FuturePredictionsWidget - Carousel of AI-driven predictions
 * Uses the existing ComponentCarousel from Aucctus
 */
const FuturePredictionsWidget: React.FC = () => {
  const carouselRef = useRef<{
    scrollPrev: () => void;
    scrollNext: () => void;
  }>(null);

  const { predictions, isLoading } = useWatchtowerPredictions();

  if (isLoading || predictions.length === 0) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col items-center justify-center rounded-xl border p-6'>
        <Telescope size={32} className='aucctus-stroke-tertiary mb-2' />
        <p className='aucctus-text-tertiary text-sm'>
          {isLoading ? 'Loading predictions...' : 'No predictions available'}
        </p>
      </div>
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col rounded-xl border p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='aucctus-text-secondary h-5 w-5'>
            <Telescope size={20} className='aucctus-stroke-secondary' />
          </div>
          <h3 className='aucctus-text-primary aucctus-text-lg-semibold'>
            Future Predictions
          </h3>
        </div>
        <div className='flex gap-2'>
          <button
            className='aucctus-bg-secondary-hover aucctus-border-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => carouselRef.current?.scrollPrev()}
          >
            <ChevronLeft size={16} className='aucctus-stroke-secondary' />
          </button>
          <button
            className='aucctus-bg-secondary-hover aucctus-border-secondary flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            onClick={() => carouselRef.current?.scrollNext()}
          >
            <ChevronRight size={16} className='aucctus-stroke-secondary' />
          </button>
        </div>
      </div>

      {/* Prediction Carousel - one card at a time with peek */}
      <div className='flex-1 overflow-hidden'>
        <ComponentCarousel
          ref={carouselRef}
          cardWidth='70%'
          gap='16px'
          showNavigation={false}
          className='h-full'
        >
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className='aucctus-bg-primary aucctus-border-secondary h-full overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:shadow-lg'
            >
              <div className='flex h-full flex-col p-5'>
                <div className='flex-1 space-y-3'>
                  <h4 className='aucctus-text-primary aucctus-text-md-semibold leading-snug'>
                    {prediction.title}
                  </h4>
                  <p className='aucctus-text-secondary aucctus-text-sm leading-relaxed'>
                    {prediction.description}
                  </p>
                </div>
                <div className='mt-4 flex flex-wrap items-center gap-1.5'>
                  {prediction.sources
                    .filter((source) => source.url) // Only show sources with URLs
                    .map((source) => (
                      <Badge.SourceInfo
                        key={source.uuid}
                        source={toISource(source)}
                        badgeSize='small'
                        badgeClassName='aucctus-text-primary whitespace-nowrap'
                        onClick={() =>
                          source.url && window.open(source.url, '_blank')
                        }
                        showPublishedDate={false}
                        sourceDescription={createSourceDescriptionWithCitations(
                          source,
                        )}
                        hideDelay={0}
                      />
                    ))}
                  {prediction.hasAiReasoning && (
                    <div className='aucctus-border-primary flex items-center gap-2 rounded-full border p-1'>
                      <Sparkles className='aucctus-stroke-secondary h-4 w-4' />
                      <span className='aucctus-text-secondary pr-2 text-xs font-normal'>
                        AI Reasoning
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ComponentCarousel>
      </div>
    </div>
  );
};

export default React.memo(FuturePredictionsWidget);
