import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square } from 'lucide-react';
import { IConcept } from '@libs/api/types';
import { IConceptPrioritySummary } from '@libs/api/types/concept/concept_priority';
import { cn } from '@libs/utils/react';
import {
  canOpenConceptWhilePending,
  getConceptStatusDisplayName,
  getConceptStatusStyles,
} from '@libs/utils/concepts';
import { Button, Text } from '@components';
import { PriorityCell } from '@components/Tables/ConceptBank/PriorityCell';
import images from '@assets/img';

interface ConceptBankCardProps {
  concept: IConcept;
  isSelected: boolean;
  onToggleSelect: (uuid: string) => void;
  onOpen: (identifier: string) => void;
  onGenerate: (uuid: string) => void;
  onRetry: (uuid: string) => void;
  prioritySummary?: IConceptPrioritySummary | null;
}

const ConceptBankCard: React.FC<ConceptBankCardProps> = ({
  concept,
  isSelected,
  onToggleSelect,
  onOpen,
  onGenerate,
  onRetry,
  prioritySummary,
}) => {
  const statusStyles = getConceptStatusStyles(concept.status);
  const statusLabel = getConceptStatusDisplayName(concept.status);

  const description =
    concept.summary || concept.valueProposition || 'No description available';

  const reportStatus = concept.reportStatusAggregate;
  const canOpenWhilePending = canOpenConceptWhilePending(
    concept.reportStatusBySection,
    concept.dateReportCompleted,
  );

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(concept.uuid);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    switch (reportStatus) {
      case 'complete':
        onOpen(concept.identifier);
        break;
      case 'pending':
        if (canOpenWhilePending) {
          onOpen(concept.identifier);
        }
        break;
      case 'notStarted':
        onGenerate(concept.uuid);
        break;
      case 'error':
        onRetry(concept.uuid);
        break;
    }
  };

  // Determine user to display in footer
  const modifiedByUser = concept.lastModifiedBy;
  const createdByUser = concept.createdBy;

  const displayFirstName =
    modifiedByUser?.firstName ?? createdByUser?.firstName ?? '';
  const displayLastName =
    modifiedByUser?.lastName ?? createdByUser?.lastName ?? '';
  const displayName = `${displayFirstName} ${displayLastName}`.trim();
  const displayInitials =
    `${displayFirstName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className={cn(
        'aucctus-bg-primary group relative flex h-full flex-col overflow-hidden rounded-xl border-2 shadow-sm transition-colors duration-300',
        {
          'border-green-500 shadow-md': isSelected,
          'aucctus-border-secondary hover:aucctus-border-brand/50': !isSelected,
        },
      )}
    >
      {/* Selection Checkbox - top right, over image */}
      <motion.button
        aria-label={
          isSelected ? `Deselect ${concept.title}` : `Select ${concept.title}`
        }
        aria-pressed={isSelected}
        onClick={handleImageClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className='absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded transition-colors'
      >
        {isSelected ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.3 }}
          >
            <CheckSquare className='h-5 w-5 text-green-500 drop-shadow-[0_1px_4px_rgba(34,197,94,0.6)]' />
          </motion.div>
        ) : (
          <Square className='h-5 w-5 stroke-white opacity-0 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] transition-opacity group-hover:opacity-100' />
        )}
      </motion.button>

      {/* Image - clicking selects the card */}
      <div
        className='h-[160px] w-full flex-shrink-0 cursor-pointer overflow-hidden'
        onClick={handleImageClick}
      >
        {concept.conceptImageUrl ? (
          <img
            src={concept.conceptImageUrl}
            alt={concept.title}
            className='h-full w-full object-cover'
          />
        ) : (
          <div
            className='h-full w-full bg-cover bg-center'
            style={{ backgroundImage: `url(${images.nucleusBrandGradient})` }}
          />
        )}
      </div>

      {/* Content area with padding */}
      <div className='flex flex-1 flex-col px-5 pb-4 pt-3'>
        {/* Badges Row: status on left, score gauge on right */}
        <div className='mb-2 flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-xs font-medium',
              statusStyles.bg,
              statusStyles.text,
            )}
          >
            {statusLabel}
          </span>

          <div className='ml-auto' onClick={(e) => e.stopPropagation()}>
            <PriorityCell
              conceptUuid={concept.uuid}
              conceptTitle={concept.title}
              conceptDescription={concept.summary}
              conceptImage={concept.conceptImageUrl}
              prioritySummary={prioritySummary}
              isConceptComplete={concept.reportStatusAggregate === 'complete'}
            />
          </div>
        </div>

        {/* Title + Description (expandable) */}
        <div className='mb-auto'>
          <Text.Collapsible
            title={concept.title}
            titleClassName='text-sm font-bold leading-tight'
            description={description}
            descriptionClassName='text-xs leading-relaxed'
            maxDescriptionHeight={35}
            truncationClassName='line-clamp-2'
          />
        </div>

        {/* Footer: user info + action button */}
        <div className='aucctus-border-secondary mt-3 flex items-center justify-between border-t pt-3'>
          {/* User initials + name */}
          <div className='flex items-center gap-2'>
            {displayName && (
              <>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'>
                  {displayInitials}
                </div>
                <span className='aucctus-text-secondary text-xs font-medium'>
                  {displayName}
                </span>
              </>
            )}
          </div>

          {/* Action button */}
          <div onClick={(e) => e.stopPropagation()}>
            <Button.ConceptGenerate
              variant={reportStatus}
              onClick={handleActionClick}
              reportStatusBySection={concept.reportStatusBySection}
              dateReportStarted={concept.dateReportStarted}
              dateReportCompleted={concept.dateReportCompleted}
              conceptUuid={concept.uuid}
              size='xs'
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConceptBankCard;
