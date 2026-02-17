import React from 'react';
import { IUserJourneyStep } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { AlertCircle, Briefcase, Pencil, Trash2 } from 'lucide-react';

interface StepCardProps {
  step: IUserJourneyStep;
  index: number;
  totalSteps: number;
  editable?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  productName?: string;
  painPointLabel?: string;
  jobLabel?: string;
  interventionLabel?: string;
  relationTypes?: Record<string, string>;
}

// Color constants updated to match CustomerJobs.tsx and CustomerPains.tsx
// Jobs colors
const JOB_ICON_COLOR = 'stroke-orangeDark-900';
const JOB_ICON_BG = 'bg-orangeDark-100';
const JOB_TEXT_COLOR = 'text-orangeDark-900';
const JOB_BADGE_BG = 'bg-orangeDark-100';
const JOB_BADGE_TEXT = 'text-orangeDark-900';
const JOB_CARD_BG = 'bg-gray-light-25';
const JOB_CARD_BORDER = 'border-orangeDark-200';

// Pain colors
const PAIN_ICON_COLOR = 'stroke-orangeDark-600';
const PAIN_ICON_BG = 'bg-orangeDark-100';
const PAIN_TEXT_COLOR = 'text-orangeDark-600';
const PAIN_BADGE_BG = 'bg-orangeDark-100';
const PAIN_BADGE_TEXT = 'text-orangeDark-600';
const PAIN_CARD_BG = 'bg-gray-light-25';
const PAIN_CARD_BORDER = 'border-orangeDark-200';

// Intervention colors
const INTERVENTION_BADGE_BG = 'bg-orangeDark-900';
const INTERVENTION_BADGE_TEXT = 'text-white';
const INTERVENTION_CARD_BG = 'bg-gray-light-25';
const INTERVENTION_CARD_BORDER = 'border-orangeDark-900';
const INTERVENTION_TEXT_COLOR = 'text-orangeDark-900';

// Shared styles
const baseBadgeStyles =
  'absolute -top-6 left-1/2 z-10 flex max-w-[95%] -translate-x-1/2 transform items-center gap-1 rounded-full px-2 py-0.5 text-[10px]';
const baseCardStyles =
  'aucctus-border-secondary group relative flex flex-col rounded-lg p-3 border';
const baseNumberContainerStyles =
  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full';
const baseTitleStyles = 'aucctus-text-sm-semibold';
const descriptionStyles = 'aucctus-text-tertiary aucctus-text-xs';
const actionButtonContainerStyles =
  'flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100';
const editButtonStyles =
  'aucctus-bg-secondary-hover flex h-6 w-6 items-center justify-center rounded-full p-0';
const deleteButtonStyles =
  'aucctus-bg-secondary-hover aucctus-text-error-primary flex h-6 w-6 items-center justify-center rounded-full p-0';

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  editable = false,
  onEdit,
  onRemove,
  productName = 'Product',
  painPointLabel = 'Pain Point',
  jobLabel = 'Job to be Done',
  relationTypes,
}) => {
  const isInterventionStep =
    relationTypes && step.relationType === relationTypes.MOMENT_OF_INTERVENTION;
  const isJobStep = relationTypes && step.relationType === relationTypes.JTBD;
  const isPainStep = relationTypes && step.relationType === relationTypes.PAIN;

  const getRelationshipBadge = () => {
    if (isJobStep) {
      return (
        <div className={cn(baseBadgeStyles, JOB_BADGE_BG, JOB_BADGE_TEXT)}>
          <Briefcase size={12} className={JOB_ICON_COLOR} />
          <span className='truncate'>{jobLabel}</span>
        </div>
      );
    } else if (isPainStep) {
      return (
        <div className={cn(baseBadgeStyles, PAIN_BADGE_BG, PAIN_BADGE_TEXT)}>
          <AlertCircle size={12} className={PAIN_ICON_COLOR} />
          <span className='truncate'>{painPointLabel}</span>
        </div>
      );
    }
    return null;
  };

  // Determine the card styling based on relation type
  let cardStyle = baseCardStyles;
  if (isInterventionStep) {
    cardStyle = `${baseCardStyles} ${INTERVENTION_CARD_BG} ${INTERVENTION_CARD_BORDER}`;
  } else if (isJobStep) {
    cardStyle = `${baseCardStyles} ${JOB_CARD_BG} ${JOB_CARD_BORDER}`;
  } else if (isPainStep) {
    cardStyle = `${baseCardStyles} ${PAIN_CARD_BG} ${PAIN_CARD_BORDER}`;
  } else {
    cardStyle = `${baseCardStyles} aucctus-border-secondary aucctus-bg-primary`;
  }

  // Determine number container styling
  let numberContainerStyle = baseNumberContainerStyles;
  if (isInterventionStep) {
    numberContainerStyle = `${baseNumberContainerStyles} bg-orangeDark-900 text-white`;
  } else if (isJobStep) {
    numberContainerStyle = `${baseNumberContainerStyles} ${JOB_ICON_BG} ${JOB_TEXT_COLOR}`;
  } else if (isPainStep) {
    numberContainerStyle = `${baseNumberContainerStyles} ${PAIN_ICON_BG} ${PAIN_TEXT_COLOR}`;
  } else {
    numberContainerStyle = `${baseNumberContainerStyles} aucctus-bg-secondary-subtle`;
  }

  // Determine title text color
  let titleTextStyle = baseTitleStyles;
  if (isInterventionStep) {
    titleTextStyle = `${baseTitleStyles} ${INTERVENTION_TEXT_COLOR}`;
  } else if (isJobStep) {
    titleTextStyle = `${baseTitleStyles} ${JOB_TEXT_COLOR}`;
  } else if (isPainStep) {
    titleTextStyle = `${baseTitleStyles} ${PAIN_TEXT_COLOR}`;
  } else {
    titleTextStyle = `${baseTitleStyles} aucctus-text-primary`;
  }

  return (
    <div className='relative flex flex-col'>
      {isInterventionStep && (
        <div className='absolute -top-6 left-1/2 z-10 flex w-full -translate-x-1/2 transform justify-center'>
          <div
            className={cn(
              'max-w-[95%] truncate whitespace-nowrap rounded-full px-3 py-0.5 text-[10px]',
              INTERVENTION_BADGE_BG,
              INTERVENTION_BADGE_TEXT,
            )}
          >
            {productName}
          </div>
        </div>
      )}

      {!isInterventionStep && getRelationshipBadge()}

      <div className={cardStyle}>
        <div className='flex h-full items-start gap-2'>
          <div className={numberContainerStyle}>
            <span className='aucctus-text-xs-semibold'>{index + 1}</span>
          </div>

          <div className='flex h-full flex-1 flex-col justify-between'>
            <div>
              <div className='mb-1 flex flex-wrap items-center gap-1'>
                <h3 className={titleTextStyle}>{step.title}</h3>
              </div>

              <p className={descriptionStyles}>{step.description}</p>
            </div>

            {editable && (
              <div className={actionButtonContainerStyles}>
                {onEdit && (
                  <button className={editButtonStyles} onClick={onEdit}>
                    <Pencil size={12} />
                    <span className='sr-only'>Edit</span>
                  </button>
                )}

                {onRemove && (
                  <button className={deleteButtonStyles} onClick={onRemove}>
                    <Trash2
                      size={12}
                      className='aucctus-stroke-error-primary'
                    />
                    <span className='sr-only'>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(StepCard);
