import { FunctionComponent } from 'react';
import { Icon } from '@components';
import { IPocObjective } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface IObjectivesSectionProps {
  objectives: IPocObjective[];
}

const ObjectiveCard: FunctionComponent<{ objective: IPocObjective }> = ({
  objective,
}) => (
  <div
    className={cn(
      'flex flex-col gap-4 rounded-lg p-6',
      'aucctus-bg-secondary',
      'transition-all duration-200',
      'hover:shadow-md',
    )}
  >
    {/* Header */}
    <div className='flex items-start gap-3'>
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          'bg-gradient-to-br from-primary-500 to-primary-600',
          'text-sm font-semibold text-white',
        )}
      >
        {objective.order}
      </div>
      <div className='flex flex-col gap-1'>
        <h4 className='aucctus-text-primary aucctus-text-md-semibold'>
          {objective.title}
        </h4>
        <p className='aucctus-text-secondary aucctus-text-sm'>
          {objective.description}
        </p>
      </div>
    </div>

    {/* Hypothesis */}
    <div className='aucctus-bg-primary flex flex-col gap-2 rounded-lg p-4'>
      <div className='flex items-center gap-2'>
        <Icon
          variant='help-circle'
          className='aucctus-stroke-brand-primary h-4 w-4'
        />
        <span className='aucctus-text-brand-primary aucctus-text-xs-semibold uppercase tracking-wider'>
          Hypothesis to Validate
        </span>
      </div>
      <p className='aucctus-text-primary aucctus-text-sm italic'>
        &ldquo;{objective.hypothesisToValidate}&rdquo;
      </p>
    </div>

    {/* Success Criteria */}
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <Icon
          variant='check-circle-broken'
          className='aucctus-stroke-success-500 h-4 w-4'
        />
        <span className='aucctus-text-secondary aucctus-text-xs-semibold uppercase tracking-wider'>
          Success Criteria
        </span>
      </div>
      <p className='aucctus-text-primary aucctus-text-sm'>
        {objective.successCriteria}
      </p>
    </div>
  </div>
);

const ObjectivesSection: FunctionComponent<IObjectivesSectionProps> = ({
  objectives,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 rounded-xl p-8',
        'aucctus-bg-primary',
        'aucctus-border-primary border',
        'shadow-sm',
      )}
    >
      {/* Section Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
            <Icon
              variant='target'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
              Strategic Objectives
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              Key hypotheses to validate during the POC
            </span>
          </div>
        </div>
        <span className='aucctus-text-tertiary aucctus-text-sm'>
          {objectives.length} objectives
        </span>
      </div>

      {/* Objectives Grid */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {objectives.map((objective) => (
          <ObjectiveCard key={objective.uuid} objective={objective} />
        ))}
      </div>
    </div>
  );
};

export default ObjectivesSection;
