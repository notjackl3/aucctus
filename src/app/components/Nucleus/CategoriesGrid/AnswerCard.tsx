import React, { useMemo } from 'react';
import { Icon, Badge } from '@components';
import { cn } from '@libs/utils/react';
import LoadingMask from '@components/Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { NucleusReportAnswer } from '@libs/api/types';

interface AnswerCardProps {
  answer: NucleusReportAnswer;
  onEdit: (answer: NucleusReportAnswer) => void;
  onDelete: (answer: NucleusReportAnswer) => void;
  isEditingLoading?: boolean;
  isDeletingLoading?: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onEdit,
  onDelete,
  isEditingLoading = false,
  isDeletingLoading = false,
}) => {
  // Aggregate loading states
  const isLoading = useMemo(
    () => isEditingLoading || isDeletingLoading,
    [isEditingLoading, isDeletingLoading],
  );

  // Determine if this is AI-generated content using the actual field
  const isAiGenerated = answer.isAiGenerated;

  return (
    <div
      key={answer.uuid}
      className={cn(
        'relative rounded-lg border p-4',
        isAiGenerated
          ? 'aucctus-bg-brand-secondary aucctus-border-brand border-opacity-30'
          : 'aucctus-bg-tertiary aucctus-border-tertiary',
      )}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          {/* Source badge */}
          <div className='mb-3'>
            <Badge.AnswerSource isAiGenerated={isAiGenerated} />
          </div>
          {/* Answer content */}
          <p
            className={cn(
              'aucctus-text-sm mb-3 leading-relaxed',
              isAiGenerated
                ? 'aucctus-text-brand-primary'
                : 'aucctus-text-secondary',
            )}
          >
            {answer.answer}
          </p>
        </div>

        {/* Action buttons at top right */}
        <div className='ml-2 flex gap-1'>
          {/* Edit button - available for both AI and User answers */}
          <button
            className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
            onClick={() => onEdit(answer)}
            aria-label='Edit answer'
          >
            <Icon variant='edit' className='aucctus-stroke-secondary h-4 w-4' />
          </button>
          {/* Delete button - only for user-created answers */}
          {
            <button
              className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
              onClick={() => onDelete(answer)}
              aria-label='Delete answer'
            >
              <Icon
                variant='trash'
                className='aucctus-stroke-error-primary h-4 w-4'
              />
            </button>
          }
        </div>
      </div>

      {/* Bottom row spanning full width with sources left and updated right */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {/* Source badges using Badge.SourceInfo */}
          {answer.sources &&
            answer.sources
              .filter((source) => source.url) // Only show sources with valid URLs
              .slice(0, 3)
              .map((source) => (
                <Badge.SourceInfo
                  key={source.uuid}
                  source={source as any} // Type assertion since we filtered for valid URLs
                  badgeSize='small'
                  badgeClassName='aucctus-text-primary whitespace-nowrap'
                  onClick={() => window.open(source.url!, '_blank')}
                  showPublishedDate={false}
                />
              ))}
          {answer.sources &&
            answer.sources.filter((source) => source.url).length > 3 && (
              <div className='aucctus-bg-quaternary aucctus-text-quaternary aucctus-text-xs rounded-full px-2 py-1 font-medium'>
                +{answer.sources.filter((source) => source.url).length - 3} more
              </div>
            )}
        </div>

        {/* Last updated badge aligned to far right - only show if valid date */}
        {(() => {
          // Only render date badge if we have a valid date
          if (!answer.updatedAt) {
            return null;
          }

          const date = new Date(answer.updatedAt);

          // Check if date is valid
          if (isNaN(date.getTime())) {
            return null;
          }

          const month = date
            .toLocaleDateString('en-US', {
              month: 'short',
            })
            .toUpperCase();
          const year = date.toLocaleDateString('en-US', {
            year: '2-digit',
          });

          return (
            <div className='aucctus-bg-secondary flex items-center gap-1 rounded-md px-1.5 py-0.5'>
              <Icon
                variant='calendar'
                className='aucctus-stroke-tertiary h-2.5 w-2.5'
              />
              <span className='aucctus-text-xs aucctus-text-tertiary font-medium'>
                {`${month} '${year}`}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Loading overlay */}
      <LoadingMask isLoading={isLoading} />
    </div>
  );
};

export default React.memo(AnswerCard);
