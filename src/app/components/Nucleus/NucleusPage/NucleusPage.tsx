import { Icon, NucleusLoadingState } from '@components';
import { useNucleusReportLatest } from '../../../hooks/query/nucleus.hook';
import { NucleusHeroBackground } from '../NucleusHeroBackground';
import { ConceptScoringConfig } from '../ConceptScoringConfig';
import { cn } from '@libs/utils/react';
import {
  NucleusReportSection,
  NucleusReportQuestion,
  NucleusReportAnswer,
  AssessmentStatus,
  SectionType,
} from '@libs/api/types';
import useStore from '../../../stores/store';
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoriesGrid } from '../CategoriesGrid';
import { CategoryState, QuestionState } from '../StatusDropdown';
import {
  useUpdateQuestion,
  useUpdateSection,
} from '../../../hooks/query/nucleusCrud.hook';
import LoadingMask from '../../Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { animationStyles } from '../../Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import StatusBadge from '../StatusBadge';
import DocumentUpload from '../DocumentUpload';
import { useDebugMode } from '@hooks/debug-mode.hook';

const NucleusPage: React.FC = () => {
  // Fetch real nucleus data
  const {
    nucleusReport,
    isLoading,
    hasNucleusReport,
    isNoReportFound,
    isRefetching,
  } = useNucleusReportLatest();
  const { account, user } = useStore((state: any) => state.auth);

  // Check if current user is admin
  const isAdmin = user?.role.toLowerCase() === 'admin';
  const isDebugModeEnabled = useDebugMode();

  // Hook for updating question assessment status
  const { mutate: updateQuestion, isLoading: isUpdatingQuestion } =
    useUpdateQuestion(nucleusReport?.uuid || '');

  // Hook for updating section assessment status
  const { mutate: updateSection, isLoading: isUpdatingSection } =
    useUpdateSection(nucleusReport?.uuid || '');

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Handle URL query param for opening scoring config
  const [searchParams, setSearchParams] = useSearchParams();
  const scoringConfigRef = useRef<HTMLDivElement>(null);
  const [isScoringConfigExpanded, setIsScoringConfigExpanded] = useState(() => {
    return searchParams.get('openScoringConfig') === 'true';
  });

  // Effect to clean up URL and scroll to scoring config when opened via query param
  useEffect(() => {
    if (searchParams.get('openScoringConfig') === 'true') {
      // Remove the param from URL after initial load
      searchParams.delete('openScoringConfig');
      setSearchParams(searchParams, { replace: true });

      // Scroll to scoring config section after a short delay for render
      setTimeout(() => {
        scoringConfigRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [searchParams, setSearchParams]);

  // Mapping from section type to display name for pills
  const sectionTypeDisplayNames = useMemo(
    (): Record<SectionType, string> => ({
      basic_profile: 'Company',
      geographic: 'Geographic',
      strategic: 'Corporate',
      products_services: 'Offerings',
      ecosystem: 'Ecosystem',
      technology: 'Technology',
      organizational: 'Customers',
      brand_communications: 'Brand',
      talent_culture: 'Culture',
      financial: 'Financial',
    }),
    [],
  );

  const handleExpandedCategoryChange = useCallback(
    (categoryId: string | null) => {
      setExpandedCategory(categoryId);
    },
    [],
  );

  // Manual status override states
  const [categoryStatusOverrides, setCategoryStatusOverrides] = useState<
    Record<string, CategoryState>
  >({});
  const [questionStatusOverrides, setQuestionStatusOverrides] = useState<
    Record<string, QuestionState>
  >({});
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Helper functions for determining question and category states based on real data
  const isAiReasoningSource = useCallback(
    (answer: NucleusReportAnswer): boolean => {
      return answer.sources.some((source) =>
        source.title?.toLowerCase().startsWith('ai reasoning'),
      );
    },
    [],
  );

  const questionNeedsReview = useCallback(
    (question: NucleusReportQuestion): boolean => {
      if (question.answers.length === 0) return true;
      return question.answers.every((answer) => isAiReasoningSource(answer));
    },
    [isAiReasoningSource],
  );

  // Helper functions for state determination
  const getQuestionState = useCallback(
    (question: NucleusReportQuestion): QuestionState => {
      // Check for manual override first
      if (questionStatusOverrides[question.uuid]) {
        return questionStatusOverrides[question.uuid];
      }

      // Use the actual assessmentStatus from the question data if available
      const questionWithAssessment = question as any;
      if (questionWithAssessment.assessmentStatus) {
        return questionWithAssessment.assessmentStatus as QuestionState;
      }

      // Fallback to automatic determination based on answers
      if (questionNeedsReview(question)) return 'needs_input';

      // Check if recent updates (within 7 days) indicate new details
      const hasRecentUpdates = question.answers.some((answer) => {
        const updateDate = new Date(answer.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return updateDate > weekAgo;
      });

      if (hasRecentUpdates) return 'new_details';
      return 'validated';
    },
    [questionStatusOverrides, questionNeedsReview],
  );

  const getCategoryStateInfo = useMemo(
    () => (section: NucleusReportSection) => {
      const categoryId = section.sectionType;

      // Calculate question stats for display
      const questions = section.questions;
      let validated = 0;
      let newDetails = 0;
      let needsInput = 0;
      let totalSources = 0;

      questions.forEach((question) => {
        const state = getQuestionState(question);
        if (state === 'validated') validated++;
        else if (state === 'new_details') newDetails++;
        else if (state === 'needs_input') needsInput++;

        totalSources += question.answers.reduce(
          (sum, answer) => sum + answer.sources.length,
          0,
        );
      });

      // Determine section state priority:
      // 1. Manual override (user changed it via dropdown)
      // 2. Section's assessmentStatus from API (database state)
      // 3. Calculated state based on questions (fallback)
      let sectionState: CategoryState;

      if (categoryStatusOverrides[categoryId]) {
        // User manually changed it via dropdown
        sectionState = categoryStatusOverrides[categoryId];
      } else if (section.assessmentStatus) {
        // Use the section's assessmentStatus from the API/database
        sectionState = section.assessmentStatus as CategoryState;
      } else {
        // Fallback: calculate from questions
        sectionState = 'validated';
        if (needsInput > 0) sectionState = 'needs_input';
        else if (newDetails > 0) sectionState = 'new_details';
      }

      return {
        state: sectionState,
        validated,
        newDetails,
        needsInput,
        totalSources,
      };
    },
    [categoryStatusOverrides, getQuestionState],
  );

  // Derived data from real nucleus report
  const companyName = account?.name || 'Company';
  const reportSections = useMemo(
    () => nucleusReport?.sections || [],
    [nucleusReport?.sections],
  );

  // Use sections directly - no transformation needed!
  const allSections = useMemo(() => {
    const sortedSections = [...reportSections].sort(
      (a: NucleusReportSection, b: NucleusReportSection) => a.order - b.order,
    );

    return sortedSections;
  }, [reportSections]);

  // Handle question status changes - must be after allSections is defined
  const handleQuestionStatusChange = useCallback(
    (questionId: string, newStatus: QuestionState) => {
      // Only allow admin users to change question status
      if (!isAdmin) {
        return;
      }
      // Find the question to get its current data
      const question = allSections
        .flatMap((section) => section.questions)
        .find((q) => q.uuid === questionId);

      if (!question || !nucleusReport?.uuid) {
        return;
      }

      // QuestionState now matches AssessmentStatus format directly
      const assessmentStatus = newStatus as AssessmentStatus;

      // Update the question in the database
      updateQuestion(
        {
          questionUuid: questionId,
          data: {
            question: question.question,
            whyItMatters: question.whyItMatters,
            priority: question.priority,
            assessmentStatus,
          },
        },
        {
          onSuccess: () => {
            // Update local state override for immediate UI feedback
            setQuestionStatusOverrides((prev) => ({
              ...prev,
              [questionId]: newStatus,
            }));
            setActiveDropdown(null);
          },
          onError: () => {
            // Don't update local state on error - let the user try again
          },
        },
      );
    },
    [updateQuestion, allSections, nucleusReport?.uuid, isAdmin],
  );

  // Handle section status changes
  const handleSectionStatusChange = useCallback(
    (sectionId: string, newStatus: CategoryState) => {
      // Only allow admin users to change section status
      if (!isAdmin) {
        return;
      }
      // Find the section to get its current data
      const section = allSections.find((s) => s.sectionType === sectionId);

      if (!section || !nucleusReport?.uuid) {
        return;
      }

      // Optimistic update: Set override immediately for responsive UI
      setCategoryStatusOverrides((prev) => ({
        ...prev,
        [sectionId]: newStatus,
      }));

      // CategoryState now matches AssessmentStatus format directly
      const assessmentStatus = newStatus as AssessmentStatus;

      // Update the section in the database
      updateSection(
        {
          sectionUuid: section.uuid,
          data: {
            assessmentStatus,
          },
        },
        {
          onSuccess: () => {
            // Clear override - let the fresh API data be the source of truth
            setCategoryStatusOverrides((prev) => {
              const updated = { ...prev };
              delete updated[sectionId];
              return updated;
            });
            setActiveDropdown(null);
          },
          onError: () => {
            // Revert optimistic update on error
            setCategoryStatusOverrides((prev) => {
              const updated = { ...prev };
              delete updated[sectionId];
              return updated;
            });
          },
        },
      );
    },
    [updateSection, allSections, nucleusReport?.uuid, isAdmin],
  );

  // Add click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        !(event.target as Element).closest('[data-dropdown]')
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Loading and error states
  if (isLoading) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='aucctus-text-lg aucctus-text-primary mb-4'>
            Loading Nucleus Report...
          </div>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
        </div>
      </div>
    );
  }

  if (isNoReportFound) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Icon
            variant='alert-triangle'
            className='aucctus-text-warning-primary mx-auto mb-4 h-12 w-12'
          />
          <div className='aucctus-text-xl aucctus-text-primary mb-2'>
            No Nucleus Report Found
          </div>
          <div className='aucctus-text-md aucctus-text-secondary'>
            No nucleus report has been generated for this account yet.
          </div>
        </div>
      </div>
    );
  }

  if (!hasNucleusReport || !nucleusReport) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Icon
            variant='alert-circle'
            className='aucctus-text-error-primary mx-auto mb-4 h-12 w-12'
          />
          <div className='aucctus-text-xl aucctus-text-primary mb-2'>
            Error Loading Report
          </div>
          <div className='aucctus-text-md aucctus-text-secondary'>
            There was an error loading the nucleus report.
          </div>
        </div>
      </div>
    );
  }

  const getStateConfig = (state: CategoryState | QuestionState) => {
    switch (state) {
      case 'validated':
        return {
          icon: 'check',
          color: 'aucctus-text-success-primary',
          bgColor: 'aucctus-bg-success-secondary',
          borderColor: 'aucctus-border-success',
          label: 'Validated',
        };
      case 'new_details':
        return {
          icon: 'refresh',
          color: 'aucctus-text-brand-primary',
          bgColor: 'aucctus-bg-brand-secondary',
          borderColor: 'aucctus-border-brand',
          label: 'New Details Found',
        };
      case 'needs_input':
        return {
          icon: 'alert-triangle',
          color: 'aucctus-text-warning-primary',
          bgColor: 'aucctus-bg-warning-secondary',
          borderColor: 'aucctus-border-warning-subtle',
          label: 'Needs Input',
        };
      default:
        return {
          icon: 'alert-triangle',
          color: 'aucctus-text-quaternary',
          bgColor: 'aucctus-bg-secondary',
          borderColor: 'aucctus-border-secondary',
          label: 'Unknown',
        };
    }
  };

  const handleCategoryBadgeClick = (categoryId: string) => {
    setExpandedCategory(categoryId);

    // Use multiple RAF to ensure DOM has fully updated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const categoryElement = document.getElementById(
            `category-${categoryId}`,
          );

          if (categoryElement) {
            // Scroll to category with proper offset for header
            const elementRect = categoryElement.getBoundingClientRect();
            const targetScrollY = window.scrollY + elementRect.top - 120; // 120px offset for header

            window.scrollTo({
              top: Math.max(0, targetScrollY),
              behavior: 'smooth',
            });
          } else {
            // Fallback: scroll to categories section with preserved position
            const categoriesSection = document.querySelector(
              '[data-tab="categories"]',
            );
            if (categoriesSection) {
              const sectionRect = categoriesSection.getBoundingClientRect();
              const targetScrollY = window.scrollY + sectionRect.top - 80;

              window.scrollTo({
                top: Math.max(0, targetScrollY),
                behavior: 'smooth',
              });
            }
          }
        });
      });
    });
  };

  if (!isLoading && nucleusReport?.processingStatus === 'processing') {
    return <NucleusLoadingState />;
  }

  return (
    <div className='aucctus-bg-primary min-h-screen p-8'>
      <style>{animationStyles}</style>
      <div className='aucctus-bg-primary min-h-screen'>
        {/* Hero Header Section */}
        <div className='relative h-[32rem] overflow-hidden rounded-xl'>
          <NucleusHeroBackground
            videoUrl={nucleusReport.headquartersVideoUrl}
          />

          {/* Header Content */}
          <div className='relative z-10 flex h-full flex-col items-center justify-center px-6 py-12'>
            <StatusBadge status={nucleusReport.processingStatus} />

            {/* Company Name */}
            <h1 className='aucctus-header-2xl-bold mb-4 text-center tracking-tight text-white drop-shadow-xl'>
              {companyName}
            </h1>

            {/* Subtitle */}
            <p className='aucctus-text-lg mx-auto mb-12 max-w-2xl text-center leading-relaxed text-white/80'>
              Your central hub of company context used by Aucctus AI Agents
            </p>

            {/* Context Status Pills */}
            <div className='mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3'>
              {allSections.map((section: NucleusReportSection) => {
                // Get display name from mapping
                const displayName =
                  sectionTypeDisplayNames[section.sectionType] ||
                  section.sectionType;
                const stateInfo = getCategoryStateInfo(section);
                const stateConfig = getStateConfig(stateInfo.state);

                return (
                  <button
                    key={section.sectionType}
                    className='group relative cursor-pointer border-0 bg-transparent p-0'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCategoryBadgeClick(section.sectionType);
                    }}
                  >
                    {/* Glassmorphic pill container */}
                    <div className='rounded-full border border-white/20 bg-white/10 px-4 py-2.5 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={cn(
                            'relative h-2 w-2 rounded-full transition-all duration-500',
                            {
                              'aucctus-bg-brand-solid':
                                stateInfo.state === 'new_details',
                              'aucctus-bg-warning-solid':
                                stateInfo.state === 'needs_input',
                              'aucctus-bg-success-solid':
                                stateInfo.state === 'validated',
                            },
                          )}
                        ></div>
                        {/* Category name */}
                        <span className='aucctus-text-xs-medium text-white/90'>
                          {displayName}
                        </span>
                        {/* State label */}
                        <span className='aucctus-text-xs-bold text-white'>
                          {stateConfig.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Header for Categories */}
        <div className='relative'>
          <div className='absolute left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 transform'>
            <div className='aucctus-border-primary rounded-lg border bg-white px-1 py-1 shadow-sm backdrop-blur-sm'>
              <div className='flex gap-2'>
                <div className='aucctus-text-sm-medium btn btn-bold btn-primary rounded-md px-3 py-1.5'>
                  Categories
                </div>
                <div className='aucctus-text-sm-medium btn btn-disabled flex items-center rounded-md px-3 py-1.5'>
                  <Icon
                    variant='lock'
                    className='aucctus-fill-disabled aucctus-stroke-disabled h-4 w-4'
                  />
                  AI Insights
                </div>
              </div>
            </div>
          </div>

          {/* Dividing line */}
          <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
        </div>

        {/* Categories Content */}
        <div
          className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
          data-tab='categories'
        >
          <CategoriesGrid
            allCategories={allSections}
            expandedCategory={expandedCategory}
            setExpandedCategory={handleExpandedCategoryChange}
            getCategoryStateInfo={(categoryId: string) => {
              const section = reportSections.find(
                (s: NucleusReportSection) => s.sectionType === categoryId,
              );
              return section
                ? getCategoryStateInfo(section)
                : {
                    state: 'needs_input' as CategoryState,
                    validated: 0,
                    newDetails: 0,
                    needsInput: 0,
                    totalSources: 0,
                  };
            }}
            getStateConfig={getStateConfig}
            setCategoryStatusOverrides={setCategoryStatusOverrides}
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            questionStatusOverrides={questionStatusOverrides}
            handleQuestionStatusChange={handleQuestionStatusChange}
            handleSectionStatusChange={handleSectionStatusChange}
            getQuestionState={getQuestionState}
            reportUuid={nucleusReport?.uuid || ''}
            isAdmin={isAdmin}
          />

          {/* Concept Scoring Configuration - At the end of categories */}
          <div
            ref={scoringConfigRef}
            className='mt-6 grid auto-rows-min grid-cols-1 gap-6 lg:grid-cols-2'
          >
            <div
              className={cn('transition-all duration-300 ease-in-out', {
                'lg:col-span-2': isScoringConfigExpanded,
              })}
            >
              <ConceptScoringConfig
                isExpanded={isScoringConfigExpanded}
                onToggleExpand={() =>
                  setIsScoringConfigExpanded((prev) => !prev)
                }
              />
            </div>
          </div>
        </div>

        {/* Loading mask for question and section status updates */}
        <LoadingMask
          isLoading={isUpdatingQuestion || isUpdatingSection || isRefetching}
          message={
            isUpdatingSection
              ? 'Updating section status...'
              : 'Updating question status...'
          }
          zIndex={60}
        />

        {isDebugModeEnabled && nucleusReport?.uuid && (
          <DocumentUpload reportUuid={nucleusReport?.uuid} />
        )}
      </div>
    </div>
  );
};

export default NucleusPage;
