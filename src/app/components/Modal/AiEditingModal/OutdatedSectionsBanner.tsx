import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { ExpandCollapse } from '@hooks/animation/animation.hook';
import React, { useState } from 'react';

interface OutdatedSectionsBannerProps {
  outdatedSections: string[];
  className?: string;
  additionalMessage?: string;
}

// Consistent styles extracted as constants
const STYLES = {
  text: {
    filter: 'contrast(2)',
  },
  card: {
    backdropFilter: 'blur(20px) brightness(0.8) contrast(1.2)',
  },
};

/**
 * OutdatedSectionsBanner - A frosted glass banner that warns users about outdated sections
 * that need to be updated before AI editing can be performed. Shows as an icon that expands on hover.
 */
const OutdatedSectionsBanner: React.FC<OutdatedSectionsBannerProps> = ({
  outdatedSections,
  className,
  additionalMessage,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Show banner if there are outdated sections OR an additional message
  if (outdatedSections.length === 0 && !additionalMessage) {
    return null;
  }

  return (
    <div
      style={isHovered ? STYLES.card : undefined}
      className={cn(
        {
          'aucctus-border-primary aucctus-bg-tertiary flex animate-fade-in flex-row items-center':
            true,
          'h-fit gap-2 rounded-lg border transition-all duration-200': true,
          'border-opacity-50 bg-opacity-25': isHovered,
          'border-opacity-0 bg-opacity-0': !isHovered,
          'cursor-pointer': isHovered,
        },
        className,
      )}
      // Once expanded, the entire component maintains hover state
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon - triggers initial hover */}
      <div className='p-4' onMouseEnter={() => setIsHovered(true)}>
        <Icon
          variant='alert-circle'
          width={20}
          height={20}
          className='flex-shrink-0 stroke-gray-light-200'
        />
      </div>

      {/* Inline message when only additionalMessage exists */}
      {additionalMessage && outdatedSections.length === 0 && (
        <div
          style={STYLES.text}
          className='aucctus-text-sm-medium pr-4 !text-gray-light-200'
        >
          {additionalMessage}
        </div>
      )}

      {/* Expandable content when there are outdated sections */}
      {outdatedSections.length > 0 && (
        <ExpandCollapse
          isExpanded={isHovered}
          withOpacity
          maxHeight={200}
          duration={0.3}
          className='flex-1 overflow-hidden'
        >
          <div className='flex flex-col gap-3 p-4 pl-0'>
            {additionalMessage && (
              <div
                style={STYLES.text}
                className='aucctus-text-sm !text-gray-light-200'
              >
                {additionalMessage}
              </div>
            )}

            <div
              style={STYLES.text}
              className='aucctus-text-md-medium !text-gray-light-200'
            >
              Sections requiring updates
            </div>

            <div
              style={STYLES.text}
              className='aucctus-text-sm !text-gray-light-200'
            >
              The following sections are ineligible for AI editing until they
              are updated:
            </div>

            <ul className='ml-4 space-y-1'>
              {outdatedSections.map((section, index) => (
                <li
                  key={index}
                  style={STYLES.text}
                  className='aucctus-text-sm list-disc !text-gray-light-200'
                >
                  {section}
                </li>
              ))}
            </ul>
          </div>
        </ExpandCollapse>
      )}
    </div>
  );
};

export default OutdatedSectionsBanner;
