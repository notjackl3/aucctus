import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ISubmissionFilterParams,
  IScoringCriteriaQuestion,
  SubmissionSortOption,
  IdeaSubmissionStatus,
  ISubmissionDateRange,
  IQuestionScoreFilter,
} from '@libs/api/types/ideaSubmissions';
import { cn } from '@libs/utils/react';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ArrowUpDown,
  ListFilter,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ISubmissionFilterState extends ISubmissionFilterParams {
  // Additional UI state if needed
}

interface ISubmissionFilterProps {
  /** Current filter state */
  filterState: ISubmissionFilterState;
  /** Callback when filters change */
  onFilterChange: (filters: Partial<ISubmissionFilterState>) => void;
  /** Available scoring questions for per-question filtering */
  scoringQuestions: IScoringCriteriaQuestion[];
  /** Optional: hide specific filter controls */
  hideFilters?: {
    dateRange?: boolean;
    sort?: boolean;
    totalScore?: boolean;
    questionScore?: boolean;
    status?: boolean;
  };
}

// ============================================================================
// Sort Options Configuration
// ============================================================================

interface ISortOptionConfig {
  value: SubmissionSortOption;
  label: string;
  shortLabel: string;
  field: 'score' | 'date';
  direction: 'asc' | 'desc';
}

const SORT_OPTIONS: ISortOptionConfig[] = [
  {
    value: SubmissionSortOption.IDEA_SCORE_DESC,
    label: 'Idea Score: High to Low',
    shortLabel: 'Score',
    field: 'score',
    direction: 'desc',
  },
  {
    value: SubmissionSortOption.IDEA_SCORE_ASC,
    label: 'Idea Score: Low to High',
    shortLabel: 'Score',
    field: 'score',
    direction: 'asc',
  },
  {
    value: SubmissionSortOption.SUBMISSION_DATE_DESC,
    label: 'Submission Date: Newest First',
    shortLabel: 'Date',
    field: 'date',
    direction: 'desc',
  },
  {
    value: SubmissionSortOption.SUBMISSION_DATE_ASC,
    label: 'Submission Date: Oldest First',
    shortLabel: 'Date',
    field: 'date',
    direction: 'asc',
  },
];

const STATUS_OPTIONS: Array<{ value: IdeaSubmissionStatus; label: string }> = [
  { value: 'to_review', label: 'To Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// ============================================================================
// Main Component - Compact Filter Ribbon
// ============================================================================

export const SubmissionFilter: React.FC<ISubmissionFilterProps> = ({
  filterState,
  onFilterChange,
  scoringQuestions,
  hideFilters = {},
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Check if any filters are active
  const hasActiveFilters =
    filterState.status ||
    filterState.submissionDateRange?.start ||
    filterState.submissionDateRange?.end ||
    filterState.sortBy ||
    filterState.minTotalScore !== undefined ||
    filterState.maxTotalScore !== undefined ||
    filterState.questionScoreFilter;

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFilterChange({
      submissionDateRange: undefined,
      sortBy: undefined,
      minTotalScore: undefined,
      maxTotalScore: undefined,
      questionScoreFilter: undefined,
      status: undefined,
    });
  }, [onFilterChange]);

  // Collect sort chips (displayed first, before filters)
  const sortChips: React.ReactNode[] = [];

  // Sort Chip (with icon notation)
  if (!hideFilters.sort && filterState.sortBy) {
    sortChips.push(
      <SortChip
        key='sort'
        sortBy={filterState.sortBy}
        isOpen={openDropdown === 'sortChip'}
        onOpenChange={(open) => setOpenDropdown(open ? 'sortChip' : null)}
        onClear={() => onFilterChange({ sortBy: undefined })}
        onChange={(sortBy) => {
          onFilterChange({ sortBy });
          setOpenDropdown(null);
        }}
      />,
    );
  }

  // Collect filter chips
  const filterChips: React.ReactNode[] = [];

  // Status Filter Chip
  if (!hideFilters.status) {
    if (filterState.status) {
      filterChips.push(
        <StatusFilterChip
          key='status'
          status={filterState.status}
          isOpen={openDropdown === 'status'}
          onOpenChange={(open) => setOpenDropdown(open ? 'status' : null)}
          onClear={() => onFilterChange({ status: undefined })}
          onChange={(status) => {
            onFilterChange({ status });
            setOpenDropdown(null);
          }}
        />,
      );
    }
  }

  // Date Range Filter Chip
  if (!hideFilters.dateRange) {
    if (
      filterState.submissionDateRange?.start ||
      filterState.submissionDateRange?.end
    ) {
      filterChips.push(
        <DateRangeFilterChip
          key='dateRange'
          dateRange={filterState.submissionDateRange}
          isOpen={openDropdown === 'dateRange'}
          onOpenChange={(open) => setOpenDropdown(open ? 'dateRange' : null)}
          onClear={() => onFilterChange({ submissionDateRange: undefined })}
          onChange={(dateRange) =>
            onFilterChange({ submissionDateRange: dateRange })
          }
        />,
      );
    }
  }

  // Total Score Filter Chip
  if (!hideFilters.totalScore) {
    if (
      filterState.minTotalScore !== undefined ||
      filterState.maxTotalScore !== undefined
    ) {
      filterChips.push(
        <TotalScoreFilterChip
          key='totalScore'
          minScore={filterState.minTotalScore}
          maxScore={filterState.maxTotalScore}
          isOpen={openDropdown === 'totalScore'}
          onOpenChange={(open) => setOpenDropdown(open ? 'totalScore' : null)}
          onClear={() =>
            onFilterChange({
              minTotalScore: undefined,
              maxTotalScore: undefined,
            })
          }
          onChange={(min, max) =>
            onFilterChange({ minTotalScore: min, maxTotalScore: max })
          }
        />,
      );
    }
  }

  // Question Score Filter Chip
  if (!hideFilters.questionScore && scoringQuestions.length > 0) {
    if (filterState.questionScoreFilter) {
      filterChips.push(
        <QuestionScoreFilterChip
          key='questionScore'
          filter={filterState.questionScoreFilter}
          scoringQuestions={scoringQuestions}
          isOpen={openDropdown === 'questionScore'}
          onOpenChange={(open) =>
            setOpenDropdown(open ? 'questionScore' : null)
          }
          onClear={() => onFilterChange({ questionScoreFilter: undefined })}
          onChange={(filter) => onFilterChange({ questionScoreFilter: filter })}
        />,
      );
    }
  }

  const hasActiveChips = sortChips.length > 0 || filterChips.length > 0;

  return (
    <div className='flex flex-col gap-2'>
      {/* Top row: Sort & Filter buttons */}
      <div className='flex items-center gap-1.5'>
        {!hideFilters.sort && (
          <SortDropdown
            sortBy={filterState.sortBy}
            onChange={(sortBy) => onFilterChange({ sortBy })}
            isOpen={openDropdown === 'sort'}
            onOpenChange={(open) => setOpenDropdown(open ? 'sort' : null)}
          />
        )}

        <AddFilterDropdown
          filterState={filterState}
          onFilterChange={onFilterChange}
          scoringQuestions={scoringQuestions}
          hideFilters={hideFilters}
          isOpen={openDropdown === 'addFilter'}
          onOpenChange={(open) => setOpenDropdown(open ? 'addFilter' : null)}
        />
      </div>

      {/* Bottom row: Active chips ribbon */}
      {hasActiveChips && (
        <div className='flex flex-wrap items-center gap-1.5'>
          {/* Sort chips first */}
          {sortChips}

          {/* Divider between sorts and filters */}
          {sortChips.length > 0 && filterChips.length > 0 && (
            <div className='mx-1 h-6 w-px bg-gray-200' />
          )}

          {/* Filter chips */}
          {filterChips}

          {/* Clear All */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className='flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1 transition-colors hover:bg-red-100'
            >
              <X className='h-3.5 w-3.5 flex-shrink-0 stroke-red-600' />
              <span className='text-sm font-medium text-red-600'>
                Clear All
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Add Filter Dropdown
// ============================================================================

interface IAddFilterDropdownProps {
  filterState: ISubmissionFilterState;
  onFilterChange: (filters: Partial<ISubmissionFilterState>) => void;
  scoringQuestions: IScoringCriteriaQuestion[];
  hideFilters?: ISubmissionFilterProps['hideFilters'];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddFilterDropdown: React.FC<IAddFilterDropdownProps> = ({
  filterState,
  onFilterChange,
  scoringQuestions,
  hideFilters = {},
  isOpen,
  onOpenChange,
}) => {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const submenuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for pending filter values
  const [pendingDateRange, setPendingDateRange] =
    useState<ISubmissionDateRange>({});
  const [pendingTotalScore, setPendingTotalScore] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [pendingQuestionFilter, setPendingQuestionFilter] = useState<
    IQuestionScoreFilter | undefined
  >(undefined);

  // Reset pending values when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setPendingDateRange(filterState.submissionDateRange || {});
      setPendingTotalScore({
        min: filterState.minTotalScore,
        max: filterState.maxTotalScore,
      });
      setPendingQuestionFilter(filterState.questionScoreFilter);
    }
  }, [isOpen, filterState]);

  // Submenu hover management
  const setSubmenuImmediate = (submenu: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }
    setHoveredSubmenu(submenu);
  };

  const setSubmenuDelayed = (submenu: string | null) => {
    if (submenuCloseTimeoutRef.current) {
      clearTimeout(submenuCloseTimeoutRef.current);
    }
    submenuCloseTimeoutRef.current = setTimeout(() => {
      setHoveredSubmenu(submenu);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (submenuCloseTimeoutRef.current) {
        clearTimeout(submenuCloseTimeoutRef.current);
      }
    };
  }, []);

  // Apply pending filter when submenu closes
  const prevHoveredSubmenuRef = useRef<string | null>(null);
  useEffect(() => {
    const wasDateRange = prevHoveredSubmenuRef.current === 'dateRange';
    const wasTotalScore = prevHoveredSubmenuRef.current === 'totalScore';
    const wasQuestionScore = prevHoveredSubmenuRef.current === 'questionScore';

    if (wasDateRange && hoveredSubmenu !== 'dateRange') {
      if (pendingDateRange.start || pendingDateRange.end) {
        onFilterChange({ submissionDateRange: pendingDateRange });
        onOpenChange(false);
      }
    }
    if (wasTotalScore && hoveredSubmenu !== 'totalScore') {
      if (
        pendingTotalScore.min !== undefined ||
        pendingTotalScore.max !== undefined
      ) {
        onFilterChange({
          minTotalScore: pendingTotalScore.min,
          maxTotalScore: pendingTotalScore.max,
        });
        onOpenChange(false);
      }
    }
    if (wasQuestionScore && hoveredSubmenu !== 'questionScore') {
      if (pendingQuestionFilter?.questionUuid) {
        onFilterChange({ questionScoreFilter: pendingQuestionFilter });
        onOpenChange(false);
      }
    }

    prevHoveredSubmenuRef.current = hoveredSubmenu;
  }, [
    hoveredSubmenu,
    pendingDateRange,
    pendingTotalScore,
    pendingQuestionFilter,
    onFilterChange,
    onOpenChange,
  ]);

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <button className='aucctus-bg-secondary-hover flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors duration-200'>
          <ListFilter size={16} className='aucctus-stroke-secondary' />
          <span className='aucctus-text-sm aucctus-text-secondary'>Filter</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {isOpen && (
            <Popover.Content asChild align='start' sideOffset={4} forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] min-w-[200px] rounded-lg border p-1 shadow-lg'
              >
                {/* Status Filter */}
                {!hideFilters?.status && !filterState.status && (
                  <FilterMenuItemWithSubmenu
                    icon='loading-02'
                    label='Status'
                    submenuKey='status'
                    hoveredSubmenu={hoveredSubmenu}
                    setSubmenuImmediate={setSubmenuImmediate}
                    setSubmenuDelayed={setSubmenuDelayed}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className='space-y-1'
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
                          onClick={() => {
                            onFilterChange({ status: option.value });
                            onOpenChange(false);
                          }}
                        >
                          <span className='aucctus-text-secondary'>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  </FilterMenuItemWithSubmenu>
                )}

                {/* Date Range Filter */}
                {!hideFilters?.dateRange &&
                  !filterState.submissionDateRange?.start &&
                  !filterState.submissionDateRange?.end && (
                    <FilterMenuItemWithSubmenu
                      icon='calendar'
                      label='Submission Date'
                      submenuKey='dateRange'
                      hoveredSubmenu={hoveredSubmenu}
                      setSubmenuImmediate={setSubmenuImmediate}
                      setSubmenuDelayed={setSubmenuDelayed}
                      wide
                    >
                      <DateRangeForm
                        startDate={pendingDateRange.start}
                        endDate={pendingDateRange.end}
                        onStartChange={(v) =>
                          setPendingDateRange((prev) => ({
                            ...prev,
                            start: v,
                          }))
                        }
                        onEndChange={(v) =>
                          setPendingDateRange((prev) => ({ ...prev, end: v }))
                        }
                        onApply={() => {
                          if (pendingDateRange.start || pendingDateRange.end) {
                            onFilterChange({
                              submissionDateRange: pendingDateRange,
                            });
                            onOpenChange(false);
                          }
                        }}
                        applyDisabled={
                          !pendingDateRange.start && !pendingDateRange.end
                        }
                      />
                    </FilterMenuItemWithSubmenu>
                  )}

                {/* Total Score Filter */}
                {!hideFilters?.totalScore &&
                  filterState.minTotalScore === undefined &&
                  filterState.maxTotalScore === undefined && (
                    <FilterMenuItemWithSubmenu
                      icon='star-01'
                      label='Total Score'
                      submenuKey='totalScore'
                      hoveredSubmenu={hoveredSubmenu}
                      setSubmenuImmediate={setSubmenuImmediate}
                      setSubmenuDelayed={setSubmenuDelayed}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className='space-y-3 p-2'
                      >
                        <div>
                          <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block font-medium'>
                            Min Score (0-100)
                          </label>
                          <input
                            type='number'
                            min={0}
                            max={100}
                            value={pendingTotalScore.min ?? ''}
                            onChange={(e) =>
                              setPendingTotalScore((prev) => ({
                                ...prev,
                                min: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }))
                            }
                            placeholder='e.g., 70'
                            className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-sm'
                          />
                        </div>
                        <div>
                          <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block font-medium'>
                            Max Score (0-100)
                          </label>
                          <input
                            type='number'
                            min={0}
                            max={100}
                            value={pendingTotalScore.max ?? ''}
                            onChange={(e) =>
                              setPendingTotalScore((prev) => ({
                                ...prev,
                                max: e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              }))
                            }
                            placeholder='e.g., 100'
                            className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-sm'
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (
                              pendingTotalScore.min !== undefined ||
                              pendingTotalScore.max !== undefined
                            ) {
                              onFilterChange({
                                minTotalScore: pendingTotalScore.min,
                                maxTotalScore: pendingTotalScore.max,
                              });
                              onOpenChange(false);
                            }
                          }}
                          disabled={
                            pendingTotalScore.min === undefined &&
                            pendingTotalScore.max === undefined
                          }
                          className='btn btn-primary btn-sm w-full disabled:opacity-50'
                        >
                          Apply
                        </button>
                      </motion.div>
                    </FilterMenuItemWithSubmenu>
                  )}

                {/* Question Score Filter */}
                {!hideFilters?.questionScore &&
                  scoringQuestions.length > 0 &&
                  !filterState.questionScoreFilter && (
                    <QuestionScoreSubmenu
                      scoringQuestions={scoringQuestions}
                      pendingFilter={pendingQuestionFilter}
                      setPendingFilter={setPendingQuestionFilter}
                      hoveredSubmenu={hoveredSubmenu}
                      setSubmenuImmediate={setSubmenuImmediate}
                      setSubmenuDelayed={setSubmenuDelayed}
                      onApply={(filter) => {
                        onFilterChange({ questionScoreFilter: filter });
                        onOpenChange(false);
                      }}
                    />
                  )}
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

// ============================================================================
// Sort Dropdown (Separate from filters, like Concept Bank)
// ============================================================================

interface ISortDropdownProps {
  sortBy: SubmissionSortOption | undefined;
  onChange: (sortBy: SubmissionSortOption) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SortDropdown: React.FC<ISortDropdownProps> = ({
  sortBy,
  onChange,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <button className='aucctus-bg-secondary-hover flex h-8 items-center gap-1.5 rounded-md px-2 transition-colors duration-200'>
          <ArrowUpDown size={16} className='aucctus-stroke-secondary' />
          <span className='aucctus-text-sm aucctus-text-secondary'>Sort</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {isOpen && (
            <Popover.Content asChild align='start' sideOffset={4} forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] min-w-[220px] rounded-lg border p-1 shadow-lg'
              >
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className='space-y-1'
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        'flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors',
                        sortBy === option.value
                          ? 'bg-blue-50 text-blue-800'
                          : 'aucctus-bg-primary-hover aucctus-text-secondary',
                      )}
                      onClick={() => {
                        onChange(option.value);
                        onOpenChange(false);
                      }}
                    >
                      <div className='flex items-center gap-2'>
                        <DynamicIcon
                          variant={
                            option.direction === 'desc'
                              ? 'arrowdown'
                              : 'arrowup'
                          }
                          className={cn(
                            'h-3.5 w-3.5',
                            sortBy === option.value
                              ? 'stroke-blue-600'
                              : 'aucctus-stroke-secondary',
                          )}
                        />
                        <span>{option.label}</span>
                      </div>
                      {sortBy === option.value && (
                        <Check className='h-4 w-4 stroke-blue-600' />
                      )}
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

// ============================================================================
// Sort Chip (Active sort with icon notation)
// ============================================================================

interface ISortChipProps {
  sortBy: SubmissionSortOption;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
  onChange: (sortBy: SubmissionSortOption) => void;
}

const SortChip: React.FC<ISortChipProps> = ({
  sortBy,
  isOpen,
  onOpenChange,
  onClear,
  onChange,
}) => {
  const sortOption = SORT_OPTIONS.find((s) => s.value === sortBy);
  const directionIcon =
    sortOption?.direction === 'desc' ? 'arrowdown' : 'arrowup';

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <div className='flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-blue-800'>
          <DynamicIcon
            variant={directionIcon as any}
            className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-700'
          />
          <span className='text-sm font-medium text-blue-800'>
            {sortOption?.shortLabel || 'Sort'}
          </span>
          <ChevronDown className='h-3 w-3 flex-shrink-0 stroke-blue-700' />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-200'
          >
            <X className='h-3 w-3 stroke-blue-700' />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {isOpen && (
            <Popover.Content asChild align='start' sideOffset={4} forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] w-56 rounded-lg border p-1 shadow-lg'
              >
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className='space-y-1'
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        'flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors',
                        sortBy === option.value
                          ? 'bg-blue-50 text-blue-800'
                          : 'aucctus-bg-primary-hover aucctus-text-secondary',
                      )}
                      onClick={() => onChange(option.value)}
                    >
                      <div className='flex items-center gap-2'>
                        <DynamicIcon
                          variant={
                            option.direction === 'desc'
                              ? 'arrowdown'
                              : 'arrowup'
                          }
                          className={cn(
                            'h-3.5 w-3.5',
                            sortBy === option.value
                              ? 'stroke-blue-600'
                              : 'aucctus-stroke-secondary',
                          )}
                        />
                        <span>{option.label}</span>
                      </div>
                      {sortBy === option.value && (
                        <Check className='h-4 w-4 stroke-blue-600' />
                      )}
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

// ============================================================================
// Date Range Form (shared between AddFilterDropdown and DateRangeFilterChip)
// ============================================================================

// ---- Calendar helpers ----

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Format a Date as YYYY-MM-DD */
const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse YYYY-MM-DD to Date (local) */
const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Check if two date strings refer to the same day */
const isSameDay = (a: string | undefined, b: string): boolean => a === b;

/** Get calendar grid rows for a given month */
const getCalendarDays = (year: number, month: number): (Date | null)[][] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  while (cells.length < 42) cells.push(null); // Always 6 rows for consistent height

  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
};

// ---- Mini calendar component ----

interface IMiniCalendarProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  minDate?: string;
  maxDate?: string;
  /** Highlight range between start and end */
  rangeStart?: string;
  rangeEnd?: string;
  /** When set, snap the calendar view to this date's month */
  focusDate?: string;
}

const MiniCalendar: React.FC<IMiniCalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  rangeStart,
  rangeEnd,
  focusDate,
}) => {
  const initialDate = value ? parseDate(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [direction, setDirection] = useState(0);

  // Snap to focusDate's month when it changes
  useEffect(() => {
    if (!focusDate) return;
    const d = parseDate(focusDate);
    const targetYear = d.getFullYear();
    const targetMonth = d.getMonth();
    if (targetYear !== viewYear || targetMonth !== viewMonth) {
      const current = viewYear * 12 + viewMonth;
      const target = targetYear * 12 + targetMonth;
      setDirection(target > current ? 1 : -1);
      setViewYear(targetYear);
      setViewMonth(targetMonth);
    }
  }, [focusDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const navigate = (delta: number) => {
    setDirection(delta);
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setViewYear(newYear);
    setViewMonth(newMonth);
  };

  const today = toDateStr(new Date());

  const isDisabled = (d: Date): boolean => {
    const ds = toDateStr(d);
    if (minDate && ds < minDate) return true;
    if (maxDate && ds > maxDate) return true;
    return false;
  };

  const isInRange = (d: Date): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    const ds = toDateStr(d);
    return ds > rangeStart && ds < rangeEnd;
  };

  const isRangeEdge = (d: Date): boolean => {
    const ds = toDateStr(d);
    return isSameDay(rangeStart, ds) || isSameDay(rangeEnd, ds);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className='w-full select-none'>
      {/* Month/year header with nav */}
      <div className='mb-2 flex items-center justify-between'>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className='aucctus-bg-primary-hover rounded-md p-1 transition-colors'
        >
          <ChevronLeft className='aucctus-stroke-secondary h-3.5 w-3.5' />
        </motion.button>

        <AnimatePresence mode='wait' custom={direction}>
          <motion.span
            key={`${viewYear}-${viewMonth}`}
            custom={direction}
            variants={slideVariants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className='aucctus-text-primary text-xs font-semibold'
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </motion.span>
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(1)}
          className='aucctus-bg-primary-hover rounded-md p-1 transition-colors'
        >
          <ChevronRight className='aucctus-stroke-secondary h-3.5 w-3.5' />
        </motion.button>
      </div>

      {/* Day of week headers */}
      <div className='mb-1 grid grid-cols-7 gap-0'>
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className='aucctus-text-tertiary py-1 text-center text-[10px] font-medium uppercase'
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <AnimatePresence mode='wait' custom={direction}>
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          custom={direction}
          variants={slideVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {rows.map((row, ri) => (
            <div key={ri} className='grid grid-cols-7 gap-0'>
              {row.map((day, ci) => {
                if (!day) {
                  return <div key={ci} className='h-7 w-full' />;
                }

                const ds = toDateStr(day);
                const selected = isSameDay(value, ds);
                const disabled = isDisabled(day);
                const isToday = ds === today;
                const inRange = isInRange(day);
                const rangeEdge = isRangeEdge(day);

                return (
                  <motion.button
                    key={ci}
                    whileHover={!disabled ? { scale: 1.15 } : undefined}
                    whileTap={!disabled ? { scale: 0.9 } : undefined}
                    disabled={disabled}
                    onClick={() => onChange(selected ? undefined : ds)}
                    className={cn(
                      'relative flex h-7 w-full items-center justify-center rounded-md text-xs transition-colors',
                      disabled && 'cursor-not-allowed opacity-30',
                      !disabled &&
                        !selected &&
                        !inRange &&
                        !rangeEdge &&
                        'aucctus-text-secondary hover:bg-blue-50',
                      inRange && !selected && 'bg-blue-50/60',
                      rangeEdge &&
                        !selected &&
                        'bg-blue-100 font-medium text-blue-700',
                      selected &&
                        'bg-blue-600 font-semibold text-white shadow-sm',
                      isToday && !selected && 'font-semibold',
                    )}
                  >
                    {day.getDate()}
                    {isToday && !selected && (
                      <span className='absolute bottom-0.5 left-1/2 h-0.5 w-2.5 -translate-x-1/2 rounded-full bg-blue-500' />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ---- Date trigger button ----

interface IDateTriggerProps {
  label: string;
  value: string | undefined;
  active: boolean;
  onClick: () => void;
  onClear: () => void;
}

const DateTrigger: React.FC<IDateTriggerProps> = ({
  label,
  value,
  active,
  onClick,
  onClear,
}) => {
  const formatted = value
    ? parseDate(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-all duration-200',
        active
          ? 'border-blue-400 bg-blue-50/50 ring-2 ring-blue-400/20'
          : 'aucctus-border-secondary aucctus-bg-secondary hover:border-blue-300',
      )}
    >
      <Calendar
        className={cn(
          'h-3.5 w-3.5 flex-shrink-0',
          active ? 'stroke-blue-500' : 'aucctus-stroke-tertiary',
        )}
      />
      <div className='flex flex-1 flex-col'>
        <span
          className={cn(
            'text-[10px] font-medium uppercase leading-none',
            active ? 'text-blue-600' : 'aucctus-text-tertiary',
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'mt-0.5 text-xs',
            value
              ? 'aucctus-text-primary font-medium'
              : 'aucctus-text-tertiary',
          )}
        >
          {formatted || 'Select date'}
        </span>
      </div>
      <AnimatePresence>
        {value && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className='flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-blue-200/60'
          >
            <X className='h-3 w-3 stroke-blue-500' />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ---- Date range form ----

interface IDateRangeFormProps {
  startDate: string | undefined;
  endDate: string | undefined;
  onStartChange: (value: string | undefined) => void;
  onEndChange: (value: string | undefined) => void;
  onApply: () => void;
  applyDisabled: boolean;
}

const DateRangeForm: React.FC<IDateRangeFormProps> = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onApply,
  applyDisabled,
}) => {
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');

  const handleDateSelect = (value: string | undefined) => {
    if (activeField === 'start') {
      onStartChange(value);
      // Auto-advance to end date after selecting start
      if (value) setActiveField('end');
    } else {
      onEndChange(value);
    }
  };

  const calendarValue = activeField === 'start' ? startDate : endDate;
  const calendarMin = activeField === 'end' ? startDate : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className='w-[320px] p-3'
    >
      {/* Start / End toggle triggers */}
      <div className='mb-3 grid grid-cols-2 gap-2'>
        <DateTrigger
          label='Start'
          value={startDate}
          active={activeField === 'start'}
          onClick={() => setActiveField('start')}
          onClear={() => onStartChange(undefined)}
        />
        <DateTrigger
          label='End'
          value={endDate}
          active={activeField === 'end'}
          onClick={() => setActiveField('end')}
          onClear={() => onEndChange(undefined)}
        />
      </div>

      {/* Calendar */}
      <div className='aucctus-border-secondary rounded-lg border p-2'>
        <MiniCalendar
          value={calendarValue}
          onChange={handleDateSelect}
          minDate={calendarMin}
          rangeStart={startDate}
          rangeEnd={endDate}
          focusDate={calendarValue}
        />
      </div>

      {/* Apply */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onApply}
        disabled={applyDisabled}
        className='btn btn-primary btn-sm mt-3 w-full disabled:opacity-50'
      >
        Apply
      </motion.button>
    </motion.div>
  );
};

// ============================================================================
// Filter Menu Item with Submenu (hover to open)
// ============================================================================

interface IFilterMenuItemWithSubmenuProps {
  icon: string;
  label: string;
  submenuKey: string;
  hoveredSubmenu: string | null;
  setSubmenuImmediate: (submenu: string | null) => void;
  setSubmenuDelayed: (submenu: string | null) => void;
  children: React.ReactNode;
  wide?: boolean;
}

const FilterMenuItemWithSubmenu: React.FC<IFilterMenuItemWithSubmenuProps> = ({
  icon,
  label,
  submenuKey,
  hoveredSubmenu,
  setSubmenuImmediate,
  setSubmenuDelayed,
  children,
  wide,
}) => {
  const isOpen = hoveredSubmenu === submenuKey;
  const contentHasFocusRef = useRef(false);

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger asChild>
        <button
          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
          onMouseEnter={() => setSubmenuImmediate(submenuKey)}
          onMouseLeave={() => {
            if (!contentHasFocusRef.current) setSubmenuDelayed(null);
          }}
        >
          <DynamicIcon
            variant={icon as any}
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <span className='aucctus-text-secondary flex-1 text-left'>
            {label}
          </span>
          <ChevronRight className='aucctus-stroke-tertiary h-4 w-4' />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side='right'
          align='start'
          sideOffset={-4}
          collisionPadding={16}
          onMouseEnter={() => setSubmenuImmediate(submenuKey)}
          onMouseLeave={() => {
            if (!contentHasFocusRef.current) setSubmenuDelayed(null);
          }}
          onFocusCapture={() => {
            contentHasFocusRef.current = true;
            setSubmenuImmediate(submenuKey);
          }}
          onBlurCapture={() => {
            contentHasFocusRef.current = false;
          }}
          className={cn(
            'aucctus-bg-primary aucctus-border-secondary z-[10000] rounded-lg border shadow-lg',
            wide ? 'w-auto' : 'w-48',
          )}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

// ============================================================================
// Question Score Submenu - Spacious two-panel design
// ============================================================================

interface IQuestionScoreSubmenuProps {
  scoringQuestions: IScoringCriteriaQuestion[];
  pendingFilter: IQuestionScoreFilter | undefined;
  setPendingFilter: React.Dispatch<
    React.SetStateAction<IQuestionScoreFilter | undefined>
  >;
  hoveredSubmenu: string | null;
  setSubmenuImmediate: (submenu: string | null) => void;
  setSubmenuDelayed: (submenu: string | null) => void;
  onApply: (filter: IQuestionScoreFilter) => void;
}

const QuestionScoreSubmenu: React.FC<IQuestionScoreSubmenuProps> = ({
  scoringQuestions,
  pendingFilter,
  setPendingFilter,
  hoveredSubmenu,
  setSubmenuImmediate,
  setSubmenuDelayed,
  onApply,
}) => {
  const submenuKey = 'questionScore';

  // Group questions by category
  const questionsByCategory = scoringQuestions.reduce(
    (acc, question) => {
      if (!acc[question.categoryName]) {
        acc[question.categoryName] = [];
      }
      acc[question.categoryName].push(question);
      return acc;
    },
    {} as Record<string, IScoringCriteriaQuestion[]>,
  );

  // Quick preset handlers
  const applyPreset = (min: number | undefined, max: number | undefined) => {
    if (pendingFilter?.questionUuid) {
      setPendingFilter((prev) =>
        prev ? { ...prev, minScore: min, maxScore: max } : undefined,
      );
    }
  };

  // Get importance badge color
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return (
          <span className='rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700'>
            High
          </span>
        );
      case 'medium':
        return (
          <span className='rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700'>
            Med
          </span>
        );
      default:
        return (
          <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600'>
            Low
          </span>
        );
    }
  };

  const selectedQuestion = pendingFilter?.questionUuid
    ? scoringQuestions.find((q) => q.uuid === pendingFilter.questionUuid)
    : null;

  const isOpen = hoveredSubmenu === submenuKey;

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger asChild>
        <button
          className='aucctus-bg-primary-hover flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors'
          onMouseEnter={() => setSubmenuImmediate(submenuKey)}
          onMouseLeave={() => setSubmenuDelayed(null)}
        >
          <Clipboard className='aucctus-stroke-secondary h-4 w-4' />
          <span className='aucctus-text-secondary flex-1 text-left'>
            Question Score
          </span>
          <ChevronRight className='aucctus-stroke-tertiary h-4 w-4' />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side='right'
          align='start'
          sideOffset={-4}
          collisionPadding={16}
          onMouseEnter={() => setSubmenuImmediate(submenuKey)}
          onMouseLeave={() => setSubmenuDelayed(null)}
          className='aucctus-bg-primary aucctus-border-secondary z-[10000] flex w-[640px] rounded-lg border shadow-lg'
        >
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className='flex w-full'
          >
            {/* Left Panel - Question Selection */}
            <div className='aucctus-border-secondary flex-1 border-r p-5'>
              <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
                Select a Question
              </h4>
              <div className='max-h-[340px] space-y-5 overflow-y-auto pr-2'>
                {Object.entries(questionsByCategory).map(
                  ([categoryName, questions]) => (
                    <div key={categoryName}>
                      <div className='aucctus-text-xs aucctus-text-tertiary mb-2.5 font-semibold uppercase tracking-wide'>
                        {categoryName}
                      </div>
                      <div className='space-y-1.5'>
                        {questions.map((question) => (
                          <button
                            key={question.uuid}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                              pendingFilter?.questionUuid === question.uuid
                                ? 'bg-blue-50 ring-1 ring-blue-200'
                                : 'aucctus-bg-primary-hover',
                            )}
                            onClick={() =>
                              setPendingFilter((prev) => ({
                                questionUuid: question.uuid,
                                minScore: prev?.minScore,
                                maxScore: prev?.maxScore,
                              }))
                            }
                          >
                            <div className='flex-1'>
                              <p
                                className={cn(
                                  'leading-snug',
                                  pendingFilter?.questionUuid === question.uuid
                                    ? 'font-medium text-blue-900'
                                    : 'aucctus-text-secondary',
                                )}
                              >
                                {question.text}
                              </p>
                            </div>
                            <div className='flex flex-shrink-0 items-center gap-2'>
                              {getImportanceBadge(question.importance)}
                              {pendingFilter?.questionUuid ===
                                question.uuid && (
                                <Check className='h-4 w-4 stroke-blue-600' />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Right Panel - Score Configuration */}
            <div className='w-72 p-5'>
              <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
                Score Range
              </h4>

              {selectedQuestion ? (
                <div className='space-y-5'>
                  {/* Quick Presets */}
                  <div>
                    <label className='aucctus-text-sm aucctus-text-tertiary mb-2.5 block font-medium'>
                      Quick Select
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      <button
                        onClick={() => applyPreset(4, undefined)}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          pendingFilter?.minScore === 4 &&
                            !pendingFilter?.maxScore
                            ? 'bg-blue-100 text-blue-800'
                            : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                        )}
                      >
                        4+ Only
                      </button>
                      <button
                        onClick={() => applyPreset(5, 5)}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          pendingFilter?.minScore === 5 &&
                            pendingFilter?.maxScore === 5
                            ? 'bg-blue-100 text-blue-800'
                            : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                        )}
                      >
                        Perfect 5
                      </button>
                      <button
                        onClick={() => applyPreset(undefined, 2)}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          !pendingFilter?.minScore &&
                            pendingFilter?.maxScore === 2
                            ? 'bg-blue-100 text-blue-800'
                            : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                        )}
                      >
                        Low (≤2)
                      </button>
                      <button
                        onClick={() => applyPreset(3, 3)}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          pendingFilter?.minScore === 3 &&
                            pendingFilter?.maxScore === 3
                            ? 'bg-blue-100 text-blue-800'
                            : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                        )}
                      >
                        Neutral (3)
                      </button>
                    </div>
                  </div>

                  {/* Custom Range */}
                  <div className='aucctus-border-secondary border-t pt-4'>
                    <label className='aucctus-text-sm aucctus-text-tertiary mb-2.5 block font-medium'>
                      Custom Range
                    </label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        min={1}
                        max={5}
                        value={pendingFilter?.minScore ?? ''}
                        onChange={(e) =>
                          setPendingFilter((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  minScore: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                }
                              : undefined,
                          )
                        }
                        placeholder='Min'
                        className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded-lg border px-3 py-2 text-center'
                      />
                      <span className='aucctus-text-tertiary'>to</span>
                      <input
                        type='number'
                        min={1}
                        max={5}
                        value={pendingFilter?.maxScore ?? ''}
                        onChange={(e) =>
                          setPendingFilter((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  maxScore: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                }
                              : undefined,
                          )
                        }
                        placeholder='Max'
                        className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded-lg border px-3 py-2 text-center'
                      />
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => {
                      if (pendingFilter?.questionUuid) {
                        onApply(pendingFilter);
                      }
                    }}
                    className='btn btn-primary btn-md w-full'
                  >
                    Apply Filter
                  </button>
                </div>
              ) : (
                <div className='flex h-56 items-center justify-center'>
                  <p className='aucctus-text-tertiary text-center'>
                    Select a question from the list to configure the score
                    filter
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

// ============================================================================
// Active Filter Chips - Blue styled chips matching ConceptBank
// ============================================================================

// Base Chip Component
interface IFilterChipProps {
  icon: string;
  label: string;
  value: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
  children: React.ReactNode;
}

const FilterChip: React.FC<IFilterChipProps> = ({
  icon,
  label,
  value,
  isOpen,
  onOpenChange,
  onClear,
  children,
}) => {
  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <div className='flex max-w-xs items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-blue-800'>
          <DynamicIcon
            variant={icon as any}
            className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-700'
          />
          <span className='flex-shrink-0 text-sm text-blue-700'>{label}:</span>
          <span className='truncate text-sm font-medium text-blue-800'>
            {value}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-200'
          >
            <X className='h-3 w-3 stroke-blue-700' />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {isOpen && (
            <Popover.Content asChild align='start' sideOffset={4} forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] rounded-lg border p-1 shadow-lg'
              >
                {children}
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

// Status Filter Chip
interface IStatusFilterChipProps {
  status: IdeaSubmissionStatus;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
  onChange: (status: IdeaSubmissionStatus) => void;
}

const StatusFilterChip: React.FC<IStatusFilterChipProps> = ({
  status,
  isOpen,
  onOpenChange,
  onClear,
  onChange,
}) => {
  const statusLabel =
    STATUS_OPTIONS.find((s) => s.value === status)?.label || status;

  return (
    <FilterChip
      icon='loading-02'
      label='Status'
      value={statusLabel}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClear={onClear}
    >
      <div className='w-48 space-y-1'>
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={cn(
              'flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors',
              status === option.value
                ? 'bg-blue-50 text-blue-800'
                : 'aucctus-bg-primary-hover aucctus-text-secondary',
            )}
            onClick={() => onChange(option.value)}
          >
            <span>{option.label}</span>
            {status === option.value && (
              <Check className='h-4 w-4 stroke-blue-600' />
            )}
          </button>
        ))}
      </div>
    </FilterChip>
  );
};

// Date Range Filter Chip
interface IDateRangeFilterChipProps {
  dateRange: ISubmissionDateRange;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
  onChange: (dateRange: ISubmissionDateRange) => void;
}

const DateRangeFilterChip: React.FC<IDateRangeFilterChipProps> = ({
  dateRange,
  isOpen,
  onOpenChange,
  onClear,
  onChange,
}) => {
  const [localDateRange, setLocalDateRange] = useState(dateRange);

  useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  const formatDateRange = () => {
    if (dateRange.start && dateRange.end) {
      return `${dateRange.start} - ${dateRange.end}`;
    }
    if (dateRange.start) return `From ${dateRange.start}`;
    if (dateRange.end) return `Until ${dateRange.end}`;
    return '';
  };

  return (
    <FilterChip
      icon='calendar'
      label='Date'
      value={formatDateRange()}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClear={onClear}
    >
      <DateRangeForm
        startDate={localDateRange.start}
        endDate={localDateRange.end}
        onStartChange={(v) =>
          setLocalDateRange((prev) => ({ ...prev, start: v }))
        }
        onEndChange={(v) => setLocalDateRange((prev) => ({ ...prev, end: v }))}
        onApply={() => {
          onChange(localDateRange);
          onOpenChange(false);
        }}
        applyDisabled={false}
      />
    </FilterChip>
  );
};

// Total Score Filter Chip
interface ITotalScoreFilterChipProps {
  minScore: number | undefined;
  maxScore: number | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

const TotalScoreFilterChip: React.FC<ITotalScoreFilterChipProps> = ({
  minScore,
  maxScore,
  isOpen,
  onOpenChange,
  onClear,
  onChange,
}) => {
  const [localMin, setLocalMin] = useState(minScore);
  const [localMax, setLocalMax] = useState(maxScore);

  useEffect(() => {
    setLocalMin(minScore);
    setLocalMax(maxScore);
  }, [minScore, maxScore]);

  const formatScoreRange = () => {
    if (minScore !== undefined && maxScore !== undefined) {
      return `${minScore}-${maxScore}`;
    }
    if (minScore !== undefined) return `≥${minScore}`;
    if (maxScore !== undefined) return `≤${maxScore}`;
    return '';
  };

  return (
    <FilterChip
      icon='star-01'
      label='Score'
      value={formatScoreRange()}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClear={onClear}
    >
      <div className='w-56 space-y-3 p-3'>
        <div>
          <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block font-medium'>
            Min Score (0-100)
          </label>
          <input
            type='number'
            min={0}
            max={100}
            value={localMin ?? ''}
            onChange={(e) =>
              setLocalMin(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder='e.g., 70'
            className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-sm'
          />
        </div>
        <div>
          <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block font-medium'>
            Max Score (0-100)
          </label>
          <input
            type='number'
            min={0}
            max={100}
            value={localMax ?? ''}
            onChange={(e) =>
              setLocalMax(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder='e.g., 100'
            className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-sm'
          />
        </div>
        <button
          onClick={() => {
            onChange(localMin, localMax);
            onOpenChange(false);
          }}
          className='btn btn-primary btn-sm w-full'
        >
          Apply
        </button>
      </div>
    </FilterChip>
  );
};

// Question Score Filter Chip - Spacious design matching submenu
interface IQuestionScoreFilterChipProps {
  filter: IQuestionScoreFilter;
  scoringQuestions: IScoringCriteriaQuestion[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClear: () => void;
  onChange: (filter: IQuestionScoreFilter) => void;
}

const QuestionScoreFilterChip: React.FC<IQuestionScoreFilterChipProps> = ({
  filter,
  scoringQuestions,
  isOpen,
  onOpenChange,
  onClear,
  onChange,
}) => {
  const [localFilter, setLocalFilter] = useState(filter);

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const question = scoringQuestions.find((q) => q.uuid === filter.questionUuid);
  const questionName = question?.text || 'Unknown';
  const truncatedName =
    questionName.length > 25 ? `${questionName.slice(0, 25)}...` : questionName;

  const formatScoreRange = () => {
    if (filter.minScore !== undefined && filter.maxScore !== undefined) {
      if (filter.minScore === filter.maxScore) return `=${filter.minScore}`;
      return `${filter.minScore}-${filter.maxScore}`;
    }
    if (filter.minScore !== undefined) return `≥${filter.minScore}`;
    if (filter.maxScore !== undefined) return `≤${filter.maxScore}`;
    return 'Any';
  };

  // Group questions by category
  const questionsByCategory = scoringQuestions.reduce(
    (acc, q) => {
      if (!acc[q.categoryName]) {
        acc[q.categoryName] = [];
      }
      acc[q.categoryName].push(q);
      return acc;
    },
    {} as Record<string, IScoringCriteriaQuestion[]>,
  );

  // Get importance badge
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return (
          <span className='rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700'>
            High
          </span>
        );
      case 'medium':
        return (
          <span className='rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700'>
            Med
          </span>
        );
      default:
        return (
          <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600'>
            Low
          </span>
        );
    }
  };

  // Quick preset handlers
  const applyPreset = (min: number | undefined, max: number | undefined) => {
    setLocalFilter((prev) => ({ ...prev, minScore: min, maxScore: max }));
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>
        <div className='flex max-w-sm items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-blue-800'>
          <Clipboard className='h-3.5 w-3.5 flex-shrink-0 stroke-blue-700' />
          <span className='truncate text-sm text-blue-700' title={questionName}>
            {truncatedName}
          </span>
          <span className='flex-shrink-0 rounded bg-blue-200 px-1.5 py-0.5 text-xs font-semibold text-blue-800'>
            {formatScoreRange()}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className='ml-0.5 flex-shrink-0 rounded p-0.5 hover:bg-blue-200'
          >
            <X className='h-3 w-3 stroke-blue-700' />
          </button>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <AnimatePresence>
          {isOpen && (
            <Popover.Content asChild align='start' sideOffset={4} forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className='aucctus-bg-primary aucctus-border-secondary z-[9999] flex w-[480px] rounded-lg border shadow-lg'
              >
                {/* Left Panel - Question Selection */}
                <div className='aucctus-border-secondary flex-1 border-r p-4'>
                  <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-3'>
                    Change Question
                  </h4>
                  <div className='max-h-64 space-y-4 overflow-y-auto pr-2'>
                    {Object.entries(questionsByCategory).map(
                      ([categoryName, questions]) => (
                        <div key={categoryName}>
                          <div className='aucctus-text-xs aucctus-text-tertiary mb-2 font-semibold uppercase tracking-wide'>
                            {categoryName}
                          </div>
                          <div className='space-y-1'>
                            {questions.map((q) => (
                              <button
                                key={q.uuid}
                                className={cn(
                                  'flex w-full items-start gap-2 rounded-lg p-2.5 text-left transition-colors',
                                  localFilter.questionUuid === q.uuid
                                    ? 'bg-blue-50 ring-1 ring-blue-200'
                                    : 'aucctus-bg-primary-hover',
                                )}
                                onClick={() =>
                                  setLocalFilter((prev) => ({
                                    ...prev,
                                    questionUuid: q.uuid,
                                  }))
                                }
                              >
                                <div className='flex-1'>
                                  <p
                                    className={cn(
                                      'text-sm leading-snug',
                                      localFilter.questionUuid === q.uuid
                                        ? 'font-medium text-blue-900'
                                        : 'aucctus-text-secondary',
                                    )}
                                  >
                                    {q.text}
                                  </p>
                                </div>
                                <div className='flex flex-shrink-0 items-center gap-2'>
                                  {getImportanceBadge(q.importance)}
                                  {localFilter.questionUuid === q.uuid && (
                                    <Check className='h-4 w-4 stroke-blue-600' />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Right Panel - Score Configuration */}
                <div className='w-48 p-4'>
                  <h4 className='aucctus-text-sm-semibold aucctus-text-primary mb-3'>
                    Score Range
                  </h4>

                  <div className='space-y-4'>
                    {/* Quick Presets */}
                    <div>
                      <label className='aucctus-text-xs aucctus-text-tertiary mb-2 block font-medium'>
                        Quick Select
                      </label>
                      <div className='grid grid-cols-2 gap-1.5'>
                        <button
                          onClick={() => applyPreset(4, undefined)}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                            localFilter.minScore === 4 && !localFilter.maxScore
                              ? 'bg-blue-100 text-blue-800'
                              : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                          )}
                        >
                          4+ Only
                        </button>
                        <button
                          onClick={() => applyPreset(5, 5)}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                            localFilter.minScore === 5 &&
                              localFilter.maxScore === 5
                              ? 'bg-blue-100 text-blue-800'
                              : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                          )}
                        >
                          Perfect 5
                        </button>
                        <button
                          onClick={() => applyPreset(undefined, 2)}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                            !localFilter.minScore && localFilter.maxScore === 2
                              ? 'bg-blue-100 text-blue-800'
                              : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                          )}
                        >
                          Low (≤2)
                        </button>
                        <button
                          onClick={() => applyPreset(3, 3)}
                          className={cn(
                            'rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                            localFilter.minScore === 3 &&
                              localFilter.maxScore === 3
                              ? 'bg-blue-100 text-blue-800'
                              : 'aucctus-bg-secondary aucctus-text-secondary hover:aucctus-bg-tertiary',
                          )}
                        >
                          Neutral (3)
                        </button>
                      </div>
                    </div>

                    {/* Custom Range */}
                    <div className='aucctus-border-secondary border-t pt-3'>
                      <label className='aucctus-text-xs aucctus-text-tertiary mb-2 block font-medium'>
                        Custom Range
                      </label>
                      <div className='flex items-center gap-2'>
                        <input
                          type='number'
                          min={1}
                          max={5}
                          value={localFilter.minScore ?? ''}
                          onChange={(e) =>
                            setLocalFilter((prev) => ({
                              ...prev,
                              minScore: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }))
                          }
                          placeholder='Min'
                          className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-center text-sm'
                        />
                        <span className='aucctus-text-tertiary text-sm'>
                          to
                        </span>
                        <input
                          type='number'
                          min={1}
                          max={5}
                          value={localFilter.maxScore ?? ''}
                          onChange={(e) =>
                            setLocalFilter((prev) => ({
                              ...prev,
                              maxScore: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }))
                          }
                          placeholder='Max'
                          className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1.5 text-center text-sm'
                        />
                      </div>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => {
                        onChange(localFilter);
                        onOpenChange(false);
                      }}
                      className='btn btn-primary btn-sm w-full'
                    >
                      Apply Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </Popover.Content>
          )}
        </AnimatePresence>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default SubmissionFilter;
