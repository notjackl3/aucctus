import { Badge, ComponentTooltip, Header, Icon } from '@components';
import { cn } from '@libs/utils/react';
import { PIPELINE_STAGES, type ConceptsByStage } from '../types/pipeline.types';

interface PipelineHeaderProps {
  totalCount: number;
  conceptsByStage: ConceptsByStage;
}

const PipelineHeader = ({
  totalCount,
  conceptsByStage,
}: PipelineHeaderProps) => {
  return (
    <div className='mb-6'>
      {/* Header row */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        {/* Title section */}
        <div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='dataflow-04'
                height={28}
                width={28}
                className='aucctus-stroke-brand-primary'
              />
              <Header.One text='Innovation Pipeline' />
            </div>
            <ComponentTooltip
              tip={
                <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
                  <p className='aucctus-text-primary aucctus-text-xs max-w-[200px]'>
                    This is an early feature and may make mistakes.
                  </p>
                </div>
              }
            >
              <Badge.Beta size='sm' />
            </ComponentTooltip>
          </div>
          <p className='aucctus-text-md aucctus-text-secondary mt-1'>
            Track concepts from{' '}
            <span className='aucctus-text-brand-primary font-semibold'>
              discovery
            </span>{' '}
            through{' '}
            <span className='aucctus-text-brand-primary font-semibold'>
              scaling
            </span>
            .
          </p>
        </div>

        {/* Stats row */}
        <div className='flex items-center gap-2'>
          {/* Total count */}
          <div className='aucctus-bg-secondary flex items-center gap-3 rounded-xl px-4 py-2.5'>
            <div className='text-center'>
              <div className='aucctus-text-primary text-2xl font-bold'>
                {totalCount}
              </div>
              <div className='aucctus-text-tertiary text-xs font-medium'>
                Total
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className='aucctus-bg-quaternary h-10 w-px' />

          {/* Stage counts */}
          {PIPELINE_STAGES.map((stage) => {
            const count = conceptsByStage[stage.key]?.length || 0;
            return (
              <div
                key={stage.key}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2',
                  stage.color.bgLight,
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg',
                    stage.color.bg,
                  )}
                >
                  <Icon
                    variant={stage.icon}
                    className='h-3.5 w-3.5 stroke-white'
                  />
                </div>
                <div className='text-center'>
                  <div className={cn('text-lg font-bold', stage.color.text)}>
                    {count}
                  </div>
                  <div className='aucctus-text-tertiary whitespace-nowrap text-[10px] font-medium'>
                    {stage.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineHeader;
