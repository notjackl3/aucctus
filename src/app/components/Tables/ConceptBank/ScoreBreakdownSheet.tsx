/**
 * Score Breakdown Sheet component - displays detailed priority score breakdown in a sidebar.
 */

import { ComponentTooltip } from '@components';
import images from '@assets/img';
import {
  useConceptPriorityDetail,
  useUpdateQuestionScore,
} from '@hooks/query/concept-priority.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { useConceptOverview } from '@hooks/query/concepts.hook';
import {
  useBulkConceptUpdate,
  useScoringConfigs,
} from '@hooks/query/scoringConfig.hook';
import { ICategoryScore } from '@libs/api/types/accounts/scoring-config';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
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
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  HelpCircle,
  Lightbulb,
  Settings,
  ThumbsUp,
  X,
} from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

interface ScoreBreakdownSheetProps {
  isOpen: boolean;
  onClose: () => void;
  conceptTitle: string;
  conceptDescription?: string;
  conceptImage?: string;
  /** Concept UUID for fetching detailed priority data */
  conceptUuid?: string | null;
  isLoading?: boolean;
  /** Overall score to display (0-100) */
  score?: number;
}

// Default empty reasons when no data is available
const DEFAULT_REASONS_TO_BELIEVE: string[] = [];
const DEFAULT_REASONS_TO_CHALLENGE: string[] = [];

/**
 * Semicircle Score Gauge component
 */
const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getGaugeColor = (score: number) => {
    if (score >= 80) return '#16a34a'; // Green
    if (score >= 70) return '#eab308'; // Yellow
    if (score >= 60) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const gaugeColor = getGaugeColor(clampedScore);

  return (
    <svg width='160' height='96' viewBox='0 0 160 96' className='mb-4'>
      {/* Gray background arc (full) */}
      <path
        d='M 16 80 A 64 64 0 0 1 144 80'
        fill='none'
        stroke='#e5e7eb'
        strokeWidth='14'
        strokeLinecap='round'
      />

      {/* Colored progress arc (proportional to score) */}
      <path
        d='M 16 80 A 64 64 0 0 1 144 80'
        fill='none'
        stroke={gaugeColor}
        strokeWidth='14'
        strokeLinecap='round'
        pathLength={100}
        strokeDasharray={`${clampedScore} 100`}
      />

      {/* Score number in center */}
      <text
        x='80'
        y='72'
        textAnchor='middle'
        className='fill-current'
        style={{ fontSize: '36px', fontWeight: 'bold' }}
      >
        {clampedScore}
      </text>
    </svg>
  );
};

/**
 * Get score description based on score value
 */
const getScoreDescription = (score: number): string => {
  if (score >= 80) {
    return 'This concept shows exceptional potential with strong alignment across all key criteria.';
  }
  if (score >= 70) {
    return 'This concept demonstrates solid potential with room for optimization in specific areas.';
  }
  if (score >= 60) {
    return 'This concept has moderate potential but requires further validation and refinement.';
  }
  return 'This concept needs significant development before it can be considered viable.';
};

/**
 * Map icon name from backend to frontend icon variant
 */
const mapIconVariant = (icon: string): string => {
  // Map common icon names
  const iconMap: Record<string, string> = {
    target: 'target',
    'trending-up': 'trending-up',
    'users-02': 'users-02',
    zap: 'zap',
    'shield-dollar': 'shield-dollar',
    beaker: 'beaker',
    'currency-dollar': 'currency-dollar',
  };
  return iconMap[icon] || 'target';
};

/**
 * Collapsible category section for scoring criteria
 */
const ScoringCategorySection: React.FC<{
  category: ICategoryScore;
  questionScores: Record<string, number>;
  onScoreChange: (questionId: string, score: number) => void;
  isUpdating?: boolean;
  updatingQuestionId?: string | null;
}> = ({
  category,
  questionScores,
  onScoreChange,
  isUpdating = false,
  updatingQuestionId = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const percentage =
    category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0;

  const getScoreColor = () => {
    if (percentage < 50) return 'text-red-500';
    if (percentage < 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBorderColor = () => {
    if (percentage < 50) return 'border-l-red-500';
    if (percentage < 75) return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  return (
    <div
      className={cn(
        'aucctus-bg-secondary aucctus-border-secondary overflow-hidden rounded-xl border border-l-4 shadow-sm',
        getBorderColor(),
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='group w-full transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50'
      >
        <div className='flex items-center justify-between p-5'>
          <div className='flex flex-1 items-center gap-3 text-left'>
            <div className='aucctus-bg-tertiary rounded-md p-2'>
              <DynamicIcon
                variant={mapIconVariant(category.categoryIcon) as any}
                className='aucctus-stroke-secondary h-4 w-4'
              />
            </div>
            <div>
              <h4 className='aucctus-text-md-semibold aucctus-text-primary'>
                {category.categoryName}
              </h4>
              <p className='aucctus-text-sm aucctus-text-tertiary'>
                {category.questions.length} question
                {category.questions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-right'>
              <div className={cn('text-2xl font-bold', getScoreColor())}>
                {category.score}
              </div>
              <div className='aucctus-text-xs aucctus-text-tertiary'>
                out of {category.maxScore}
              </div>
            </div>
            <ChevronDown
              className={cn(
                'aucctus-stroke-tertiary h-5 w-5 transition-transform duration-200',
                { 'rotate-180': isExpanded },
              )}
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className='aucctus-bg-primary px-5 pb-5 pt-2'>
          {category.questions.map((question) => {
            const score =
              questionScores[question.questionUuid] || question.score || 0;

            return (
              <div
                key={question.questionUuid}
                className='aucctus-border-secondary border-b py-4 last:border-b-0'
              >
                <div className='flex items-start justify-between gap-4'>
                  <p className='aucctus-text-sm-semibold aucctus-text-primary flex-1'>
                    {question.questionText}
                  </p>
                  <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isThisUpdating =
                        isUpdating &&
                        updatingQuestionId === question.questionUuid;
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            onScoreChange(question.questionUuid, value)
                          }
                          disabled={isUpdating}
                          className={cn(
                            'h-8 w-8 rounded-md text-sm font-medium transition-all',
                            score === value
                              ? 'bg-[#5C3D2E] text-white'
                              : 'aucctus-bg-primary aucctus-border-secondary aucctus-text-tertiary hover:aucctus-text-primary border',
                            isUpdating && 'cursor-not-allowed opacity-50',
                            isThisUpdating &&
                              score === value &&
                              'animate-pulse',
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className='mt-2 flex items-center gap-2'>
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium',
                      question.importance === 'high'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : question.importance === 'medium'
                          ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-400'
                          : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-400',
                    )}
                  >
                    {question.importance.charAt(0).toUpperCase() +
                      question.importance.slice(1)}{' '}
                    Priority
                  </span>
                  {question.reasoning && (
                    <ComponentTooltip
                      tip={
                        <div className='aucctus-bg-primary aucctus-border-secondary max-w-xs rounded-lg border px-3 py-2 shadow-lg'>
                          <p className='aucctus-text-xs aucctus-text-primary leading-relaxed'>
                            {question.reasoning}
                          </p>
                        </div>
                      }
                      preferredPosition='above'
                    >
                      <HelpCircle className='aucctus-stroke-secondary hover:aucctus-stroke-primary h-4 w-4 cursor-help transition-colors' />
                    </ComponentTooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Empty state when no scoring data is available
 */
const EmptyScoringState: React.FC = () => (
  <div className='aucctus-bg-secondary aucctus-border-secondary rounded-xl border p-8 text-center'>
    <BarChart3 className='aucctus-stroke-tertiary mx-auto mb-3 h-10 w-10' />
    <h4 className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
      No Scoring Data Yet
    </h4>
    <p className='aucctus-text-sm aucctus-text-tertiary'>
      Run priority scoring from the Portfolio tab to see detailed breakdowns.
    </p>
  </div>
);

/**
 * Loading skeleton for the sheet content
 */
const SheetSkeleton: React.FC = () => (
  <div className='animate-pulse'>
    <div className='aucctus-bg-tertiary h-32 w-full' />
    <div className='space-y-6 p-6'>
      <div className='space-y-2'>
        <div className='aucctus-bg-tertiary h-8 w-3/4 rounded' />
        <div className='aucctus-bg-tertiary h-4 w-full rounded' />
        <div className='aucctus-bg-tertiary h-4 w-2/3 rounded' />
      </div>
      <div className='aucctus-bg-tertiary h-32 w-full rounded-xl' />
      <div className='aucctus-bg-tertiary h-48 w-full rounded-xl' />
      <div className='space-y-3'>
        <div className='aucctus-bg-tertiary h-20 w-full rounded-xl' />
        <div className='aucctus-bg-tertiary h-20 w-full rounded-xl' />
      </div>
    </div>
  </div>
);

/**
 * Portal-based scoring config dropdown selector
 */
const ScoringConfigDropdown: React.FC<{
  configs: { uuid: string; name: string; isDefault: boolean }[];
  currentConfigUuid: string;
  onChange: (configUuid: string) => void;
  disabled?: boolean;
}> = ({ configs, currentConfigUuid, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const selectedConfig = configs.find((c) => c.uuid === currentConfigUuid);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !triggerRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary mb-6 rounded-xl border p-4 shadow-sm'>
      <label className='aucctus-text-sm-semibold aucctus-text-primary'>
        Scoring Criteria
      </label>
      <button
        ref={triggerRef}
        type='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'aucctus-bg-primary aucctus-border-secondary aucctus-text-primary mt-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all',
          'hover:border-gray-400 dark:hover:border-gray-500',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className='truncate'>
          {selectedConfig?.name ?? 'Select config'}
          {selectedConfig?.isDefault ? ' (Default)' : ''}
        </span>
        <ChevronDown
          className={cn(
            'aucctus-stroke-tertiary ml-2 h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className='aucctus-bg-primary aucctus-border-secondary fixed z-[99999] overflow-hidden rounded-lg border shadow-lg'
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            data-aucctus-portal-target='true'
          >
            <ul className='no-scrollbar max-h-60 overscroll-contain py-1'>
              {configs.map((config) => {
                const isSelected = config.uuid === currentConfigUuid;
                return (
                  <li
                    key={config.uuid}
                    className={cn(
                      'aucctus-text-sm flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors',
                      isSelected
                        ? 'aucctus-bg-secondary aucctus-text-primary font-medium'
                        : 'aucctus-text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    )}
                    onClick={() => {
                      onChange(config.uuid);
                      setIsOpen(false);
                    }}
                    data-aucctus-portal-target='true'
                  >
                    <span className='min-w-0 flex-1 truncate'>
                      {config.name}
                      {config.isDefault ? ' (Default)' : ''}
                    </span>
                    {isSelected && (
                      <Check className='aucctus-stroke-primary h-4 w-4 shrink-0' />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
};

/**
 * Main Score Breakdown Sheet component
 */
export const ScoreBreakdownSheet: React.FC<ScoreBreakdownSheetProps> = ({
  isOpen,
  onClose,
  conceptTitle,
  conceptDescription = 'End-to-end temperature and humidity tracking across all cheese distribution channels with predictive spoilage alerts and quality assurance dashboards.',
  conceptImage,
  conceptUuid,
  isLoading: externalLoading = false,
  score: propScore,
}) => {
  const navigate = useNavigate();
  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);
  const { configs } = useScoringConfigs(accountUuid);
  const queryClient = useQueryClient();

  // Track when we've triggered a config change and are waiting for rescore
  const [isAwaitingRescore, setIsAwaitingRescore] = useState(false);

  const bulkConceptUpdate = useBulkConceptUpdate({
    onRescoreStarted: (affectedUuids) => {
      if (conceptUuid && affectedUuids.includes(conceptUuid)) {
        setIsAwaitingRescore(true);
      }
    },
  });

  const [activeTab, setActiveTab] = useState<'believe' | 'challenge'>(
    'believe',
  );
  const [questionScores, setQuestionScores] = useState<Record<string, number>>(
    {},
  );
  const [updatingQuestionId, setUpdatingQuestionId] = useState<string | null>(
    null,
  );

  // Navigate to Nucleus page with scoring config expanded
  const handleConfigureCriteria = useCallback(() => {
    navigate(`${AppPath.Nucleus}?openScoringConfig=true`);
  }, [navigate]);

  // Handle scoring config change for this concept
  const handleScoringConfigChange = useCallback(
    (configUuid: string) => {
      if (!conceptUuid || !configUuid) return;
      // Optimistically mark the concept as calculating before the mutation
      queryClient.setQueryData(
        [AucctusQueryKeys.conceptPriority, conceptUuid],
        { isCalculating: true },
      );
      setIsAwaitingRescore(true);
      bulkConceptUpdate.mutate({
        conceptUuids: [conceptUuid],
        scoringConfigUuid: configUuid,
      });
    },
    [conceptUuid, bulkConceptUpdate, queryClient],
  );

  // Fetch detailed priority data when sheet is open
  const { priorityDetail, isLoading: priorityLoading } =
    useConceptPriorityDetail(isOpen ? (conceptUuid ?? null) : null);

  // Get the current concept's scoring config UUID from priority detail
  const currentScoringConfigUuid = useMemo(() => {
    if (priorityDetail?.scoringConfigUuid) {
      return priorityDetail.scoringConfigUuid;
    }
    // Fallback to default config if priority detail doesn't have one
    const defaultConfig = configs.find((c) => c.isDefault);
    return defaultConfig?.uuid ?? '';
  }, [priorityDetail, configs]);

  // Mutation for updating question scores
  const updateScoreMutation = useUpdateQuestionScore(conceptUuid ?? '');

  // Fetch concept overview to get the proper presigned image URL
  const { conceptOverview } = useConceptOverview(
    isOpen ? (conceptUuid ?? '') : '',
  );

  // Get the image URL from overview (same logic as HighScoringConceptsCarousel)
  const imageUrl = useMemo(() => {
    // First check if conceptImage prop was passed
    if (conceptImage) return conceptImage;
    // Otherwise get from concept overview
    if (conceptOverview?.useCustomImage && conceptOverview?.customImageUrl) {
      return conceptOverview.customImageUrl;
    }
    return conceptOverview?.conceptImageUrl || null;
  }, [conceptImage, conceptOverview]);

  // Don't show loading skeleton when we're just waiting for a rescore after config change
  // (the query refetch from invalidation would otherwise flash the skeleton)
  const isLoading = (externalLoading || priorityLoading) && !isAwaitingRescore;

  // Clear awaiting rescore when priority detail comes back with fresh data
  useEffect(() => {
    if (isAwaitingRescore && priorityDetail && !priorityLoading) {
      setIsAwaitingRescore(false);
    }
  }, [isAwaitingRescore, priorityDetail, priorityLoading]);

  // Calculate overall score
  const overallScore = useMemo(() => {
    if (propScore !== undefined) return propScore;
    if (priorityDetail?.overallScore !== undefined)
      return priorityDetail.overallScore;
    return 0;
  }, [propScore, priorityDetail]);

  // Get category scores from API data
  const categoryScores = useMemo(() => {
    return priorityDetail?.categoryScores || [];
  }, [priorityDetail]);

  // Get reasons to believe and challenge from API data
  const reasonsToBelieve = useMemo(() => {
    return priorityDetail?.reasonsToBelieve ?? DEFAULT_REASONS_TO_BELIEVE;
  }, [priorityDetail]);

  const reasonsToChallenge = useMemo(() => {
    return priorityDetail?.reasonsToChallenge ?? DEFAULT_REASONS_TO_CHALLENGE;
  }, [priorityDetail]);

  const handleScoreChange = (questionId: string, score: number) => {
    // Optimistically update local state
    setQuestionScores((prev) => ({
      ...prev,
      [questionId]: score,
    }));

    // Only call API if we have a concept UUID
    if (conceptUuid) {
      setUpdatingQuestionId(questionId);
      updateScoreMutation.mutate(
        { questionUuid: questionId, score },
        {
          onSettled: () => {
            setUpdatingQuestionId(null);
          },
        },
      );
    }
  };

  if (!isOpen) return null;

  // Use portal to render at document body level to avoid z-index/overflow issues
  return createPortal(
    <>
      {/* Backdrop - high z-index to cover sidebar and header */}
      <div
        className='fixed inset-0 z-[9998] bg-black/50 transition-opacity'
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'aucctus-bg-primary fixed right-0 top-0 z-[9999] h-full w-full max-w-lg overflow-y-auto shadow-xl',
          'animate-slide-in-right',
        )}
      >
        {isLoading ? (
          <SheetSkeleton />
        ) : (
          <>
            {/* Concept Image Header */}
            <div className='relative h-32 w-full overflow-hidden'>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt='Concept visual'
                  className='h-full w-full object-cover'
                />
              ) : (
                <div
                  className='flex h-full w-full items-center justify-center bg-cover bg-center'
                  style={{
                    backgroundImage: `url(${images.aiExplorationsBackground})`,
                  }}
                >
                  <Lightbulb size={48} className='stroke-white/70' />
                </div>
              )}
              {/* Close button overlaid on image */}
              <button
                onClick={onClose}
                className={cn(
                  'absolute right-3 top-3 rounded-full p-2 transition-colors',
                  imageUrl
                    ? 'bg-black/30 backdrop-blur-sm hover:bg-black/50'
                    : 'aucctus-bg-tertiary hover:aucctus-bg-quaternary',
                )}
                aria-label='Close'
              >
                <X
                  className={cn(
                    'h-4 w-4',
                    imageUrl ? 'stroke-white' : 'aucctus-stroke-primary',
                  )}
                />
              </button>
            </div>

            {/* Content */}
            <div className='px-6 pb-6 pt-4'>
              {/* Header */}
              <div className='pb-6'>
                <h2 className='aucctus-text-primary text-2xl font-semibold leading-tight'>
                  {conceptTitle}
                </h2>
                <p className='aucctus-text-secondary mt-2 text-base leading-relaxed'>
                  {conceptOverview?.whatIsThis || conceptDescription}
                </p>
              </div>

              {/* Large Score Gauge */}
              <div className='aucctus-bg-secondary aucctus-border-secondary mb-6 rounded-xl border p-6 shadow-sm'>
                <div className='flex flex-col items-center'>
                  <ScoreGauge score={overallScore} />
                  <p className='aucctus-text-sm aucctus-text-tertiary max-w-xs text-center'>
                    {priorityDetail?.overallReasoning ||
                      getScoreDescription(overallScore)}
                  </p>
                </div>
              </div>

              {/* Reasons to Believe/Challenge */}
              <div className='aucctus-bg-secondary aucctus-border-secondary mb-6 rounded-xl border p-6 shadow-sm'>
                {/* Tab Buttons */}
                <div className='aucctus-bg-tertiary mb-4 grid w-full grid-cols-2 rounded-lg p-1'>
                  <button
                    onClick={() => setActiveTab('believe')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                      activeTab === 'believe'
                        ? 'aucctus-bg-primary aucctus-text-primary shadow-sm'
                        : 'aucctus-text-tertiary',
                    )}
                  >
                    <ThumbsUp
                      className={cn('h-3.5 w-3.5', {
                        'aucctus-stroke-success-primary':
                          activeTab === 'believe',
                        'aucctus-stroke-tertiary': activeTab !== 'believe',
                      })}
                    />
                    <span>Reasons to Believe</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('challenge')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                      activeTab === 'challenge'
                        ? 'aucctus-bg-primary aucctus-text-primary shadow-sm'
                        : 'aucctus-text-tertiary',
                    )}
                  >
                    <AlertTriangle
                      className={cn('h-3.5 w-3.5', {
                        'aucctus-stroke-warning-primary':
                          activeTab === 'challenge',
                        'aucctus-stroke-tertiary': activeTab !== 'challenge',
                      })}
                    />
                    <span>Reasons to Challenge</span>
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'believe' && (
                  <ul className='space-y-2.5 text-sm'>
                    {reasonsToBelieve.length > 0 ? (
                      reasonsToBelieve.map((reason, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span className='mt-1 text-green-500'>•</span>
                          <span className='aucctus-text-secondary leading-relaxed'>
                            {reason}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className='aucctus-text-tertiary italic'>
                        No reasons to believe generated yet. Run priority
                        scoring to generate insights.
                      </li>
                    )}
                  </ul>
                )}

                {activeTab === 'challenge' && (
                  <ul className='space-y-2.5 text-sm'>
                    {reasonsToChallenge.length > 0 ? (
                      reasonsToChallenge.map((reason, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <span className='mt-1 text-orange-500'>•</span>
                          <span className='aucctus-text-secondary leading-relaxed'>
                            {reason}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className='aucctus-text-tertiary italic'>
                        No reasons to challenge generated yet. Run priority
                        scoring to generate insights.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Scoring Config Selector */}
              {configs.length > 1 && (
                <ScoringConfigDropdown
                  configs={configs}
                  currentConfigUuid={currentScoringConfigUuid}
                  onChange={handleScoringConfigChange}
                  disabled={bulkConceptUpdate.isLoading}
                />
              )}

              {/* Scoring Criteria */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
                      Scoring Criteria
                    </h3>
                    <button
                      className='aucctus-bg-secondary-hover rounded-md p-1.5 transition-colors'
                      title='Configure criteria'
                      onClick={handleConfigureCriteria}
                    >
                      <Settings className='aucctus-stroke-tertiary h-4 w-4' />
                    </button>
                  </div>
                  <div className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                    Score:{' '}
                    <span className='aucctus-text-primary'>{overallScore}</span>
                  </div>
                </div>

                {categoryScores.length > 0 ? (
                  <div className='space-y-3'>
                    {categoryScores.map((category) => (
                      <ScoringCategorySection
                        key={category.categoryUuid}
                        category={category}
                        questionScores={questionScores}
                        onScoreChange={handleScoreChange}
                        isUpdating={updateScoreMutation.isLoading}
                        updatingQuestionId={updatingQuestionId}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyScoringState />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  );
};

export default ScoreBreakdownSheet;
