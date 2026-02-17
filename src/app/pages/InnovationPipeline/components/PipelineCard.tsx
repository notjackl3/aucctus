import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@components';
import { cn } from '@libs/utils/react';
import type { IConcept } from '@libs/api/types';
import { dateFormatter } from '@libs/utils/time';
import { getConceptStatusDisplayName } from '@libs/utils/concepts';
import { getStageConfigByStatus } from '../types/pipeline.types';
import { Clock } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface PipelineCardProps {
  concept: IConcept;
  isDragOverlay?: boolean;
}

const PipelineCard = ({
  concept,
  isDragOverlay = false,
}: PipelineCardProps) => {
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: concept.identifier,
      data: { concept },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  const handleClick = () => {
    if (!isDragging) {
      navigate(`/concept/${concept.identifier}`);
    }
  };

  // Get stage config for color styling
  const stageConfig = getStageConfigByStatus(concept.status);

  // Format the last modified date
  const lastModified = concept.updatedAt
    ? dateFormatter(concept.updatedAt)
    : null;

  // Get status display name
  const statusName = getConceptStatusDisplayName(concept.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        'group relative cursor-grab rounded-xl border bg-white p-4 shadow-sm transition-all duration-200',
        'hover:border-gray-300 hover:shadow-md',
        'dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600',
        {
          'opacity-40': isDragging && !isDragOverlay,
          'scale-105 cursor-grabbing shadow-xl': isDragOverlay,
          'ring-brand-500 ring-2 ring-offset-2': isDragOverlay,
        },
      )}
    >
      {/* Colored accent line at top */}
      <div
        className={cn(
          'absolute left-0 right-0 top-0 h-1 rounded-t-xl',
          stageConfig?.color.accent || 'bg-gray-300',
        )}
      />

      {/* Title */}
      <h4 className='mb-2 mt-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100'>
        {concept.title}
      </h4>

      {/* Summary */}
      <p className='mb-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-400'>
        {concept.summary}
      </p>

      {/* Status badge */}
      <div className='mb-3 flex items-center gap-2'>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            stageConfig?.color.bgLight || 'bg-gray-100',
            stageConfig?.color.text || 'text-gray-700',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              stageConfig?.color.dot || 'bg-gray-400',
            )}
          />
          {statusName}
        </span>

        {/* Financial type indicator */}
        {concept.financialProjectionType && (
          <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
            <DynamicIcon
              variant={
                concept.financialProjectionType === 'generate_revenue'
                  ? 'currency-dollar'
                  : 'piggy-bank'
              }
              className='h-3 w-3'
            />
            {concept.financialProjectionType === 'generate_revenue'
              ? 'Revenue'
              : 'Savings'}
          </span>
        )}
      </div>

      {/* Footer with creator and last modified */}
      <div className='flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800'>
        {/* Creator */}
        <div className='flex min-w-0 items-center gap-2'>
          <Avatar
            firstName={concept.createdBy?.firstName || ''}
            lastName={concept.createdBy?.lastName || ''}
            className='h-6 min-h-6 w-6 min-w-6 text-[10px]'
          />
          <span className='truncate text-xs text-gray-500 dark:text-gray-400'>
            {concept.createdBy?.firstName}{' '}
            {concept.createdBy?.lastName?.charAt(0)}.
          </span>
        </div>

        {/* Last modified */}
        {lastModified && (
          <div className='flex flex-shrink-0 items-center gap-1 text-gray-400'>
            <Clock className='h-3 w-3' />
            <span className='whitespace-nowrap text-xs'>{lastModified}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineCard;
