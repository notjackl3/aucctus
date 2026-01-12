import { FunctionComponent, useState } from 'react';
import { Icon, toast } from '@components';
import { IPocNextStep } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface INextStepsSectionProps {
  nextSteps: IPocNextStep[];
  goNoGoDate?: string;
  onPocStart?: () => void;
}

interface INextStepItemProps {
  step: IPocNextStep;
  index: number;
  isCompleted: boolean;
  onMarkDone: (uuid: string) => void;
}

const NextStepItem: FunctionComponent<INextStepItemProps> = ({
  step,
  index,
  isCompleted,
  onMarkDone,
}) => (
  <div
    className={cn(
      'flex items-start gap-4 rounded-lg p-5',
      'aucctus-bg-secondary',
      'transition-all duration-200',
      isCompleted && 'opacity-60',
    )}
  >
    {/* Step Number */}
    <div
      className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
        isCompleted
          ? 'bg-success-500'
          : 'bg-gradient-to-br from-primary-500 to-primary-600',
        'text-sm font-semibold text-white',
      )}
    >
      {isCompleted ? (
        <Icon variant='check' className='h-4 w-4 stroke-white stroke-2' />
      ) : (
        index + 1
      )}
    </div>

    {/* Content */}
    <div className='flex flex-1 flex-col gap-2'>
      <h4
        className={cn(
          'aucctus-text-primary aucctus-text-md-semibold',
          isCompleted && 'line-through',
        )}
      >
        {step.title}
      </h4>
      <p className='aucctus-text-secondary aucctus-text-sm'>
        {step.description}
      </p>

      {/* Meta */}
      <div className='flex items-center gap-4 pt-1'>
        {step.assignee && (
          <div className='flex items-center gap-1.5'>
            <Icon variant='user' className='aucctus-stroke-tertiary h-4 w-4' />
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              {step.assignee}
            </span>
          </div>
        )}
        {step.dueDate && (
          <div className='flex items-center gap-1.5'>
            <Icon
              variant='calendar'
              className='aucctus-stroke-tertiary h-4 w-4'
            />
            <span className='aucctus-text-tertiary aucctus-text-xs'>
              Due: {new Date(step.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {isCompleted && (
          <div className='flex items-center gap-1.5'>
            <Icon
              variant='check-circle-broken'
              className='h-4 w-4 stroke-success-500'
            />
            <span className='aucctus-text-xs font-medium text-success-600'>
              Completed
            </span>
          </div>
        )}
      </div>
    </div>

    {/* Action Button */}
    {!isCompleted ? (
      <button
        onClick={() => onMarkDone(step.uuid)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-3 py-1.5',
          'aucctus-bg-primary',
          'aucctus-text-brand-primary aucctus-text-sm-medium',
          'transition-colors',
          'hover:aucctus-bg-brand-secondary',
        )}
      >
        <Icon variant='check' className='h-4 w-4 stroke-current' />
        Mark Done
      </button>
    ) : (
      <button
        onClick={() => onMarkDone(step.uuid)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-3 py-1.5',
          'aucctus-bg-tertiary',
          'aucctus-text-tertiary aucctus-text-sm-medium',
          'transition-colors',
          'hover:aucctus-text-secondary',
        )}
      >
        <Icon variant='refresh' className='h-4 w-4 stroke-current' />
        Undo
      </button>
    )}
  </div>
);

const NextStepsSection: FunctionComponent<INextStepsSectionProps> = ({
  nextSteps,
  goNoGoDate,
  onPocStart,
}) => {
  const sortedSteps = [...nextSteps].sort((a, b) => a.order - b.order);

  // Ephemeral state for completed steps (will be replaced with API)
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(
    new Set(),
  );
  const [pocStarted, setPocStarted] = useState(false);

  const handleMarkDone = (uuid: string): void => {
    setCompletedStepIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(uuid)) {
        newSet.delete(uuid);
        toast.info('Step marked as incomplete');
      } else {
        newSet.add(uuid);
        toast.success('Step completed!');
      }
      return newSet;
    });
  };

  const handleStartPoc = (): void => {
    setPocStarted(true);
    toast.success(
      'POC Execution started! Good luck with your proof of concept.',
    );
    onPocStart?.();
  };

  const completedCount = completedStepIds.size;
  const totalCount = nextSteps.length;
  const allCompleted = completedCount === totalCount;

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
              variant='list'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </div>
          <div className='flex flex-col'>
            <h2 className='aucctus-text-primary aucctus-header-md-semibold'>
              Next Steps
            </h2>
            <span className='aucctus-text-tertiary aucctus-text-sm'>
              {completedCount}/{totalCount} completed
            </span>
          </div>
        </div>

        {/* Go/No-Go Date */}
        {goNoGoDate && (
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg px-5 py-3',
              'bg-gradient-to-r from-primary-500 to-primary-600',
            )}
          >
            <Icon variant='target' className='h-5 w-5 stroke-white' />
            <div className='flex flex-col'>
              <span className='text-xs text-white/80'>Go/No-Go Decision</span>
              <span className='font-semibold text-white'>
                {new Date(goNoGoDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between'>
          <span className='aucctus-text-tertiary aucctus-text-xs'>
            Progress
          </span>
          <span className='aucctus-text-primary aucctus-text-xs-semibold'>
            {Math.round((completedCount / totalCount) * 100)}%
          </span>
        </div>
        <div className='aucctus-bg-secondary h-2 w-full overflow-hidden rounded-full'>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              allCompleted
                ? 'bg-success-500'
                : 'bg-gradient-to-r from-primary-500 to-primary-600',
            )}
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Next Steps List */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {sortedSteps.map((step, index) => (
          <NextStepItem
            key={step.uuid}
            step={step}
            index={index}
            isCompleted={completedStepIds.has(step.uuid)}
            onMarkDone={handleMarkDone}
          />
        ))}
      </div>

      {/* CTA Banner */}
      {!pocStarted ? (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg p-6',
            allCompleted
              ? 'border border-success-200 bg-gradient-to-r from-success-50 to-success-100 dark:border-success-800 dark:from-success-950 dark:to-success-900'
              : 'border border-primary-200 bg-gradient-to-r from-primary-50 to-primary-100 dark:border-primary-800 dark:from-primary-950 dark:to-primary-900',
          )}
        >
          <div className='flex items-center gap-4'>
            <Icon
              variant='rocket'
              className={cn(
                'h-8 w-8',
                allCompleted
                  ? 'stroke-success-600 dark:stroke-success-400'
                  : 'stroke-primary-600 dark:stroke-primary-400',
              )}
            />
            <div className='flex flex-col'>
              <span className='aucctus-text-primary aucctus-text-md-semibold'>
                {allCompleted
                  ? 'All steps completed! Ready to launch.'
                  : 'Ready to begin your POC?'}
              </span>
              <span className='aucctus-text-secondary aucctus-text-sm'>
                {allCompleted
                  ? 'Start your proof of concept execution now'
                  : 'Complete the next steps above to kick off your proof of concept'}
              </span>
            </div>
          </div>
          <button
            onClick={handleStartPoc}
            className={cn(
              'btn flex items-center gap-2 px-6',
              allCompleted ? 'btn-primary' : 'btn-secondary',
            )}
          >
            <Icon variant='play' className='h-4 w-4 stroke-current' />
            Start POC Execution
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-between rounded-lg p-6',
            'bg-gradient-to-r from-success-50 to-success-100',
            'dark:from-success-950 dark:to-success-900',
            'border border-success-200 dark:border-success-800',
          )}
        >
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-success-500'>
              <Icon variant='check' className='h-6 w-6 stroke-white stroke-2' />
            </div>
            <div className='flex flex-col'>
              <span className='aucctus-text-primary aucctus-text-md-semibold'>
                POC Execution Started
              </span>
              <span className='aucctus-text-secondary aucctus-text-sm'>
                Your proof of concept is now in progress. Good luck!
              </span>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-lg bg-success-100 px-4 py-2 dark:bg-success-900'>
            <Icon
              variant='loading-02'
              className='h-4 w-4 animate-spin stroke-success-600'
            />
            <span className='aucctus-text-sm-medium text-success-700 dark:text-success-300'>
              In Progress
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextStepsSection;
