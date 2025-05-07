import React, { useState } from 'react';
import { Icon, Container } from '@components';
import { ICustomerJob } from '@libs/api/types';
import { cn } from '@libs/utils/react';

/**
 * Props for AiInsight component.
 * @param topJob The highest priority job (ICustomerJob)
 * @param textColorClass Optional class for customizing the label text color
 * @param iconStrokeClass Optional class for customizing the icon stroke color
 * @param customInsight Optional custom insight text to display instead of the default insight
 */
interface AiInsightProps {
  topJob?: ICustomerJob;
  textColorClass?: string;
  iconStrokeClass?: string;
  customInsight?: string;
}

// Component styles
const containerStyles = 'aucctus-border-secondary-subtle mt-2 border-t pt-2';
const buttonStyles = 'flex w-full items-center justify-between py-1.5';
const iconContainerStyles =
  'aucctus-bg-primary aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-lg border-2';
const labelStyles = 'aucctus-text-xs-medium';
const contentStyles = 'px-2 py-2';
const textStyles = 'aucctus-text-secondary aucctus-text-sm';

const AiInsight: React.FC<AiInsightProps> = ({
  topJob,
  textColorClass = 'aucctus-text-brand-primary',
  iconStrokeClass = 'aucctus-stroke-brand-primary',
  customInsight,
}) => {
  const [insightExpanded, setInsightExpanded] = useState(false);

  return (
    <div className={containerStyles}>
      <button
        className={cn(buttonStyles, textColorClass)}
        onClick={() => setInsightExpanded((prev) => !prev)}
      >
        <div className='flex items-center gap-2'>
          <span className={iconContainerStyles}>
            <Icon
              variant='ai-conclusion'
              height={14}
              width={14}
              className={iconStrokeClass}
            />
          </span>
          <span className={cn(labelStyles, textColorClass)}>
            AUCCTUS INSIGHT
          </span>
        </div>
        <Icon
          variant={insightExpanded ? 'chevronup' : 'chevrondown'}
          height={12}
          width={12}
          className={iconStrokeClass}
        />
      </button>
      <Container.Collapsible open={insightExpanded}>
        <div className={contentStyles}>
          <p className={textStyles}>
            {customInsight ||
              `This job ranks highest with a priority score of ${topJob?.order || 0}/10 as it represents \
                  the core daily challenge that directly impacts the user's routine and productivity.`}
          </p>
        </div>
      </Container.Collapsible>
    </div>
  );
};

export default React.memo(AiInsight);
