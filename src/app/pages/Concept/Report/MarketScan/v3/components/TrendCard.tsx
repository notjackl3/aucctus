import React from 'react';
import { Icon, ComponentCarousel } from '@components';
import Text from '@components/Text';
import type {
  IconVariant,
  ITrendV3,
  IKeyFindingV3,
} from '@libs/api/types/concept/marketScan';
import KeyFindingCard from './KeyFindingCard';

interface TrendCardProps {
  section: ITrendV3;
  index: number;
}

// Helper function to adapt API data to component needs
const adaptKeyFinding = (finding: IKeyFindingV3) => {
  // Map API direction values to component expected values
  const mapDirection = (direction: string): 'up' | 'down' => {
    if (direction === 'tailwind' || direction === 'up') return 'up';
    if (direction === 'headwind' || direction === 'down') return 'down';
    // Default fallback
    return 'up';
  };

  return {
    text: finding.text,
    source: finding.source,
    type: finding.type,
    direction: mapDirection(finding.direction),
    sources: finding.sources,
  };
};

const TrendCard: React.FC<TrendCardProps> = ({ section, index }) => {
  return (
    <div
      key={section.uuid || index}
      className='aucctus-border-secondary overflow-hidden rounded-lg border bg-white'
    >
      {/* Header area */}
      <div className='aucctus-bg-secondary px-6 pb-4 pt-6'>
        <div className='mb-1 flex items-center gap-2'>
          <div className='flex items-center justify-center py-1'>
            <Icon
              variant={section.icon as IconVariant}
              className='aucctus-stroke-brand-secondary h-5 w-5'
            />
          </div>
          <div className='aucctus-text-sm aucctus-text-brand-tertiary font-semibold uppercase tracking-wider'>
            {section.category}
          </div>
        </div>
        <div className='aucctus-text-md-semibold aucctus-text-primary'>
          {section.summary}
        </div>
      </div>

      {/* Impact/Why it matters */}
      <div className='px-6 pb-2 pt-3'>
        <Text.Collapsible
          title='WHY IT MATTERS?'
          titleClassName='aucctus-text-xs-semibold aucctus-text-tertiary mb-1 tracking-wide'
          description={section.impact}
          descriptionClassName='aucctus-text-sm aucctus-text-secondary leading-relaxed'
          maxDescriptionHeight={140}
          truncationClassName='line-clamp-6'
        />
      </div>

      {/* Key Findings */}
      <div className='mt-1 px-6 pb-5'>
        <div className='mb-2 flex items-center justify-between'>
          <span className='aucctus-text-xs-semibold aucctus-text-tertiary tracking-wide'>
            KEY FINDINGS
          </span>
          {/* Carousel arrows are handled by the carousel itself */}
        </div>
        <ComponentCarousel
          gap='12px'
          showNavigation={true}
          arrowPlacement='top'
        >
          {section.keyFinding && section.keyFinding.length > 0 ? (
            section.keyFinding.map((finding, findingIndex) => (
              <KeyFindingCard
                key={finding.uuid || findingIndex}
                finding={adaptKeyFinding(finding)}
              />
            ))
          ) : (
            <div className='aucctus-text-sm aucctus-text-secondary py-4'>
              No key findings available
            </div>
          )}
        </ComponentCarousel>
      </div>
    </div>
  );
};

export default TrendCard;
