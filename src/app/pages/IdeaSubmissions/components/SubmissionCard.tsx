import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckSquare, Square } from 'lucide-react';
import {
  IIdeaSubmission,
  IdeaSubmissionStatus,
} from '@libs/api/types/ideaSubmissions';
import { cn } from '@libs/utils/react';

// Status display configuration
const STATUS_CONFIG: Record<
  IdeaSubmissionStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  to_review: {
    label: 'To Review',
    bgClass: 'aucctus-bg-warning-secondary',
    textClass: 'aucctus-text-warning-primary',
    borderClass: 'aucctus-border-warning',
  },
  approved: {
    label: 'Approved',
    bgClass: 'aucctus-bg-success-secondary',
    textClass: 'aucctus-text-success-primary',
    borderClass: 'aucctus-border-success',
  },
  rejected: {
    label: 'Rejected',
    bgClass: 'aucctus-bg-error-secondary',
    textClass: 'aucctus-text-error-primary',
    borderClass: 'aucctus-border-error',
  },
};

// Theme color palette for badges
const THEME_COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
];

// Get consistent color for a theme name
const getThemeColor = (themeName: string) => {
  const hash = themeName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return THEME_COLORS[hash % THEME_COLORS.length];
};

interface SubmissionCardProps {
  submission: IIdeaSubmission;
  onClick: () => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  duplicateCount?: number;
  onExpandDuplicates?: () => void;
  /** When true, hide the duplicate count badge (card is in expanded group view) */
  isExpanded?: boolean;
}

/**
 * Submission Card Component
 *
 * Displays an idea submission as a card with:
 * - Theme badge (colored)
 * - Status badge
 * - Score badge (circular)
 * - Title and description preview
 * - Duplicate count badge (if applicable)
 */
const SubmissionCard: FunctionComponent<SubmissionCardProps> = ({
  submission,
  onClick,
  isSelectionMode,
  isSelected,
  onToggleSelect,
  duplicateCount = 0,
  onExpandDuplicates,
  isExpanded = false,
}) => {
  const statusConfig = STATUS_CONFIG[submission.status];
  const themeColor = submission.theme ? getThemeColor(submission.theme) : null;

  const handleClick = () => {
    if (isSelectionMode) {
      onToggleSelect();
    } else {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect();
  };

  const handleDuplicateBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpandDuplicates?.();
  };

  return (
    <div className='relative'>
      {/* Stacked Card Layers (for duplicates) - hide when expanded */}
      {duplicateCount > 0 && !isExpanded && (
        <>
          <div className='aucctus-bg-primary aucctus-border-secondary/60 absolute inset-0 -z-10 translate-x-2 translate-y-2 transform rounded-xl border' />
          <div className='aucctus-bg-primary aucctus-border-secondary/40 absolute inset-0 -z-20 translate-x-4 translate-y-4 transform rounded-xl border' />
        </>
      )}

      <motion.div
        onClick={handleClick}
        whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'aucctus-bg-primary group relative flex h-[220px] cursor-pointer flex-col rounded-xl border-2 p-6 shadow-sm transition-all duration-300',
          {
            'border-green-500 shadow-md': isSelected,
            'aucctus-border-secondary hover:aucctus-border-brand/50 hover:shadow-md':
              !isSelected,
          },
        )}
      >
        {/* Duplicate Count Badge (top right corner) - hide when expanded */}
        {duplicateCount > 0 && !isExpanded && (
          <button
            onClick={handleDuplicateBadgeClick}
            className='absolute -right-2 -top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[hsl(0,27%,29%)] text-xs font-bold text-white shadow-lg transition-transform hover:scale-110 dark:border-gray-900'
            title='Click to expand group'
          >
            {duplicateCount + 1}
          </button>
        )}

        {/* Badges Row */}
        <div className='mb-4 flex items-center justify-between'>
          {/* Theme Badge (left) */}
          {submission.theme && themeColor ? (
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium',
                themeColor.bg,
                themeColor.text,
                themeColor.border,
              )}
            >
              {submission.theme}
            </span>
          ) : (
            <span />
          )}

          {/* Status & Score (right) */}
          <div className='flex items-center gap-2'>
            {/* Status Badge */}
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium',
                statusConfig.bgClass,
                statusConfig.textClass,
                statusConfig.borderClass,
              )}
            >
              {statusConfig.label}
            </span>

            {/* Score Badge with Star */}
            {submission.totalScore !== null && (
              <div
                className='flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1'
                title={`Score: ${submission.totalScore}/100`}
              >
                <Star className='h-3 w-3 fill-yellow-400 stroke-yellow-500' />
                <span className='text-sm font-bold text-yellow-700'>
                  {submission.totalScore}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content (flex-1 to push to fill space) */}
        <div className='flex-1'>
          {/* Title */}
          <h3 className='aucctus-text-primary mb-2 line-clamp-2 text-lg font-bold transition-colors'>
            {submission.title}
          </h3>

          {/* Description Preview */}
          <p className='aucctus-text-secondary line-clamp-2 text-sm leading-relaxed'>
            {submission.problemStatement ||
              submission.proposedSolution ||
              'No description available'}
          </p>
        </div>

        {/* Selection Checkbox (in selection mode) - bottom right */}
        {isSelectionMode && (
          <motion.button
            onClick={handleCheckboxClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='absolute bottom-4 right-4 flex h-6 w-6 items-center justify-center rounded transition-colors'
          >
            {isSelected ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.3 }}
              >
                <CheckSquare className='h-5 w-5 text-green-500' />
              </motion.div>
            ) : (
              <Square className='aucctus-stroke-tertiary h-5 w-5' />
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default SubmissionCard;
