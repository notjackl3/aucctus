import React, { useRef } from 'react';
import { Icon, Button } from '@components';
import ComponentCarousel, {
  ComponentCarouselRef,
} from '../../Carousel/ComponentCarousel';
import SourceInfoBadge from '../../Badges/SourceInfoBadge';
import type { FuturePrediction } from '../hooks/useEcosystem';

interface FuturePredictionsProps {
  predictions: FuturePrediction[];
}

const FuturePredictions: React.FC<FuturePredictionsProps> = ({
  predictions,
}) => {
  const predictionsCarouselRef = useRef<ComponentCarouselRef>(null);

  return (
    <>
      {/* Header with Navigation */}
      <div className='px-0 pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <h3 className='aucctus-text-primary flex items-center gap-2 text-xl font-semibold tracking-tight'>
              <div className='aucctus-text-primary h-5 w-5'>
                <Icon variant='future' />
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
              <Icon
                variant='chevronleft'
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </Button>
            <Button
              onClick={() => predictionsCarouselRef.current?.scrollNext()}
              size='sm'
              color='light'
            >
              <Icon
                variant='chevron-right'
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className='rounded-lg'>
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

              {/* Source Badges */}
              {prediction.sources && prediction.sources.length > 0 && (
                <div className='flex flex-wrap items-center gap-2'>
                  {prediction.sources.map((source, idx) => (
                    <SourceInfoBadge
                      key={idx}
                      source={source}
                      badgeSize='small'
                      onClick={
                        source.url
                          ? () => window.open(source.url!, '_blank')
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </ComponentCarousel>
      </div>
    </>
  );
};

export default FuturePredictions;
