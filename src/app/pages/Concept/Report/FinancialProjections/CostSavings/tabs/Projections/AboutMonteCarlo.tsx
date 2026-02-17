import React, { useState } from 'react';
import { cn } from '@libs/utils/react';
import { ExpandCollapse } from '@hooks/animation/animation.hook';
import { ChevronRight, HelpCircle } from 'lucide-react';

const AboutMonteCarlo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className='aucctus-border-secondary mt-4 overflow-hidden rounded-lg border'>
      <header
        className='aucctus-bg-primary-hover flex cursor-pointer items-center justify-between p-4'
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex items-center gap-2'>
          <HelpCircle className='aucctus-stroke-brand-primary h-5 w-5' />
          <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
            About Monte Carlo Simulation
          </h3>
        </div>
        <ChevronRight
          className={cn(
            'aucctus-stroke-secondary h-5 w-5 transition-transform',
            { 'rotate-90': isOpen },
          )}
        />
      </header>

      <ExpandCollapse
        isExpanded={isOpen}
        withOpacity
        maxHeight={500}
        duration={0.3}
        className='overflow-hidden'
      >
        <div className='space-y-4 p-4'>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Monte Carlo simulation generates thousands of possible scenarios to
            help forecast financial outcomes when uncertainty is present,
            showing the range of possible outcomes and their probabilities.
          </p>

          {/* Interpretation Guide */}
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <LegendItem
              color='#7c3aed'
              title='Median Line'
              description='Most likely path (50th percentile)'
            />
            <LegendItem
              color='rgba(124,58,237,0.15)'
              title='Shaded Region'
              description='80% of possible outcomes (10th-90th percentiles)'
            />
            <LegendItem
              color='#16a34a'
              title='Best Case'
              description='Most favorable outcome'
            />
            <LegendItem
              color='#dc2626'
              title='Worst Case'
              description='Least favorable outcome'
            />
          </div>

          <div className='flex justify-end'>
            <button className='aucctus-text-brand-primary aucctus-text-sm flex items-center gap-1'>
              Learn more
              <ChevronRight className='aucctus-stroke-brand-primary h-3 w-3' />
            </button>
          </div>
        </div>
      </ExpandCollapse>
    </section>
  );
};

// Extract legend item to a separate component
type LegendItemProps = {
  color: string;
  title: string;
  description: string;
};

const LegendItem = ({ color, title, description }: LegendItemProps) => (
  <div className='flex items-start gap-2'>
    <div
      className='mt-0.5 h-4 w-4 rounded-full'
      style={{ backgroundColor: color }}
    />
    <p className='aucctus-text-sm-semibold aucctus-text-primary'>{title}</p>
    <p className='aucctus-text-xs aucctus-text-tertiary'>{description}</p>
  </div>
);

export default AboutMonteCarlo;
