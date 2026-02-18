/**
 * Concept Scoring Configuration Component
 *
 * Allows users to configure scoring categories and questions used to evaluate
 * concepts in their portfolio. Includes drag-and-drop reordering, importance
 * settings, and unsaved changes tracking.
 */

import { ComponentTooltip, toast } from '@components';
import SaveScoringConfigModal from '@components/Modal/Nucleus/SaveScoringConfigModal';
import { useModal } from '@context/ModalContextProvider';
import { useBulkPrioritySocketEvents } from '@hooks/query/concept-priority.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  useDeleteScoringConfig,
  useRenameScoringConfig,
  useSaveScoringConfig,
  useScoringConfig,
  useScoringConfigs,
  useSetDefaultScoringConfig,
} from '@hooks/query/scoringConfig.hook';
import api from '@libs/api';
import {
  IScoringCategory,
  IScoringConfigSave,
  IScoringConfigSummary,
  Importance,
} from '@libs/api/types';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from 'react-query';
import { AnimatePresence, motion } from 'framer-motion';

import ConceptScoringConfigSkeleton from './ConceptScoringConfigSkeleton';
import { ScoringCategory, ScoringQuestion } from './types';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  EllipsisVertical,
  HelpCircle,
  Lightbulb,
  List,
  Pencil,
  Plus,
  Settings,
  Target,
  Trash2,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

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

// Importance Dropdown Component - portal-based to avoid modal overflow clipping
const ImportanceDropdown: React.FC<{
  value: Importance;
  onChange: (value: Importance) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

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

  // Position dropdown below the trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isPortalTarget = target?.closest(
        '[data-aucctus-portal-target="true"]',
      );
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target) &&
        !isPortalTarget
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className='flex items-center gap-2'>
      <span className='aucctus-text-sm aucctus-text-secondary'>
        Importance:
      </span>
      <div className='relative'>
        <button
          ref={triggerRef}
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
          <ChevronDown
            className={cn('h-4 w-4', currentConfig.textClass)}
            style={{ stroke: 'currentColor' }}
          />
        </button>

        {isOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className='aucctus-bg-primary aucctus-border-secondary fixed z-[9999] w-64 overflow-hidden rounded-lg border shadow-lg'
              style={{ top: position.top, left: position.left }}
              data-aucctus-portal-target='true'
            >
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
                    data-aucctus-portal-target='true'
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
                      <Check className='aucctus-stroke-primary mt-1 h-4 w-4 flex-shrink-0' />
                    )}
                  </button>
                );
              })}
            </div>,
            document.body,
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
    <DynamicIcon
      variant={iconVariant}
      className={className}
      height={16}
      width={16}
    />
  );
};

// Portal-based dropdown menu for config actions (avoids layout shift in sidebar)
const ConfigDropdownMenu: React.FC<{
  config: IScoringConfigSummary;
  isActive: boolean;
  isOpen: boolean;
  isSidebarExpanded: boolean;
  onOpenChange: (open: boolean) => void;
  onSetDefault: () => void;
  onRename: () => void;
  onDelete: () => void;
}> = ({
  config,
  isActive,
  isOpen,
  isSidebarExpanded,
  onOpenChange,
  onSetDefault,
  onRename,
  onDelete,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Position dropdown below the trigger
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: Math.max(8, rect.right - 160),
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onOpenChange]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onOpenChange]);

  return (
    <div
      className={cn(
        'shrink-0',
        isOpen || isSidebarExpanded ? 'block' : 'hidden',
      )}
    >
      <button
        ref={triggerRef}
        className={cn(
          'hover:aucctus-bg-secondary rounded p-0.5 transition-opacity',
          isActive || isOpen
            ? 'opacity-60 hover:opacity-100'
            : 'opacity-0 group-hover:opacity-60 group-hover:hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onOpenChange(!isOpen);
        }}
      >
        <EllipsisVertical className='aucctus-stroke-tertiary' size={14} />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className='aucctus-bg-primary aucctus-border-secondary fixed z-[9999] min-w-[160px] overflow-hidden rounded-lg border shadow-lg'
              style={{ top: position.top, left: position.left }}
            >
              {!config.isDefault && (
                <button
                  className='aucctus-text-sm aucctus-text-primary flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800'
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault();
                    onOpenChange(false);
                  }}
                >
                  <Check className='aucctus-stroke-primary h-4 w-4' />
                  Set as Default
                </button>
              )}
              <button
                className='aucctus-text-sm aucctus-text-primary flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800'
                onClick={(e) => {
                  e.stopPropagation();
                  onRename();
                  onOpenChange(false);
                }}
              >
                <Pencil className='aucctus-stroke-primary h-4 w-4' />
                Rename
              </button>
              {!config.isDefault && (
                <>
                  <div className='aucctus-border-secondary my-1 h-px' />
                  <button
                    className='aucctus-text-sm flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      onOpenChange(false);
                    }}
                  >
                    <Trash2 className='aucctus-stroke-error-primary h-4 w-4' />
                    Delete
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
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

  // Multi-config hooks (must come before useScoringConfig to compute activeConfigUuid)
  const { configs, isLoading: isConfigsLoading } =
    useScoringConfigs(accountUuid);
  const deleteConfigMutation = useDeleteScoringConfig(accountUuid);
  const setDefaultMutation = useSetDefaultScoringConfig(accountUuid);
  const renameConfigMutation = useRenameScoringConfig(accountUuid);

  // Selected config (null = default)
  const [selectedConfigUuid, setSelectedConfigUuid] = useState<string | null>(
    null,
  );
  const [renamingConfigUuid, setRenamingConfigUuid] = useState<string | null>(
    null,
  );
  const [renamingConfigName, setRenamingConfigName] = useState('');
  const [isAddingConfig, setIsAddingConfig] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  // Draft config: exists only in local state until first save
  const [draftConfig, setDraftConfig] = useState<{
    name: string;
    tempId: string;
  } | null>(null);
  const [openDropdownConfigUuid, setOpenDropdownConfigUuid] = useState<
    string | null
  >(null);

  // Sidebar expand/collapse with 1s delayed collapse
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSidebarExpanded =
    isSidebarHovered ||
    !!openDropdownConfigUuid ||
    !!renamingConfigUuid ||
    isAddingConfig;

  const handleSidebarMouseEnter = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    setIsSidebarHovered(true);
  }, []);

  const handleSidebarMouseLeave = useCallback(() => {
    collapseTimerRef.current = setTimeout(
      () => setIsSidebarHovered(false),
      1000,
    );
  }, []);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const defaultConfig = configs.find((c: IScoringConfigSummary) => c.isDefault);
  const activeConfigUuid = selectedConfigUuid || defaultConfig?.uuid || null;
  const isDraftActive =
    draftConfig !== null && selectedConfigUuid === draftConfig.tempId;

  // API hooks - pass null when draft is active so we don't fetch/save a nonexistent config
  const configUuidForApi = isDraftActive ? null : activeConfigUuid;
  const {
    categories: apiCategories,
    isLoading,
    isError,
    currentVersion,
  } = useScoringConfig(accountUuid, configUuidForApi);
  const saveMutation = useSaveScoringConfig(accountUuid, configUuidForApi);

  // Query client for marking concepts as calculating
  const queryClient = useQueryClient();

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

  // Reset initialization when switching configs so data re-syncs
  const prevConfigUuidRef = useRef(activeConfigUuid);
  useEffect(() => {
    if (prevConfigUuidRef.current !== activeConfigUuid) {
      prevConfigUuidRef.current = activeConfigUuid;
      setIsInitialized(false);
      setPendingSyncAfterSave(false);
      setLastSyncedVersion(null);
    }
  }, [activeConfigUuid]);

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

  // Validation: compute errors from current categories
  const validationErrors = useMemo(() => {
    const errors: {
      type:
        | 'no_categories'
        | 'empty_category'
        | 'empty_question'
        | 'duplicate_category'
        | 'duplicate_question';
      categoryId?: string;
      message: string;
    }[] = [];

    if (categories.length === 0) {
      errors.push({
        type: 'no_categories',
        message: 'Add at least one category',
      });
      return errors;
    }

    // Check for duplicate category names
    const seenCategoryNames = new Set<string>();
    for (const category of categories) {
      const normalizedName = category.name.trim().toLowerCase();
      if (seenCategoryNames.has(normalizedName)) {
        errors.push({
          type: 'duplicate_category',
          categoryId: category.id,
          message: `Duplicate category name "${category.name}"`,
        });
      }
      seenCategoryNames.add(normalizedName);
    }

    for (const category of categories) {
      if (category.questions.length === 0) {
        errors.push({
          type: 'empty_category',
          categoryId: category.id,
          message: `"${category.name}" needs at least one question`,
        });
      }

      // Check for duplicate question text within a category
      const seenQuestionTexts = new Set<string>();
      for (const question of category.questions) {
        if (!question.text.trim()) {
          errors.push({
            type: 'empty_question',
            categoryId: category.id,
            message: `"${category.name}" has a question with empty text`,
          });
        } else {
          const normalizedText = question.text.trim().toLowerCase();
          if (seenQuestionTexts.has(normalizedText)) {
            errors.push({
              type: 'duplicate_question',
              categoryId: category.id,
              message: `"${category.name}" has duplicate question "${question.text.length > 40 ? question.text.slice(0, 40) + '...' : question.text}"`,
            });
          }
          seenQuestionTexts.add(normalizedText);
        }
      }
    }

    return errors;
  }, [categories]);

  const isValid = validationErrors.length === 0;

  // Set of category IDs that have validation errors (for visual indicators)
  const categoryIdsWithErrors = useMemo(
    () =>
      new Set(
        validationErrors.filter((e) => e.categoryId).map((e) => e.categoryId),
      ),
    [validationErrors],
  );

  // Handlers
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const doSaveWithRescoreOption = useCallback(
    async (rescoreAll: boolean) => {
      if (!accountUuid) {
        toast.error('Account not found');
        return;
      }

      // Draft config flow: create on backend first, then save categories
      if (isDraftActive && draftConfig) {
        setIsSavingDraft(true);
        try {
          const created = await api.account.createScoringConfig(accountUuid, {
            name: draftConfig.name,
          });
          const newUuid = created.uuid;

          // All categories are new for a draft (no savedCategories)
          const saveData = localToApiSave(categories, []);
          saveData.rescoreAll = rescoreAll;

          const response = await api.account.saveScoringConfigDetail(
            accountUuid,
            newUuid,
            saveData,
          );

          // Clear draft and select the real config
          setDraftConfig(null);
          setSelectedConfigUuid(newUuid);

          // Invalidate queries so the new config appears in the sidebar
          queryClient.invalidateQueries({
            queryKey: ['scoringConfigs', accountUuid],
          });
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.scoringConfig, accountUuid],
          });

          closeModal();
          toast.success('Scoring config created');

          if (rescoreAll) {
            const affectedUuids = response?.affectedConceptUuids ?? [];
            if (affectedUuids.length > 0) {
              startCalculating(affectedUuids.length);
              affectedUuids.forEach((conceptUuid) => {
                queryClient.setQueryData(
                  [AucctusQueryKeys.conceptPriority, conceptUuid],
                  { isCalculating: true },
                );
              });
            }
          }
        } catch {
          toast.error('Failed to create scoring config');
        } finally {
          setIsSavingDraft(false);
        }
        return;
      }

      // Existing config flow
      const saveData = localToApiSave(categories, savedCategories);
      saveData.rescoreAll = rescoreAll;

      saveMutation.mutate(saveData, {
        onSuccess: (result) => {
          setPendingSyncAfterSave(true);
          closeModal();

          if (rescoreAll) {
            const affectedUuids = result?.affectedConceptUuids ?? [];

            if (affectedUuids.length > 0) {
              startCalculating(affectedUuids.length);

              affectedUuids.forEach((conceptUuid) => {
                queryClient.setQueryData(
                  [AucctusQueryKeys.conceptPriority, conceptUuid],
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
      isDraftActive,
      draftConfig,
      saveMutation,
      closeModal,
      queryClient,
      startCalculating,
    ],
  );

  const handleSaveChanges = useCallback(() => {
    if (!accountUuid) {
      toast.error('Account not found');
      return;
    }
    if (!isValid) {
      toast.error(
        validationErrors[0]?.message ||
          'Please fix validation errors before saving',
      );
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
  }, [
    accountUuid,
    isValid,
    validationErrors,
    openModal,
    doSaveWithRescoreOption,
    saveMutation.isLoading,
  ]);

  const handleDiscardChanges = useCallback(() => {
    if (isDraftActive) {
      // Discard the entire draft config
      setDraftConfig(null);
      setSelectedConfigUuid(defaultConfig?.uuid || null);
      toast.info('Draft discarded');
      return;
    }
    // Restore to last saved state (empty if nothing saved yet)
    setCategories([...savedCategories]);
    toast.info('Changes discarded');
  }, [isDraftActive, savedCategories, defaultConfig?.uuid]);

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
                <Target className='aucctus-stroke-brand-primary h-5 w-5' />
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
              <ChevronDown className='aucctus-stroke-tertiary h-4 w-4' />
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
                    <Target className='aucctus-stroke-brand-primary h-5 w-5' />
                  </div>
                </div>

                {/* Title below icon, left aligned */}
                <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
                  Concept Scoring
                </h3>
              </div>

              <ChevronLeft className='aucctus-stroke-tertiary h-5 w-5 rotate-180' />
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
                      <Clock className='aucctus-stroke-warning-primary h-4 w-4' />
                      <span className='aucctus-text-warning-primary font-medium'>
                        Awaiting Nucleus completion
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className='aucctus-text-xs flex items-center gap-2'>
                    <div className='aucctus-bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1'>
                      <List className='aucctus-stroke-tertiary h-4 w-4' />
                      <span className='aucctus-text-secondary font-medium'>
                        {categories.length} categories
                      </span>
                    </div>
                    <div className='aucctus-bg-secondary flex items-center gap-1.5 rounded-md px-2 py-1'>
                      <HelpCircle className='aucctus-stroke-tertiary h-4 w-4' />
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
              <>
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
                      disabled={saveMutation.isLoading || isSavingDraft}
                    >
                      {isDraftActive ? 'Discard Draft' : 'Discard'}
                    </button>
                    <button
                      className='btn btn-primary btn-sm'
                      onClick={handleSaveChanges}
                      disabled={
                        saveMutation.isLoading || isSavingDraft || !isValid
                      }
                    >
                      {saveMutation.isLoading || isSavingDraft
                        ? 'Saving...'
                        : 'Save Changes'}
                    </button>
                  </div>
                </div>
                {!isValid && (
                  <div className='aucctus-border-secondary flex items-center gap-2 border-b bg-red-50 px-4 py-2 dark:bg-red-950/20'>
                    <AlertTriangle className='h-4 w-4 shrink-0 text-red-500' />
                    <span className='aucctus-text-sm text-red-700 dark:text-red-400'>
                      {validationErrors[0]?.message}
                      {validationErrors.length > 1 &&
                        ` (+${validationErrors.length - 1} more)`}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Main Content */}
            <div className='flex'>
              {/* Config Sidebar - collapsed by default, expands on hover */}
              <div
                className={cn(
                  'aucctus-border-secondary aucctus-bg-secondary/30 flex shrink-0 flex-col border-r transition-all duration-200 ease-in-out',
                  isSidebarExpanded ? 'w-52' : 'w-12',
                )}
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
              >
                <div
                  className={cn(
                    'flex-1 overflow-y-auto overflow-x-hidden pb-2 pt-2 transition-all duration-200',
                    isSidebarExpanded ? 'px-2' : 'px-1',
                  )}
                >
                  {isConfigsLoading ? (
                    <div
                      className={cn(
                        'flex flex-col gap-2',
                        isSidebarExpanded ? 'items-stretch' : 'items-center',
                      )}
                    >
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'aucctus-bg-secondary h-9 animate-pulse rounded-lg',
                            isSidebarExpanded ? 'w-full' : 'w-9',
                          )}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className='space-y-1'>
                      {[...configs]
                        .sort(
                          (
                            a: IScoringConfigSummary,
                            b: IScoringConfigSummary,
                          ) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0),
                        )
                        .map((config: IScoringConfigSummary) => {
                          const isActive = activeConfigUuid === config.uuid;
                          const isDeleting =
                            deleteConfigMutation.isLoading &&
                            deleteConfigMutation.variables === config.uuid;
                          const isSettingDefault =
                            setDefaultMutation.isLoading &&
                            setDefaultMutation.variables === config.uuid;
                          const isRenaming = renamingConfigUuid === config.uuid;

                          return (
                            <div
                              key={config.uuid}
                              onClick={() => setSelectedConfigUuid(config.uuid)}
                              className={cn(
                                'group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-all',
                                isActive
                                  ? 'aucctus-bg-primary aucctus-border-secondary border shadow-sm'
                                  : 'hover:bg-white/60 dark:hover:bg-gray-800/60',
                                isDeleting && 'pointer-events-none opacity-40',
                              )}
                            >
                              {/* Config icon */}
                              <div className='relative shrink-0'>
                                <Settings
                                  className={cn(
                                    'h-4 w-4',
                                    isActive
                                      ? 'aucctus-stroke-brand-primary'
                                      : 'aucctus-stroke-tertiary',
                                  )}
                                />
                                {/* Green dot for default */}
                                {config.isDefault && (
                                  <div
                                    className={cn(
                                      'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-gray-900',
                                      isSettingDefault && 'animate-ping',
                                    )}
                                  />
                                )}
                                {isSettingDefault && !config.isDefault && (
                                  <div className='absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full border border-white bg-emerald-300 dark:border-gray-900' />
                                )}
                              </div>

                              {/* Config name + actions - hidden when collapsed */}
                              <div
                                className={cn(
                                  'min-w-0 flex-1',
                                  isSidebarExpanded ? 'block' : 'hidden',
                                )}
                              >
                                {isRenaming ? (
                                  <input
                                    value={renamingConfigName}
                                    onChange={(e) =>
                                      setRenamingConfigName(e.target.value)
                                    }
                                    onBlur={() => {
                                      if (renamingConfigName.trim()) {
                                        renameConfigMutation.mutate({
                                          configUuid: config.uuid,
                                          name: renamingConfigName.trim(),
                                        });
                                      }
                                      setRenamingConfigUuid(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        if (renamingConfigName.trim()) {
                                          renameConfigMutation.mutate({
                                            configUuid: config.uuid,
                                            name: renamingConfigName.trim(),
                                          });
                                        }
                                        setRenamingConfigUuid(null);
                                      }
                                      if (e.key === 'Escape') {
                                        setRenamingConfigUuid(null);
                                      }
                                    }}
                                    className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary h-6 w-full rounded border px-1.5 text-xs'
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <p
                                    className={cn(
                                      'truncate text-sm',
                                      isActive
                                        ? 'aucctus-text-primary font-medium'
                                        : 'aucctus-text-secondary',
                                    )}
                                  >
                                    {config.name}
                                  </p>
                                )}
                              </div>

                              {/* Default badge - hidden when collapsed */}
                              {config.isDefault && !isRenaming && (
                                <span
                                  className={cn(
                                    'shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                                    isSidebarExpanded ? 'inline' : 'hidden',
                                  )}
                                >
                                  Default
                                </span>
                              )}

                              {/* Triple-dot menu */}
                              {!isRenaming && (
                                <ConfigDropdownMenu
                                  config={config}
                                  isActive={isActive}
                                  isOpen={
                                    openDropdownConfigUuid === config.uuid
                                  }
                                  isSidebarExpanded={isSidebarExpanded}
                                  onOpenChange={(open) =>
                                    setOpenDropdownConfigUuid(
                                      open ? config.uuid : null,
                                    )
                                  }
                                  onSetDefault={() =>
                                    setDefaultMutation.mutate(config.uuid)
                                  }
                                  onRename={() => {
                                    setRenamingConfigUuid(config.uuid);
                                    setRenamingConfigName(config.name);
                                  }}
                                  onDelete={() =>
                                    deleteConfigMutation.mutate(config.uuid)
                                  }
                                />
                              )}
                            </div>
                          );
                        })}

                      {/* Draft config in sidebar */}
                      {draftConfig && (
                        <div
                          onClick={() =>
                            setSelectedConfigUuid(draftConfig.tempId)
                          }
                          className={cn(
                            'group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-all',
                            activeConfigUuid === draftConfig.tempId
                              ? 'aucctus-bg-primary aucctus-border-secondary border shadow-sm'
                              : 'hover:bg-white/60 dark:hover:bg-gray-800/60',
                          )}
                        >
                          <Settings
                            className={cn(
                              'h-4 w-4 shrink-0',
                              activeConfigUuid === draftConfig.tempId
                                ? 'aucctus-stroke-brand-primary'
                                : 'aucctus-stroke-tertiary',
                            )}
                          />
                          <p
                            className={cn(
                              'min-w-0 flex-1 truncate text-sm',
                              isSidebarExpanded ? 'block' : 'hidden',
                              activeConfigUuid === draftConfig.tempId
                                ? 'aucctus-text-primary font-medium'
                                : 'aucctus-text-secondary',
                            )}
                          >
                            {draftConfig.name}
                          </p>
                          <span
                            className={cn(
                              'shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                              isSidebarExpanded ? 'inline' : 'hidden',
                            )}
                          >
                            Draft
                          </span>
                        </div>
                      )}

                      {/* Inline add config */}
                      {isAddingConfig ? (
                        <div
                          className={cn(
                            'mt-1 rounded-lg px-2.5 py-2',
                            isSidebarExpanded ? 'block' : 'hidden',
                          )}
                        >
                          <div className='flex items-center gap-2'>
                            <Settings className='aucctus-stroke-tertiary h-4 w-4 shrink-0' />
                            <input
                              value={newConfigName}
                              onChange={(e) => setNewConfigName(e.target.value)}
                              onBlur={() => {
                                if (newConfigName.trim()) {
                                  const tempId = `draft-${Date.now()}`;
                                  setDraftConfig({
                                    name: newConfigName.trim(),
                                    tempId,
                                  });
                                  setSelectedConfigUuid(tempId);
                                  setCategories([]);
                                  setSavedCategories([]);
                                  setIsInitialized(true);
                                  setSelectedCategoryId('');
                                }
                                setNewConfigName('');
                                setIsAddingConfig(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && newConfigName.trim()) {
                                  const tempId = `draft-${Date.now()}`;
                                  setDraftConfig({
                                    name: newConfigName.trim(),
                                    tempId,
                                  });
                                  setSelectedConfigUuid(tempId);
                                  setCategories([]);
                                  setSavedCategories([]);
                                  setIsInitialized(true);
                                  setSelectedCategoryId('');
                                  setNewConfigName('');
                                  setIsAddingConfig(false);
                                }
                                if (e.key === 'Escape') {
                                  setIsAddingConfig(false);
                                  setNewConfigName('');
                                }
                              }}
                              placeholder='Config name...'
                              className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary h-6 w-full rounded border px-1.5 text-xs'
                              autoFocus
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (draftConfig) {
                              toast.info(
                                'Save or discard your current draft config first',
                              );
                              return;
                            }
                            setIsAddingConfig(true);
                          }}
                          className='aucctus-text-secondary hover:aucctus-text-primary mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all hover:bg-white/60 dark:hover:bg-gray-800/60'
                        >
                          <Plus className='aucctus-stroke-tertiary h-4 w-4 shrink-0' />
                          <span
                            className={cn(
                              'whitespace-nowrap text-xs font-medium',
                              isSidebarExpanded ? 'inline' : 'hidden',
                            )}
                          >
                            New Config
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Main scoring content */}
              <div className='min-w-0 flex-1'>
                {isLoading && !isInitialized ? (
                  <ConceptScoringConfigSkeleton />
                ) : isError ? (
                  <div className='flex h-[500px] items-center justify-center'>
                    <div className='flex flex-col items-center gap-3 text-center'>
                      <AlertTriangle className='aucctus-stroke-error-primary h-10 w-10' />
                      <p className='aucctus-text-sm aucctus-text-error'>
                        Failed to load scoring configuration
                      </p>
                      <p className='aucctus-text-xs aucctus-text-secondary'>
                        Please try again or contact support
                      </p>
                    </div>
                  </div>
                ) : categories.length === 0 && !isAddingCategory ? (
                  /* Empty State - no categories yet */
                  <div className='flex h-[500px] items-center justify-center'>
                    <div className='flex max-w-md flex-col items-center gap-4 text-center'>
                      <div className='aucctus-bg-secondary/50 rounded-full p-4'>
                        <Target className='aucctus-stroke-tertiary h-12 w-12' />
                      </div>
                      <div>
                        {configs.length === 0 ? (
                          <>
                            <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
                              No Scoring Configs
                            </h3>
                            <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                              Use the sidebar on the left to create your first
                              scoring config.
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
                              No Scoring Categories
                            </h3>
                            <p className='aucctus-text-sm aucctus-text-secondary mb-4 leading-relaxed'>
                              Add categories and questions to define how
                              concepts are scored with this config.
                            </p>
                            <button
                              className='btn btn-primary mx-auto mt-4'
                              onClick={() => setIsAddingCategory(true)}
                            >
                              <Plus
                                size={16}
                                className='aucctus-stroke-white'
                              />
                              Add Category
                            </button>
                          </>
                        )}
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
                            const isSelected =
                              category.id === selectedCategoryId;
                            const isEditing = editingCategoryId === category.id;
                            const hasError = categoryIdsWithErrors.has(
                              category.id,
                            );

                            return (
                              <div
                                key={category.id}
                                onClick={() =>
                                  setSelectedCategoryId(category.id)
                                }
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
                                <div className='relative shrink-0'>
                                  <div
                                    className={cn('rounded-md p-1.5', {
                                      'aucctus-bg-brand-secondary': isSelected,
                                      'aucctus-bg-secondary': !isSelected,
                                    })}
                                  >
                                    <CategoryIcon
                                      icon={category.icon}
                                      className={cn({
                                        'aucctus-stroke-brand-primary':
                                          isSelected,
                                        'aucctus-stroke-tertiary': !isSelected,
                                      })}
                                    />
                                  </div>
                                  {hasError && (
                                    <div className='absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-gray-900' />
                                  )}
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
                                            'aucctus-text-secondary':
                                              !isSelected,
                                          },
                                        )}
                                      >
                                        {category.name}
                                      </p>
                                      <p className='aucctus-text-xs aucctus-text-secondary text-left'>
                                        {category.questions.length} question
                                        {category.questions.length !== 1
                                          ? 's'
                                          : ''}
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
                                      <Pencil
                                        size={14}
                                        className='aucctus-stroke-tertiary'
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
                                      <Trash2
                                        size={14}
                                        className='aucctus-stroke-error-primary'
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
                                onChange={(e) =>
                                  setNewCategoryName(e.target.value)
                                }
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
                                <Plus
                                  size={16}
                                  className='aucctus-stroke-tertiary'
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
                              <Plus
                                size={16}
                                className='aucctus-stroke-white'
                              />
                              Add Question
                            </button>
                          </div>

                          {/* Questions List */}
                          <div className='space-y-2'>
                            {selectedCategory.questions.length === 0 ? (
                              <div className='aucctus-text-secondary py-12 text-center'>
                                <Lightbulb className='aucctus-stroke-tertiary mx-auto mb-3 h-10 w-10 opacity-30' />
                                <p className='aucctus-text-sm'>
                                  No questions yet
                                </p>
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
                                      <EllipsisVertical
                                        size={16}
                                        className='aucctus-stroke-tertiary'
                                      />
                                    </div>

                                    {/* Question Content */}
                                    <div className='min-w-0 flex-1 space-y-2'>
                                      {editingQuestionId === question.id ? (
                                        <textarea
                                          value={question.text}
                                          onChange={(e) => {
                                            // Strip line breaks from content
                                            const cleanedText =
                                              e.target.value.replace(
                                                /[\r\n]+/g,
                                                ' ',
                                              );
                                            handleUpdateQuestion(question.id, {
                                              text: cleanedText,
                                            });
                                            // Auto-resize based on content
                                            e.target.style.height = 'auto';
                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                          }}
                                          onBlur={() =>
                                            setEditingQuestionId(null)
                                          }
                                          onKeyDown={(e) => {
                                            // Prevent Enter from inserting newline
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              setEditingQuestionId(null);
                                            }
                                            if (e.key === 'Escape')
                                              setEditingQuestionId(null);
                                          }}
                                          placeholder='Enter question text...'
                                          className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full resize-none overflow-hidden rounded border px-2 py-1 text-sm'
                                          autoFocus
                                          rows={1}
                                          ref={(el) => {
                                            if (el) {
                                              // Initial auto-size on mount
                                              el.style.height = 'auto';
                                              el.style.height = `${el.scrollHeight}px`;
                                            }
                                          }}
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

                                    {/* Delete Button - shows warning if last question in category */}
                                    {selectedCategory.questions.length === 1 ? (
                                      <ComponentTooltip
                                        tip={
                                          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
                                            <span className='aucctus-text-xs aucctus-text-primary whitespace-nowrap'>
                                              Deleting this will remove the
                                              category
                                            </span>
                                          </div>
                                        }
                                        preferredPosition='above'
                                      >
                                        <button
                                          className='hover:aucctus-bg-error-subtle h-8 w-8 rounded p-1.5 opacity-0 transition-all group-hover:opacity-100'
                                          onClick={() =>
                                            handleDeleteCategory(
                                              selectedCategoryId,
                                            )
                                          }
                                          title='Deleting this will remove the category'
                                        >
                                          <Trash2
                                            size={16}
                                            className='aucctus-stroke-error-primary'
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
                                        <Trash2
                                          size={16}
                                          className='aucctus-stroke-error-primary'
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ConceptScoringConfig);
