import React from 'react';
import { Icon } from '@components';
import { ProjectionSettings } from '../../shared/types';
import MonteCarloChart from './MonteCarloChart';
import AboutMonteCarlo from './AboutMonteCarlo';

interface ProjectionsTabProps {
  projectionSettings?: ProjectionSettings;
}

const ProjectionsTab: React.FC<ProjectionsTabProps> = ({
  projectionSettings = {
    growthRate: 0.15,
    timeHorizon: 5,
    churnRate: 0.12,
    initialCustomers: 200,
    costSavingsPerUser: 0,
  },
}) => {
  return (
    <div className='relative space-y-6'>
      {/* Blurred background content */}
      <div className='pointer-events-none blur-[10px]'>
        <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
          <div className='mb-4 flex items-center gap-2'>
            <Icon
              variant='trendup'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h3 className='aucctus-header-xs-medium aucctus-text-primary'>
              Revenue Projections
            </h3>
          </div>

          <div className='mb-6'>
            <p className='aucctus-text-sm aucctus-text-secondary'>
              These projections simulate possible financial outcomes based on
              your business model, market sizing, and unit economics inputs. It
              helps you understand the range and probability of possible
              outcomes.
            </p>
          </div>

          {/* Monte Carlo Chart */}
          <MonteCarloChart
            initialInvestment={150000}
            timeHorizon={projectionSettings.timeHorizon}
            hideTitle={false}
          />

          {/* About Monte Carlo Section */}
          <AboutMonteCarlo />
        </div>
      </div>

      {/* Coming Soon overlay card */}
      <div
        style={{ animationDelay: '0.5s' }}
        className='absolute inset-0 flex animate-fade-in items-center justify-center pb-32 opacity-0'
      >
        <div className='aucctus-bg-tertiary aucctus-border-primary rounded-lg border-2 bg-opacity-50 px-8 py-6 shadow-lg backdrop-blur-sm'>
          <div className='flex items-center justify-center gap-3'>
            <Icon
              variant='clock'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
            <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
              Coming Soon
            </h3>
          </div>
          <p className='aucctus-text-sm aucctus-text-secondary mt-2'>
            Projections feature is under development
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsTab;
