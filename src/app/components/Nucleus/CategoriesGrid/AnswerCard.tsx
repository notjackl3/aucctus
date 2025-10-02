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
  isAdmin: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onEdit,
  onDelete,
  isEditingLoading = false,
  isDeletingLoading = false,
  isAdmin,
}) => {
  // Aggregate loading states
  const isLoading = useMemo(
    () => isEditingLoading || isDeletingLoading,
    [isEditingLoading, isDeletingLoading],
  );

  // Determine if this is AI-generated content using the actual field
  const isAiGenerated = answer.isAiGenerated;

  // Helper function to create rich source description
  const createSourceDescription = (source: any) => {
    const hasDescription = source.description;
    const hasCitations = source.citations;
    const hasConfidence = source.confidenceLevel;

    if (!hasDescription && !hasCitations && !hasConfidence) {
      return null; // Will fallback to URL
    }

    // Parse citations - handle bracket-separated format [citation1],[citation2] or single citation
    const parsedCitations = hasCitations
      ? (() => {
          const citationsString = source.citations.trim();

          // Check if it contains bracket separators (], [)
          if (citationsString.includes('], [')) {
            // Split by '], [' pattern for bracket-separated citations
            const citations = citationsString
              .split('], [')
              .map((citation: string) => {
                // Clean leading [ and trailing ] from citations
                let cleaned = citation
                  .replace(/^\[/, '')
                  .replace(/\]$/, '')
                  .trim();
                // Remove existing quotes to prevent double-quoting
                cleaned = cleaned.replace(/^[""]/, '').replace(/[""]$/, '');
                return cleaned;
              })
              .filter((citation: string) => citation.length > 0);

            return citations;
          }

          // Check if it's a single bracketed citation
          if (
            citationsString.startsWith('[') &&
            citationsString.endsWith(']')
          ) {
            let cleaned = citationsString
              .replace(/^\[/, '')
              .replace(/\]$/, '')
              .trim();
            // Remove existing quotes to prevent double-quoting
            cleaned = cleaned.replace(/^[""]/, '').replace(/[""]$/, '');
            return [cleaned];
          }

          // Otherwise treat as single citation
          let cleaned = citationsString;
          // Remove existing quotes to prevent double-quoting
          cleaned = cleaned.replace(/^[""]/, '').replace(/[""]$/, '');
          return [cleaned];
        })()
      : [];

    return (
      <div className='space-y-2'>
        {hasDescription && (
          <div className='aucctus-text-xs aucctus-text-secondary'>
            {source.description}
          </div>
        )}
        {hasCitations && parsedCitations.length > 0 && (
          <div className='aucctus-text-xs aucctus-text-tertiary space-y-1 italic'>
            {parsedCitations.map((citation: string, index: number) => (
              <div key={index}>&ldquo;{citation}&rdquo;</div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
          {/* Edit button - available for both AI and User answers but only for admin */}
          <button
            className={cn(
              'rounded-md border p-2 shadow-sm',
              isAdmin
                ? 'aucctus-bg-primary-hover aucctus-border-secondary cursor-pointer'
                : 'aucctus-bg-disabled aucctus-border-disabled cursor-not-allowed opacity-50',
            )}
            onClick={isAdmin ? () => onEdit(answer) : undefined}
            disabled={!isAdmin}
            aria-label='Edit answer'
            title={isAdmin ? 'Edit answer' : 'Admin access required'}
          >
            <Icon
              variant='edit'
              className={cn(
                'h-4 w-4',
                isAdmin
                  ? 'aucctus-stroke-secondary'
                  : 'aucctus-stroke-disabled',
              )}
            />
          </button>
          {/* Delete button - only for admin users */}
          <button
            className={cn(
              'rounded-md border p-2 shadow-sm',
              isAdmin
                ? 'aucctus-bg-primary-hover aucctus-border-secondary cursor-pointer'
                : 'aucctus-bg-disabled aucctus-border-disabled cursor-not-allowed opacity-50',
            )}
            onClick={isAdmin ? () => onDelete(answer) : undefined}
            disabled={!isAdmin}
            aria-label='Delete answer'
            title={isAdmin ? 'Delete answer' : 'Admin access required'}
          >
            <Icon
              variant='trash'
              className={cn(
                'h-4 w-4',
                isAdmin
                  ? 'aucctus-stroke-error-primary'
                  : 'aucctus-stroke-disabled',
              )}
            />
          </button>
        </div>
      </div>

      {/* Bottom row spanning full width with sources left and updated right */}
      <div className='flex items-start justify-between'>
        <div className='mr-3 flex flex-1 flex-wrap items-center gap-2'>
          {/* Source badges using Badge.SourceInfo */}
          {answer.sources &&
            answer.sources
              .filter((source) => {
                // Show sources with URLs (web sources) OR sources without URLs that might be user uploaded files
                return source.url || source.title; // User uploaded files might not have URLs but will have titles
              })
              .map((source) => (
                <Badge.SourceInfo
                  key={source.uuid}
                  source={source as any}
                  badgeSize='small'
                  badgeClassName='aucctus-text-primary whitespace-nowrap'
                  onClick={
                    source.url
                      ? () => window.open(source.url!, '_blank')
                      : undefined
                  }
                  showPublishedDate={false}
                  sourceDescription={createSourceDescription(source)}
                />
              ))}
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
