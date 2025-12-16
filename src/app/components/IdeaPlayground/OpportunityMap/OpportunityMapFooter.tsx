import React, { useState } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

interface OpportunityMapFooterProps {
  selectedIdeasCount: number;
  onSaveConcepts: () => void;
  onGenerateReports: () => void;
  onRegenerateWithFeedback: (feedback: string) => void;
  isRegenerating: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

const MAX_FEEDBACK_LENGTH = 1000;

const OpportunityMapFooter: React.FC<OpportunityMapFooterProps> = ({
  selectedIdeasCount,
  onSaveConcepts,
  onGenerateReports,
  onRegenerateWithFeedback,
  isRegenerating,
  isSaving = false,
  disabled = false,
}) => {
  const [feedback, setFeedback] = useState('');

  const canSubmit =
    feedback.trim().length > 0 &&
    feedback.length <= MAX_FEEDBACK_LENGTH &&
    !isRegenerating &&
    !disabled;

  const handleSubmit = () => {
    if (canSubmit) {
      onRegenerateWithFeedback(feedback.trim());
      setFeedback('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='flex border-t border-white/10 bg-black/20 backdrop-blur-md'>
      {/* Left Side - Feedback Input */}
      <div className='flex w-1/2 items-center gap-2 border-r border-white/10 px-4 py-3'>
        <div className='flex flex-1 items-center gap-2'>
          <input
            type='text'
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Provide feedback to regenerate ideas...'
            maxLength={MAX_FEEDBACK_LENGTH}
            disabled={isRegenerating || disabled}
            className={cn(
              'aucctus-text-white flex-1 rounded-md border border-white/20 bg-white/10 px-3 py-2 transition-all duration-200 placeholder:text-gray-light-400',
              'focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/30',
              {
                'cursor-not-allowed opacity-50': isRegenerating || disabled,
              },
            )}
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border p-2 transition-all duration-200',
              {
                'border-white/40 bg-white/20 hover:bg-white/30': canSubmit,
                'cursor-not-allowed border-white/20 bg-white/10 opacity-50':
                  !canSubmit,
              },
            )}
          >
            {isRegenerating ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
            ) : (
              <Icon
                variant='refresh'
                className='aucctus-stroke-white'
                height={16}
                width={16}
              />
            )}
          </button>
        </div>
      </div>

      {/* Right Side - Selected Count and Action Buttons */}
      <div className='flex w-1/2 items-center justify-end gap-3 px-4 py-3'>
        <div className='aucctus-text-sm text-white/80'>
          {selectedIdeasCount} selected
        </div>

        {/* Save for Later Button - Dark bg, light text, subtle border */}
        <button
          onClick={onSaveConcepts}
          disabled={selectedIdeasCount === 0 || isSaving}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap rounded-md border border-white/70 px-4 py-2 transition-all',
            {
              'cursor-not-allowed bg-gray-900 text-white/90 opacity-40':
                selectedIdeasCount === 0 || isSaving,
              'bg-gray-900 text-white/90 hover:bg-gray-800':
                selectedIdeasCount > 0 && !isSaving,
            },
          )}
        >
          {isSaving ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
          ) : (
            <Icon
              variant='save'
              className='aucctus-stroke-white'
              height={16}
              width={16}
            />
          )}
          <span>Save for Later</span>
        </button>

        {/* Generate Reports Button - Light bg, dark text, subtle border */}
        <button
          onClick={onGenerateReports}
          disabled={selectedIdeasCount === 0 || isSaving}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap rounded-md border border-white/70 px-4 py-2 transition-all',
            {
              'cursor-not-allowed bg-gray-900 text-white/90 opacity-40':
                selectedIdeasCount === 0 || isSaving,
              'bg-white/90 text-gray-900 hover:bg-white':
                selectedIdeasCount > 0 && !isSaving,
            },
          )}
        >
          {isSaving ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black' />
          ) : (
            <Icon
              variant='presentation-chart'
              className={cn({
                'aucctus-stroke-white': selectedIdeasCount === 0 || isSaving,
                'aucctus-stroke-primary': selectedIdeasCount > 0 && !isSaving,
              })}
              height={16}
              width={16}
            />
          )}
          <span>Generate Reports</span>
        </button>
      </div>
    </div>
  );
};

export default OpportunityMapFooter;
