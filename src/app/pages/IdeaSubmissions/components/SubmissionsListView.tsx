import { FunctionComponent, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Users,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
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

interface SubmissionsListViewProps {
  submissions: IIdeaSubmission[];
  onSubmissionClick: (submission: IIdeaSubmission) => void;
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (uuid: string) => void;
  onSelectAll?: () => void;
  duplicateCounts: Map<string, number>;
  duplicateGroups: Map<string, IIdeaSubmission[]>;
  expandedSubmissionId: string | null;
  onExpandSubmission: (submissionId: string) => void;
}

/**
 * Submissions List View Component
 *
 * Displays submissions in a table format with columns:
 * - Idea (title + description)
 * - Category (theme)
 * - Score
 * - Status
 * - Duplicates (expandable)
 */
const SubmissionsListView: FunctionComponent<SubmissionsListViewProps> = ({
  submissions,
  onSubmissionClick,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  duplicateCounts,
  duplicateGroups,
  expandedSubmissionId,
  onExpandSubmission,
}) => {
  const allSelected =
    submissions.length > 0 && submissions.every((s) => selectedIds.has(s.uuid));
  const someSelected =
    !allSelected && submissions.some((s) => selectedIds.has(s.uuid));
  const handleRowClick = (submission: IIdeaSubmission) => {
    if (isSelectionMode) {
      onToggleSelect(submission.uuid);
    } else {
      onSubmissionClick(submission);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    onToggleSelect(uuid);
  };

  const handleDuplicateClick = (e: React.MouseEvent, submissionId: string) => {
    e.stopPropagation();
    onExpandSubmission(submissionId);
  };

  const renderRow = (
    submission: IIdeaSubmission,
    isDuplicate: boolean = false,
    duplicateCount: number = 0,
    isExpanded: boolean = false,
  ) => {
    const statusConfig = STATUS_CONFIG[submission.status];
    const themeColor = submission.theme
      ? getThemeColor(submission.theme)
      : null;
    const isSelected = selectedIds.has(submission.uuid);

    return (
      <motion.tr
        key={submission.uuid}
        initial={isDuplicate ? { opacity: 0, height: 0 } : false}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => handleRowClick(submission)}
        className={cn('cursor-pointer transition-colors', {
          'aucctus-bg-brand-secondary': isSelected,
          'hover:bg-gray-50 dark:hover:bg-gray-800/50': !isSelected,
          'aucctus-bg-secondary/50': isDuplicate,
        })}
      >
        {/* Checkbox Column */}
        {isSelectionMode && (
          <td className='px-4 py-3'>
            <motion.button
              onClick={(e) => handleCheckboxClick(e, submission.uuid)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className='aucctus-bg-secondary hover:aucctus-bg-tertiary flex h-6 w-6 items-center justify-center rounded transition-colors'
            >
              {isSelected ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.3 }}
                >
                  <CheckSquare className='aucctus-stroke-brand-primary h-4 w-4' />
                </motion.div>
              ) : (
                <Square className='aucctus-stroke-secondary h-4 w-4' />
              )}
            </motion.button>
          </td>
        )}

        {/* Idea Column */}
        <td className='px-4 py-3'>
          <div className={cn({ 'pl-6': isDuplicate })}>
            {isDuplicate && (
              <span className='aucctus-text-tertiary mr-2 inline-block'>↳</span>
            )}
            <h4
              className={cn(
                'aucctus-text-primary line-clamp-1 inline',
                isDuplicate ? 'aucctus-text-sm' : 'aucctus-text-sm-semibold',
              )}
            >
              {submission.title}
            </h4>
            <p className='aucctus-text-xs aucctus-text-tertiary line-clamp-1'>
              {submission.problemStatement ||
                submission.proposedSolution ||
                'No description'}
            </p>
          </div>
        </td>

        {/* Category Column */}
        <td className='px-4 py-3'>
          {submission.theme && themeColor ? (
            <span
              className={cn(
                'aucctus-text-xs-semibold rounded-full border px-2.5 py-1',
                themeColor.bg,
                themeColor.text,
                themeColor.border,
              )}
            >
              {submission.theme}
            </span>
          ) : (
            <span className='aucctus-text-xs aucctus-text-tertiary'>—</span>
          )}
        </td>

        {/* Score Column */}
        <td className='px-4 py-3'>
          {submission.totalScore !== null ? (
            <div
              className='inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1'
              title={`Score: ${submission.totalScore}/100`}
            >
              <Star className='h-4 w-4 fill-yellow-400 stroke-yellow-500' />
              <span className='text-sm font-semibold text-yellow-700'>
                {submission.totalScore}
              </span>
            </div>
          ) : (
            <span className='aucctus-text-xs aucctus-text-tertiary'>—</span>
          )}
        </td>

        {/* Status Column */}
        <td className='px-4 py-3'>
          <span
            className={cn(
              'aucctus-text-xs-semibold rounded-full border px-2.5 py-1',
              statusConfig.bgClass,
              statusConfig.textClass,
              statusConfig.borderClass,
            )}
          >
            {statusConfig.label}
          </span>
        </td>

        {/* Duplicates Column */}
        <td className='px-4 py-3'>
          {!isDuplicate && duplicateCount > 0 ? (
            <button
              onClick={(e) => handleDuplicateClick(e, submission.uuid)}
              className='flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            >
              <Users className='aucctus-stroke-warning-primary h-4 w-4' />
              <span className='aucctus-text-xs-semibold aucctus-text-warning-primary'>
                +{duplicateCount}
              </span>
              {isExpanded ? (
                <ChevronUp className='aucctus-stroke-tertiary h-3.5 w-3.5' />
              ) : (
                <ChevronDown className='aucctus-stroke-tertiary h-3.5 w-3.5' />
              )}
            </button>
          ) : !isDuplicate ? (
            <span className='aucctus-text-xs aucctus-text-tertiary'>—</span>
          ) : null}
        </td>
      </motion.tr>
    );
  };

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-xl border'>
      <table className='w-full'>
        <thead className='aucctus-bg-secondary border-b border-gray-200 dark:border-gray-700'>
          <tr>
            {isSelectionMode && (
              <th className='w-12 px-4 py-3 text-left'>
                <motion.button
                  onClick={onSelectAll}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className='aucctus-bg-secondary hover:aucctus-bg-tertiary flex h-6 w-6 items-center justify-center rounded transition-colors'
                  title={allSelected ? 'Deselect all' : 'Select all'}
                >
                  {allSelected ? (
                    <CheckSquare className='aucctus-stroke-brand-primary h-4 w-4' />
                  ) : someSelected ? (
                    <MinusSquare className='aucctus-stroke-brand-primary h-4 w-4' />
                  ) : (
                    <Square className='aucctus-stroke-secondary h-4 w-4' />
                  )}
                </motion.button>
              </th>
            )}
            <th className='aucctus-text-xs-semibold aucctus-text-tertiary px-4 py-3 text-left uppercase tracking-wide'>
              Idea
            </th>
            <th className='aucctus-text-xs-semibold aucctus-text-tertiary w-40 px-4 py-3 text-left uppercase tracking-wide'>
              Category
            </th>
            <th className='aucctus-text-xs-semibold aucctus-text-tertiary w-24 px-4 py-3 text-left uppercase tracking-wide'>
              Score
            </th>
            <th className='aucctus-text-xs-semibold aucctus-text-tertiary w-32 px-4 py-3 text-left uppercase tracking-wide'>
              Status
            </th>
            <th className='aucctus-text-xs-semibold aucctus-text-tertiary w-28 px-4 py-3 text-left uppercase tracking-wide'>
              Duplicates
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-100 dark:divide-gray-800'>
          {submissions.map((submission) => {
            const duplicateCount = duplicateCounts.get(submission.uuid) || 0;
            const duplicates = duplicateGroups.get(submission.uuid) || [];
            const isExpanded = expandedSubmissionId === submission.uuid;

            return (
              <Fragment key={submission.uuid}>
                {/* Primary Row */}
                {renderRow(submission, false, duplicateCount, isExpanded)}

                {/* Duplicate Rows (expandable) */}
                <AnimatePresence>
                  {isExpanded &&
                    duplicates.map((dup) => (
                      <Fragment key={dup.uuid}>
                        {renderRow(dup, true, 0, false)}
                      </Fragment>
                    ))}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionsListView;
