import { Button, ComponentTooltip } from '@components';
import { SourceBadge, adaptISource } from '@components/SourceBadge';
import ResolvedSourceRow from '@components/SourceBadge/ResolvedSourceRow';
import type { ISource } from '@libs/api/types';
import React, { useCallback, useRef } from 'react';
import MultiSourceBadge from '../../../pages/Concept/Report/MarketScan/components/sources/MultiSourceBadge';
import ComponentCarousel, {
  ComponentCarouselRef,
} from '../../Carousel/ComponentCarousel';
import type { FuturePrediction } from '../hooks/useEcosystem';
import { ChevronLeft, ChevronRight, Telescope } from 'lucide-react';

interface FuturePredictionsProps {
  predictions: FuturePrediction[];
}

const FuturePredictions: React.FC<FuturePredictionsProps> = ({
  predictions,
}) => {
  const predictionsCarouselRef = useRef<ComponentCarouselRef>(null);

  // Create source description with citations (similar to PriorityInsightCard)
  const createSourceDescriptionWithCitations = useCallback(
    (source: ISource, prediction: FuturePrediction) => {
      // Check if the source has citations in the original prediction data
      const originalSource = prediction.sources?.find(
        (s) => s.uuid === source.uuid,
      );
      const citations =
        (originalSource as any)?.citations || (source as any)?.citations || [];

      if (!source.description && (!citations || citations.length === 0)) {
        return null; // Will fallback to URL
      }

      return (
        <div className='space-y-2'>
          {source.description && (
            <div className='aucctus-text-xs aucctus-text-secondary'>
              {source.description}
            </div>
          )}
          {citations && citations.length > 0 && (
            <div className='aucctus-text-xs aucctus-text-tertiary space-y-1 italic'>
              {citations.map((citation: string, index: number) => {
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
    },
    [],
  );

  // Build a citation-aware tooltip body that includes title + description + citations.
  const renderTooltip = useCallback(
    (source: ISource, prediction: FuturePrediction) => {
      const description = createSourceDescriptionWithCitations(
        source,
        prediction,
      );
      return (
        <div
          className='aucctus-bg-primary aucctus-border-secondary max-w-xs overflow-y-auto overscroll-contain rounded-xl border p-4 shadow-lg'
          style={{
            boxShadow:
              '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
          }}
        >
          {source.title && (
            <div className='aucctus-text-sm-semibold aucctus-text-primary mb-2 break-words'>
              {source.title}
            </div>
          )}
          {description}
        </div>
      );
    },
    [createSourceDescriptionWithCitations],
  );

  // Render source badges with "more sources" functionality
  const renderSourceBadges = useCallback(
    (sources: ISource[], prediction: FuturePrediction) => {
      if (!sources || sources.length === 0) {
        return null;
      }

      const maxVisibleSources = 3;
      const shouldUseMultiBadge = sources.length > maxVisibleSources;
      const visibleCount = shouldUseMultiBadge
        ? maxVisibleSources - 1
        : sources.length;

      const renderBadge = (source: ISource, index: number) => (
        <SourceBadge
          key={`${source.uuid || 'source'}-${index}`}
          citation={adaptISource(source)}
          variant='standard'
          size='sm'
          className='aucctus-text-primary whitespace-nowrap'
          tooltip={renderTooltip(source, prediction)}
          hideDelay={0}
        />
      );

      return (
        <div className='mt-1 flex flex-wrap items-center gap-2'>
          {sources.length <= maxVisibleSources ? (
            sources.map((source, index) => renderBadge(source, index))
          ) : (
            <>
              {sources
                .slice(0, visibleCount)
                .map((source, index) => renderBadge(source, index))}

              {/* Remaining sources - MultiSourceBadge with tooltip */}
              <ComponentTooltip
                tip={
                  <div
                    className='aucctus-bg-primary aucctus-border-secondary max-w-sm overflow-y-auto overscroll-contain rounded-lg border'
                    style={{
                      boxShadow:
                        '0 0 15px rgba(0, 0, 0, 0.075), 0 8px 15px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {sources.slice(visibleCount).map((source, index, arr) => (
                      <ResolvedSourceRow
                        key={`${source.uuid || 'source'}-${index}`}
                        source={source}
                        isLast={index === arr.length - 1}
                        description={createSourceDescriptionWithCitations(
                          source,
                          prediction,
                        )}
                      />
                    ))}
                  </div>
                }
                hideDelay={300}
              >
                <div className='cursor-pointer'>
                  <MultiSourceBadge
                    sources={sources.slice(visibleCount)}
                    width={80}
                  />
                </div>
              </ComponentTooltip>
            </>
          )}
        </div>
      );
    },
    [createSourceDescriptionWithCitations, renderTooltip],
  );

  if (!predictions || predictions.length === 0) {
    return <></>;
  }

  return (
    <>
      {/* Header with Navigation */}
      <div className='px-0 pt-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='aucctus-text-primary flex items-center gap-2 text-xl font-semibold tracking-tight'>
              <div className='aucctus-text-primary h-5 w-5'>
                <Telescope />
              </div>
              Future Predictions
            </h3>
            <p className='aucctus-text-secondary mt-1 text-base'>
              Emerging trends, entrants and activity
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => predictionsCarouselRef.current?.scrollPrev()}
              size='sm'
              color='light'
            >
              <ChevronLeft className='aucctus-stroke-secondary h-4 w-4' />
            </Button>
            <Button
              onClick={() => predictionsCarouselRef.current?.scrollNext()}
              size='sm'
              color='light'
            >
              <ChevronRight className='aucctus-stroke-secondary h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className='rounded-lg' style={{ marginTop: '1rem' }}>
        <ComponentCarousel
          ref={predictionsCarouselRef}
          cardWidth='350px'
          gap='16px'
          showNavigation={false}
        >
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col space-y-3 overflow-hidden rounded-lg border p-4'
            >
              <h4 className='aucctus-text-primary text-base font-semibold leading-snug'>
                {prediction.title}
              </h4>
              <p className='aucctus-text-secondary flex-1 text-sm leading-relaxed'>
                {prediction.description}
              </p>

              {/* Source Badges with "more sources" functionality */}
              {renderSourceBadges(prediction.sources, prediction)}
            </div>
          ))}
        </ComponentCarousel>
      </div>
    </>
  );
};

export default FuturePredictions;
