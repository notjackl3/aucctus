import React from 'react';
import { Icon, Badge } from '@components';
import type { ISavedPossibleAnswer, ISavedUserAnswer } from '@libs/api/types';
import { cn } from '@libs/utils/react';

interface PossibleAnswerBadgeProps {
  answer: ISavedPossibleAnswer;
}

interface UserAnswerBadgeProps {
  answer: ISavedUserAnswer;
}

/**
 * PossibleAnswerBadge - Displays an AI-generated possible answer
 * Styled with subtle background to indicate AI-generated content
 */
export const PossibleAnswerBadge: React.FC<PossibleAnswerBadgeProps> = ({
  answer,
}) => {
  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all duration-200',
        'aucctus-bg-secondary aucctus-border-secondary',
        'hover:aucctus-bg-tertiary hover:shadow-sm',
      )}
    >
      <div className='flex items-start gap-2 p-3.5'>
        {/* Icon */}
        {/* Content */}
        <div className='flex-1'>
          <p className='aucctus-text-sm aucctus-text-primary leading-relaxed'>
            {answer.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * UserAnswerBadge - Displays a user-provided answer
 * Styled to indicate user input
 */
export const UserAnswerBadge: React.FC<UserAnswerBadgeProps> = ({ answer }) => {
  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-all duration-200',
        'aucctus-bg-secondary aucctus-border-secondary',
        'hover:aucctus-bg-tertiary hover:shadow-sm',
      )}
    >
      <div className='flex items-start gap-3 p-3.5'>
        {/* Icon */}
        <div
          className={cn(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg',
            'aucctus-bg-brand-primary',
          )}
        >
          <Icon
            variant='user-square'
            className='aucctus-stroke-brand-primary'
            height={12}
            width={12}
          />
        </div>

        {/* Content */}
        <div className='flex-1'>
          <p className='aucctus-text-sm aucctus-text-primary leading-relaxed'>
            {answer.answer}
          </p>
        </div>

        {/* User badge */}
        <Badge.WithIcon className='aucctus-bg-tertiary aucctus-border-tertiary aucctus-text-xs aucctus-text-brand-primary'>
          <Icon
            variant='check'
            className='aucctus-stroke-brand-primary'
            height={10}
            width={10}
          />
          <span>Yours</span>
        </Badge.WithIcon>
      </div>
    </div>
  );
};

/**
 * AnswerBadge - Combined export for both answer types
 */
export const AnswerBadge = {
  Possible: PossibleAnswerBadge,
  User: UserAnswerBadge,
};
