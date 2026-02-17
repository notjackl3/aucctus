import { useDroppable } from '@dnd-kit/core';
import { cn } from '@libs/utils/react';
import type { IConcept } from '@libs/api/types';
import type { PipelineStageConfig } from '../types/pipeline.types';
import PipelineCard from './PipelineCard';
import EmptyColumnState from './EmptyColumnState';
import { DynamicIcon } from '@libs/utils/iconMap';

interface PipelineColumnProps {
  stage: PipelineStageConfig;
  concepts: IConcept[];
}

const PipelineColumn = ({ stage, concepts }: PipelineColumnProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.key,
  });

  return (
    <div className='flex min-w-[300px] flex-1 flex-col'>
      {/* Column Header */}
      <div
        className={cn(
          'mb-3 rounded-xl p-3 transition-all duration-200',
          stage.color.bgLight,
          isOver && 'ring-2 ring-offset-1',
          isOver && stage.color.border,
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {/* Stage icon */}
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                stage.color.bg,
              )}
            >
              <DynamicIcon
                variant={stage.icon}
                className='h-4 w-4 stroke-white'
              />
            </div>
            {/* Stage name */}
            <span className={cn('text-sm font-semibold', stage.color.text)}>
              {stage.label}
            </span>
          </div>
          {/* Count badge */}
          <span
            className={cn(
              'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white',
              stage.color.bg,
            )}
          >
            {concepts.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-3 rounded-xl p-2 transition-all duration-200',
          'bg-gray-50 dark:bg-gray-800/50',
          isOver && 'bg-gray-100 dark:bg-gray-800',
          isOver && 'ring-2 ring-inset',
          isOver && stage.color.border,
        )}
      >
        {concepts.length === 0 ? (
          <EmptyColumnState stageName={stage.label} />
        ) : (
          concepts.map((concept) => (
            <PipelineCard key={concept.uuid} concept={concept} />
          ))
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;
