/**
 * Concept Scoring Configuration Component
 *
 * Allows users to configure scoring categories and questions used to evaluate
 * concepts in their portfolio. Includes drag-and-drop reordering, importance
 * settings, and unsaved changes tracking.
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { useQueryClient } from 'react-query';
import { Icon, ComponentTooltip } from '@components';
import { cn } from '@libs/utils/react';
import { toast } from '@components';
import useStore from '@stores/store';
import {
  useScoringConfig,
  useSaveScoringConfig,
  useAutoInitScoringConfig,
} from '@hooks/query/scoringConfig.hook';
import { useConcepts } from '@hooks/query/concepts.hook';
import { useBulkPrioritySocketEvents } from '@hooks/query/concept-priority.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  IScoringCategory,
  IScoringConfigSave,
  Importance,
} from '@libs/api/types';
import { useModal } from '@context/ModalContextProvider';
import SaveScoringConfigModal from '@components/Modal/Nucleus/SaveScoringConfigModal';

import { ScoringCategory, ScoringQuestion } from './types';

// Helper to convert API categories to local state format
const apiToLocalCategories = (
  apiCategories: IScoringCategory[],
): ScoringCategory[] => {
  return apiCategories.map((cat) => ({
    id: cat.uuid,
    name: cat.name,
    icon: cat.icon,
    questions: cat.questions.map((q) => ({
      id: q.uuid,
      text: q.text,
      importance: q.importance as Importance,
    })),
  }));
};

// Helper to convert local state to API save format
const localToApiSave = (
  categories: ScoringCategory[],
  savedCategories: ScoringCategory[],
): IScoringConfigSave => {
  const savedCategoryIds = new Set(savedCategories.map((c) => c.id));
  const savedQuestionIds = new Set(
    savedCategories.flatMap((c) => c.questions.map((q) => q.id)),
  );

  // Find deleted categories and questions
  const currentCategoryIds = new Set(categories.map((c) => c.id));
  const currentQuestionIds = new Set(
    categories.flatMap((c) => c.questions.map((q) => q.id)),
  );

  const deletedCategoryUuids = savedCategories
    .filter((c) => !currentCategoryIds.has(c.id))
    .map((c) => c.id);

  const deletedQuestionUuids = savedCategories
    .flatMap((c) => c.questions)
    .filter((q) => !currentQuestionIds.has(q.id))
    .map((q) => q.id);

  return {
    categories: categories.map((cat, catIndex) => {
      const isNewCategory = !savedCategoryIds.has(cat.id);

      if (isNewCategory) {
        // New category
        return {
          name: cat.name,
          icon: cat.icon,
          order: catIndex,
          questions: cat.questions.map((q, qIndex) => ({
            text: q.text,
            importance: q.importance,
            order: qIndex,
          })),
        };
      } else {
        // Existing category - check for updates and new questions
        const existingQuestions = cat.questions
          .filter((q) => savedQuestionIds.has(q.id))
          .map((q, qIndex) => ({
            uuid: q.id,
            text: q.text,
            importance: q.importance,
            order: qIndex,
          }));

        const newQuestions = cat.questions
          .filter((q) => !savedQuestionIds.has(q.id))
          .map((q, qIndex) => ({
            text: q.text,
            importance: q.importance,
            order: existingQuestions.length + qIndex,
          }));

        return {
          uuid: cat.id,
          name: cat.name,
          icon: cat.icon,
          order: catIndex,
          questions: existingQuestions,
          newQuestions: newQuestions.length > 0 ? newQuestions : undefined,
        };
      }
    }),
    deletedCategoryUuids,
    deletedQuestionUuids,
    rescoreAll: false,
  };
};

// Importance config for the dropdown
const IMPORTANCE_DROPDOWN_CONFIG = {
  high: {
    label: 'High',
    description: "We'll weight these questions heaviest.",
    dotColor: 'bg-emerald-500',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  medium: {
    label: 'Medium',
    description: "We'll weight these questions normally.",
    dotColor: 'bg-amber-500',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  low: {
    label: 'Low',
    description: "We'll weight these questions lightest.",
    dotColor: 'bg-slate-400',
    bgClass: 'bg-slate-100 dark:bg-slate-800/50',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-200 dark:border-slate-700',
  },
};

// Importance Dropdown Component - matching the screenshot design
const ImportanceDropdown: React.FC<{
  value: Importance;
  onChange: (value: Importance) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = IMPORTANCE_DROPDOWN_CONFIG[value];

  const handleSelect = useCallback(
    (level: Importance) => {
      if (level !== value) {
        onChange(level);
      }
      setIsOpen(false);
    },
    [onChange, value],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className='flex items-center gap-2'>
      <span className='aucctus-text-sm aucctus-text-secondary'>
        Importance:
      </span>
      <div className='relative' ref={dropdownRef}>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            'flex h-8 items-center gap-2 rounded-md border px-3 py-1 transition-all hover:opacity-90',
            currentConfig.bgClass,
            currentConfig.borderClass,
          )}
        >
          <span className={cn('text-sm font-medium', currentConfig.textClass)}>
            {currentConfig.label}
          </span>
          <Icon
            variant='chevrondown'
            className={cn('h-4 w-4', currentConfig.textClass)}
            style={{ stroke: 'currentColor' }}
          />
        </button>

        {isOpen && (
          <div className='aucctus-bg-primary aucctus-border-secondary absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border shadow-lg'>
            {(['high', 'medium', 'low'] as Importance[]).map((level) => {
              const config = IMPORTANCE_DROPDOWN_CONFIG[level];
              const isSelected = value === level;

              return (
                <button
                  key={level}
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(level);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition',
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    isSelected && 'bg-gray-50 dark:bg-gray-800/50',
                  )}
                >
                  {/* Colored dot */}
                  <div
                    className={cn(
                      'mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full',
                      config.dotColor,
                    )}
                  />

                  {/* Text content */}
                  <div className='min-w-0 flex-1'>
                    <p className='aucctus-text-sm-semibold aucctus-text-primary'>
                      {config.label}
                    </p>
                    <p className='aucctus-text-xs aucctus-text-tertiary mt-0.5'>
                      {config.description}
                    </p>
                  </div>

                  {/* Checkmark for selected */}
                  {isSelected && (
                    <Icon
                      variant='check'
                      className='aucctus-stroke-primary mt-1 h-4 w-4 flex-shrink-0'
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Available icons for new categories
const AVAILABLE_ICONS = [
  'target',
  'trending-up',
  'users-02',
  'zap',
  'shield-dollar',
  'lightbulb',
];

// Icon component mapping
const CategoryIcon: React.FC<{ icon: string; className?: string }> = ({
  icon,
  className,
}) => {
  const iconVariant = icon as any;
  return (
    <Icon variant={iconVariant} className={className} height={16} width={16} />
  );
};

interface ConceptScoringConfigProps {
  /** Whether the configuration panel is expanded */
  isExpanded?: boolean;
  /** Callback when expand/collapse is toggled */
  onToggleExpand?: () => void;
}

const ConceptScoringConfig: React.FC<ConceptScoringConfigProps> = ({
  isExpanded = true,
  onToggleExpand,
}) => {
  // Get account UUID from store
  const account = useStore((state) => state.auth.account);
  const accountUuid = account?.uuid;

  // Modal hook
  const { openModal, closeModal } = useModal();

  // API hooks
  const {
    categories: apiCategories,
    isLoading,
    isError,
    currentVersion,
  } = useScoringConfig(accountUuid);
  const saveMutation = useSaveScoringConfig(accountUuid);

  // Auto-initialize scoring config with defaults if none exists
  useAutoInitScoringConfig(accountUuid);

  // Query client for marking concepts as calculating
  const queryClient = useQueryClient();

  // Get all concepts so we can mark them as calculating when re-scoring
  const { data: conceptsData } = useConcepts({});

  // Get startCalculating function to show skeletons on Portfolio page during rescore
  const { startCalculating } = useBulkPrioritySocketEvents();

  // Local state for editing - initialized from API data
  // Start with empty arrays - criteria are generated by Nucleus completion
  const [categories, setCategories] = useState<ScoringCategory[]>([]);
  const [savedCategories, setSavedCategories] = useState<ScoringCategory[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  // Track the last synced version to detect when fresh data arrives after save
  const [lastSyncedVersion, setLastSyncedVersion] = useState<number | null>(
    null,
  );
  // Track when we're waiting for fresh data after a save
  const [pendingSyncAfterSave, setPendingSyncAfterSave] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id || '',
  );

  // Initialize local state from API data
  // Only initialize after the API query has completed (not loading)
  useEffect(() => {
    // Don't do anything while still loading
    if (isLoading) return;

    const apiCategoryCount = apiCategories?.length ?? 0;

    // First-time initialization
    if (!isInitialized) {
      if (apiCategoryCount > 0) {
        // API returned categories - use them
        const localCategories = apiToLocalCategories(apiCategories);
        setCategories(localCategories);
        setSavedCategories(localCategories);
        setSelectedCategoryId(localCategories[0]?.id || '');
      } else {
        // API returned empty - keep empty arrays
        // Scoring criteria are generated by AI when Nucleus processing completes
        setCategories([]);
        setSavedCategories([]);
        setSelectedCategoryId('');
      }
      setIsInitialized(true);
      setLastSyncedVersion(currentVersion);
      return;
    }

    // After initialization: sync when API data changes (e.g., after save)
    // Only sync if we're expecting fresh data after a save AND the version changed
    // (version increments on every save, so this reliably detects fresh data)
    if (
      pendingSyncAfterSave &&
      apiCategoryCount > 0 &&
      currentVersion !== null &&
      lastSyncedVersion !== currentVersion
    ) {
      const localCategories = apiToLocalCategories(apiCategories);
      setCategories(localCategories);
      setSavedCategories(localCategories);
      // Preserve selected category if it still exists, otherwise select first
      const currentCategoryStillExists = localCategories.some(
        (c) => c.id === selectedCategoryId,
      );
      if (!currentCategoryStillExists) {
        setSelectedCategoryId(localCategories[0]?.id || '');
      }
      setLastSyncedVersion(currentVersion);
      setPendingSyncAfterSave(false);
    }
  }, [
    apiCategories,
    isLoading,
    isInitialized,
    lastSyncedVersion,
    currentVersion,
    pendingSyncAfterSave,
    selectedCategoryId,
  ]);

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Compute if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(categories) !== JSON.stringify(savedCategories);
  }, [categories, savedCategories]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const totalQuestions = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.questions.length, 0),
    [categories],
  );

  // Handlers
  const doSaveWithRescoreOption = useCallback(
    (rescoreAll: boolean) => {
      if (!accountUuid) {
        toast.error('Account not found');
        return;
      }

      const saveData = localToApiSave(categories, savedCategories);
      saveData.rescoreAll = rescoreAll;

      saveMutation.mutate(saveData, {
        onSuccess: () => {
          // Mark that we're waiting for fresh data from API after save
          // The useEffect will sync when the query refetches with updated data
          setPendingSyncAfterSave(true);
          closeModal();

          // If re-scoring all concepts, mark only COMPLETE concepts as calculating in the UI
          // This shows "Calculating..." in the priority cells until WebSocket events arrive
          // Also triggers skeleton loading on Portfolio page via startCalculating
          // NOTE: Backend only processes concepts with report_status_aggregate === 'complete'
          if (rescoreAll && conceptsData?.results) {
            // Filter to only complete concepts (same filter as backend)
            const completeConcepts = conceptsData.results.filter(
              (c) => c.reportStatusAggregate === 'complete',
            );

            if (completeConcepts.length > 0) {
              // Start calculating to show skeletons on Portfolio page
              startCalculating(completeConcepts.length);

              // Only mark complete concepts as calculating
              completeConcepts.forEach((concept) => {
                queryClient.setQueryData(
                  [AucctusQueryKeys.conceptPriority, concept.uuid],
                  { isCalculating: true },
                );
              });
            }
          }
        },
      });
    },
    [
      categories,
      savedCategories,
      accountUuid,
      saveMutation,
      closeModal,
      conceptsData?.results,
      queryClient,
      startCalculating,
    ],
  );

  const handleSaveChanges = useCallback(() => {
    if (!accountUuid) {
      toast.error('Account not found');
      return;
    }

    openModal(
      SaveScoringConfigModal,
      {
        onConfirm: doSaveWithRescoreOption,
        isSaving: saveMutation.isLoading,
      },
      {
        shouldCloseOnOverlayClick: !saveMutation.isLoading,
        shouldCloseOnEscape: !saveMutation.isLoading,
      },
    );
  }, [accountUuid, openModal, doSaveWithRescoreOption, saveMutation.isLoading]);

  const handleDiscardChanges = useCallback(() => {
    // Restore to last saved state (empty if nothing saved yet)
    setCategories([...savedCategories]);
    toast.info('Changes discarded');
  }, [savedCategories]);

  const handleAddCategory = useCallback(() => {
    if (!newCategoryName.trim()) return;

    const newCategory: ScoringCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName.trim(),
      icon: AVAILABLE_ICONS[categories.length % AVAILABLE_ICONS.length],
      // Initialize with one default question - categories must have at least one question
      questions: [
        {
          id: `question-${Date.now()}`,
          text: '',
          importance: 'medium' as Importance,
        },
      ],
    };

    setCategories((prev) => [...prev, newCategory]);
    setSelectedCategoryId(newCategory.id);
    setNewCategoryName('');
    setIsAddingCategory(false);
  }, [newCategoryName, categories.length]);

  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(
          categories.find((c) => c.id !== categoryId)?.id || '',
        );
      }
    },
    [selectedCategoryId, categories],
  );

  const handleStartRenameCategory = useCallback((category: ScoringCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  }, []);

  const handleRenameCategory = useCallback(() => {
    if (!editingCategoryName.trim() || !editingCategoryId) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === editingCategoryId
          ? { ...cat, name: editingCategoryName.trim() }
          : cat,
      ),
    );
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }, [editingCategoryId, editingCategoryName]);

  const handleAddQuestion = useCallback(() => {
    if (!selectedCategory) return;

    const newQuestion: ScoringQuestion = {
      id: `${selectedCategory.id}-${Date.now()}`,
      text: '',
      importance: 'medium',
    };

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === selectedCategoryId
          ? { ...cat, questions: [...cat.questions, newQuestion] }
          : cat,
      ),
    );
    setEditingQuestionId(newQuestion.id);
  }, [selectedCategory, selectedCategoryId]);

  const handleUpdateQuestion = useCallback(
    (questionId: string, updates: Partial<ScoringQuestion>) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategoryId
            ? {
                ...cat,
                questions: cat.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q,
                ),
              }
            : cat,
        ),
      );
    },
    [selectedCategoryId],
  );

  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === selectedCategoryId
            ? {
                ...cat,
                questions: cat.questions.filter((q) => q.id !== questionId),
              }
            : cat,
        ),
      );
    },
    [selectedCategoryId],
  );

  const handleImportanceChange = useCallback(
    (questionId: string, importance: Importance) => {
      handleUpdateQuestion(questionId, { importance });
    },
    [handleUpdateQuestion],
  );

  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-md'>
      {/* Header - Matches CategoryCard collapsed layout */}
      <div
        className={cn(
          'cursor-pointer p-4 text-left transition-all duration-300 ease-in-out',
          {
            'aucctus-bg-secondary-subtle aucctus-border-secondary border-b shadow-sm':
              isExpanded,
            'hover:aucctus-bg-primary-hover': !isExpanded,
          },
        )}
        onClick={onToggleExpand}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand?.();
          }
        }}
      >
        {isExpanded ? (
          /* Expanded layout - horizontal */
          <div className='flex items-center justify-between'>
            <div className='flex flex-1 items-center gap-4'>
              {/* Icon on the left */}
              <div className='aucctus-bg-brand-secondary aucctus-border-brand w-fit flex-shrink-0 rounded-lg border p-2'>
                <Icon
                  variant='target'
                  className='aucctus-stroke-brand-primary h-5 w-5'
                />
              </div>

              {/* Title and description to the right of icon */}
              <div className='min-w-0 flex-1'>
                <h3 className='aucctus-text-lg-bold aucctus-text-primary mb-1'>
                  Concept Scoring
                </h3>
                <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                  Configure the questions used to evaluate all concepts in your
                  portfolio
                </p>
              </div>
            </div>

            {/* Badge and Chevron on the right */}
            <div className='ml-4 flex flex-shrink-0 items-center gap-4'>
              {categories.length === 0 ? (
                <span className='aucctus-bg-warning-subtle aucctus-text-warning-primary rounded px-2 py-0.5 text-xs font-medium'>
                  Not configured
                </span>
              ) : (
                <span className='aucctus-bg-secondary aucctus-text-secondary rounded px-2 py-0.5 text-xs font-medium'>
                  {totalQuestions} questions
                </span>
              )}
              <Icon
                variant='chevrondown'
                className='aucctus-stroke-tertiary h-4 w-4'
              />
            </div>
          </div>
        ) : (
          /* Collapsed layout - vertical (matching CategoryCard) */
          <div>
            <div className='mb-4 flex items-start justify-between'>
              <div className='flex-1'>
                {/* Icon at top left */}
                <div className='mb-3'>
                  <div className='aucctus-bg-brand-secondary aucctus-border-brand w-fit rounded-lg border p-2'>
                    <Icon
                      variant='target'
                      className='aucctus-stroke-brand-primary h-5 w-5'
                    />
                  </div>
                </div>

                {/* Title below icon, left aligned */}
                <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
                  Concept Scoring
                </h3>
              </div>

              <Icon
                variant='chevronleft'
                className='aucctus-stroke-tertiary h-5 w-5 rotate-180'
              />
            </div>

            {/* Description - left aligned */}
            <p className='aucctus-text-sm aucctus-text-secondary -mt-1 mb-4 leading-relaxed'>
              Configure the questions used to evaluate all concepts in your
              portfolio
            </p>

            {/* Status Bar at Bottom - matching CategoryCard */}
            <div className='aucctus-border-primary mt-4 border-t pt-3'>
              <div className='flex items-center justify-between'>
                {categories.length === 0 ? (
                  <div className='aucctus-text-xs flex items-center gap-2'>
                    <div className='aucctus-bg-warning-subtle flex items-center gap-1.5 rounded-md px-2 py-1'>
                      <Icon
                        variant='clock'
                        className='aucctus-stroke-warning-primary h-4 w-4'
                      />
                      <span className='aucctus-text-warning-primary font-medium'>
                        Awaiting Nucleus completion
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='aucctus-text-xs flex items-center gap-2'>
                    <div className='aucctus-bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1'>
                      <Icon
                        variant='list'
                        className='aucctus-stroke-tertiary h-4 w-4'
                      />
                      <span className='aucctus-text-secondary font-medium'>
                        {categories.length} categories
                      </span>
                    </div>
                    <div className='aucctus-bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1'>
                      <Icon
                        variant='help-circle'
                        className='aucctus-stroke-tertiary h-4 w-4'
                      />
                      <span className='aucctus-text-secondary font-medium'>
                        {totalQuestions} questions
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Content with Animation */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          {
            'max-h-0 opacity-0': !isExpanded,
            'max-h-[700px] opacity-100': isExpanded,
          },
        )}
      >
        {isExpanded && (
          <>
            {/* Unsaved Changes Banner */}
            {hasUnsavedChanges && (
              <div className='aucctus-border-secondary flex items-center justify-between border-b bg-blue-50 px-4 py-2.5 dark:bg-blue-950/30'>
                <div className='flex items-center gap-2'>
                  <div className='h-2 w-2 animate-pulse rounded-full bg-blue-500' />
                  <span className='aucctus-text-sm-medium text-blue-800 dark:text-blue-300'>
                    You have unsaved changes
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <button
                    className='aucctus-text-sm px-3 py-1.5 text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'
                    onClick={handleDiscardChanges}
                    disabled={saveMutation.isLoading}
                  >
                    Discard
                  </button>
                  <button
                    className='btn btn-primary btn-sm'
                    onClick={handleSaveChanges}
                    disabled={saveMutation.isLoading}
                  >
                    {saveMutation.isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Main Content */}
            {isLoading && !isInitialized ? (
              <div className='flex h-[500px] items-center justify-center'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='aucctus-bg-secondary h-10 w-10 animate-spin rounded-full border-2 border-t-transparent' />
                  <p className='aucctus-text-sm aucctus-text-secondary'>
                    Loading scoring configuration...
                  </p>
                </div>
              </div>
            ) : isError ? (
              <div className='flex h-[500px] items-center justify-center'>
                <div className='flex flex-col items-center gap-3 text-center'>
                  <Icon
                    variant='alert-triangle'
                    className='aucctus-stroke-error-primary h-10 w-10'
                  />
                  <p className='aucctus-text-sm aucctus-text-error'>
                    Failed to load scoring configuration
                  </p>
                  <p className='aucctus-text-xs aucctus-text-secondary'>
                    Please try again or contact support
                  </p>
                </div>
              </div>
            ) : categories.length === 0 ? (
              /* Empty State - Scoring criteria not yet generated */
              <div className='flex h-[500px] items-center justify-center'>
                <div className='flex max-w-md flex-col items-center gap-4 text-center'>
                  <div className='aucctus-bg-secondary/50 rounded-full p-4'>
                    <Icon
                      variant='target'
                      className='aucctus-stroke-tertiary h-12 w-12'
                    />
                  </div>
                  <div>
                    <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
                      Scoring Criteria Not Configured
                    </h3>
                    <p className='aucctus-text-sm aucctus-text-secondary mb-4 leading-relaxed'>
                      Scoring criteria are automatically generated when your
                      Nucleus report completes. The AI will create customized
                      evaluation questions based on your company&apos;s
                      strategic context.
                    </p>
                    <div className='aucctus-bg-info-subtle aucctus-border-info-subtle rounded-lg border p-3'>
                      <div className='flex items-start gap-2'>
                        <Icon
                          variant='alert-circle'
                          className='aucctus-stroke-info-primary mt-0.5 h-4 w-4 shrink-0'
                        />
                        <p className='aucctus-text-xs aucctus-text-info-primary text-left'>
                          If you&apos;ve already completed a Nucleus run, please
                          contact your administrator to generate the scoring
                          criteria.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex h-[500px]'>
                {/* Left Sidebar - Categories */}
                <div className='aucctus-border-secondary aucctus-bg-secondary/30 w-72 overflow-y-auto border-r'>
                  <div className='p-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <p className='aucctus-text-xs-medium aucctus-text-secondary uppercase tracking-wide'>
                        Scoring Categories
                      </p>
                      <span className='aucctus-bg-secondary aucctus-text-secondary rounded px-2 py-0.5 text-xs font-medium'>
                        {totalQuestions} questions
                      </span>
                    </div>

                    <div className='space-y-1'>
                      {categories.map((category) => {
                        const isSelected = category.id === selectedCategoryId;
                        const isEditing = editingCategoryId === category.id;

                        return (
                          <div
                            key={category.id}
                            onClick={() => setSelectedCategoryId(category.id)}
                            className={cn(
                              'group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                              {
                                'aucctus-bg-primary aucctus-border-secondary border shadow-sm':
                                  isSelected,
                                'hover:bg-white/60 dark:hover:bg-gray-800/60':
                                  !isSelected,
                              },
                            )}
                          >
                            <div
                              className={cn('shrink-0 rounded-md p-1.5', {
                                'aucctus-bg-brand-secondary': isSelected,
                                'aucctus-bg-secondary': !isSelected,
                              })}
                            >
                              <CategoryIcon
                                icon={category.icon}
                                className={cn({
                                  'aucctus-stroke-brand-primary': isSelected,
                                  'aucctus-stroke-tertiary': !isSelected,
                                })}
                              />
                            </div>
                            <div className='min-w-0 flex-1 text-left'>
                              {isEditing ? (
                                <input
                                  value={editingCategoryName}
                                  onChange={(e) =>
                                    setEditingCategoryName(e.target.value)
                                  }
                                  onBlur={handleRenameCategory}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                      handleRenameCategory();
                                    if (e.key === 'Escape') {
                                      setEditingCategoryId(null);
                                      setEditingCategoryName('');
                                    }
                                  }}
                                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary h-6 w-full rounded border px-2 py-0 text-sm'
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <p
                                    className={cn(
                                      'truncate text-left text-sm font-medium',
                                      {
                                        'aucctus-text-primary': isSelected,
                                        'aucctus-text-secondary': !isSelected,
                                      },
                                    )}
                                  >
                                    {category.name}
                                  </p>
                                  <p className='aucctus-text-xs aucctus-text-secondary text-left'>
                                    {category.questions.length} question
                                    {category.questions.length !== 1 ? 's' : ''}
                                  </p>
                                </>
                              )}
                            </div>
                            {isSelected && !isEditing && (
                              <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                                <button
                                  className='hover:aucctus-bg-secondary rounded p-1 transition-colors'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRenameCategory(category);
                                  }}
                                  title='Rename'
                                >
                                  <Icon
                                    variant='edit'
                                    className='aucctus-stroke-tertiary'
                                    height={14}
                                    width={14}
                                  />
                                </button>
                                <button
                                  className='hover:aucctus-bg-error-subtle rounded p-1 transition-colors'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(category.id);
                                  }}
                                  title='Delete'
                                >
                                  <Icon
                                    variant='trash'
                                    className='aucctus-stroke-error-primary'
                                    height={14}
                                    width={14}
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Add Category */}
                      {isAddingCategory ? (
                        <div className='aucctus-border-secondary aucctus-bg-primary mt-2 rounded-lg border p-2 shadow-sm'>
                          <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder='Category name...'
                            className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary mb-2 h-8 w-full rounded border px-2 text-sm'
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddCategory();
                              if (e.key === 'Escape') {
                                setIsAddingCategory(false);
                                setNewCategoryName('');
                              }
                            }}
                          />
                          <div className='flex gap-1'>
                            <button
                              className='btn btn-primary btn-sm flex-1'
                              onClick={handleAddCategory}
                            >
                              Add
                            </button>
                            <button
                              className='btn btn-light btn-sm'
                              onClick={() => {
                                setIsAddingCategory(false);
                                setNewCategoryName('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingCategory(true)}
                          className='aucctus-border-secondary aucctus-text-secondary hover:aucctus-text-primary mt-2 flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-all hover:border-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60'
                        >
                          <div className='aucctus-bg-secondary rounded-md p-1.5'>
                            <Icon
                              variant='plus'
                              className='aucctus-stroke-tertiary'
                              height={16}
                              width={16}
                            />
                          </div>
                          <span className='text-sm font-medium'>
                            Add Category
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Questions */}
                <div className='flex-1 overflow-y-auto p-6'>
                  {selectedCategory ? (
                    <div className='flex h-full flex-col'>
                      <div className='mb-4 flex items-center justify-between'>
                        <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                          Questions
                        </h4>
                        <button
                          className='btn btn-primary btn-sm'
                          onClick={handleAddQuestion}
                        >
                          <Icon
                            variant='plus'
                            className='aucctus-stroke-white'
                            height={16}
                            width={16}
                          />
                          Add Question
                        </button>
                      </div>

                      {/* Questions List */}
                      <div className='space-y-2'>
                        {selectedCategory.questions.length === 0 ? (
                          <div className='aucctus-text-secondary py-12 text-center'>
                            <Icon
                              variant='lightbulb'
                              className='aucctus-stroke-tertiary mx-auto mb-3 h-10 w-10 opacity-30'
                            />
                            <p className='aucctus-text-sm'>No questions yet</p>
                            <p className='aucctus-text-xs mt-1'>
                              Add questions to evaluate concepts in this
                              category
                            </p>
                          </div>
                        ) : (
                          selectedCategory.questions.map((question) => (
                            <div
                              key={question.id}
                              className='aucctus-bg-primary aucctus-border-secondary group rounded-lg border p-3 shadow-sm transition-colors hover:border-gray-300 dark:hover:border-gray-600'
                            >
                              <div className='flex items-start gap-3'>
                                {/* Drag Handle */}
                                <div className='mt-2.5 cursor-grab opacity-40 transition-opacity active:cursor-grabbing group-hover:opacity-100'>
                                  <Icon
                                    variant='dots-vertical'
                                    className='aucctus-stroke-tertiary'
                                    height={16}
                                    width={16}
                                  />
                                </div>

                                {/* Question Content */}
                                <div className='min-w-0 flex-1 space-y-2'>
                                  {editingQuestionId === question.id ? (
                                    <input
                                      value={question.text}
                                      onChange={(e) =>
                                        handleUpdateQuestion(question.id, {
                                          text: e.target.value,
                                        })
                                      }
                                      onBlur={() => setEditingQuestionId(null)}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === 'Enter' ||
                                          e.key === 'Escape'
                                        )
                                          setEditingQuestionId(null);
                                      }}
                                      placeholder='Enter question text...'
                                      className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded border px-2 py-1 text-sm'
                                      autoFocus
                                    />
                                  ) : (
                                    <p
                                      className='aucctus-text-sm aucctus-text-primary hover:aucctus-bg-secondary cursor-text rounded px-2 py-1 transition-colors'
                                      onClick={() =>
                                        setEditingQuestionId(question.id)
                                      }
                                    >
                                      {question.text || (
                                        <span className='aucctus-text-tertiary italic'>
                                          Click to add question text...
                                        </span>
                                      )}
                                    </p>
                                  )}

                                  {/* Importance Selector */}
                                  <ImportanceDropdown
                                    value={question.importance}
                                    onChange={(importance) =>
                                      handleImportanceChange(
                                        question.id,
                                        importance,
                                      )
                                    }
                                  />
                                </div>

                                {/* Delete Button - disabled if last question in category */}
                                {selectedCategory.questions.length === 1 ? (
                                  <ComponentTooltip
                                    tip={
                                      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
                                        <span className='aucctus-text-xs aucctus-text-primary whitespace-nowrap'>
                                          Categories must have at least one
                                          question
                                        </span>
                                      </div>
                                    }
                                    preferredPosition='above'
                                  >
                                    <button
                                      className='h-8 w-8 cursor-not-allowed rounded p-1.5 opacity-30'
                                      disabled
                                      title='Categories must have at least one question'
                                    >
                                      <Icon
                                        variant='trash'
                                        className='aucctus-stroke-tertiary'
                                        height={16}
                                        width={16}
                                      />
                                    </button>
                                  </ComponentTooltip>
                                ) : (
                                  <button
                                    className='hover:aucctus-bg-error-subtle h-8 w-8 rounded p-1.5 opacity-0 transition-all group-hover:opacity-100'
                                    onClick={() =>
                                      handleDeleteQuestion(question.id)
                                    }
                                    title='Delete question'
                                  >
                                    <Icon
                                      variant='trash'
                                      className='aucctus-stroke-error-primary'
                                      height={16}
                                      width={16}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='aucctus-text-secondary flex h-full items-center justify-center'>
                      <p className='aucctus-text-sm'>
                        Select a category to view questions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ConceptScoringConfig);
