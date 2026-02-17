import { LiquidGlassTabs, NucleusLoadingState } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import {
  AssessmentStatus,
  NucleusReportAnswer,
  NucleusReportQuestion,
  NucleusReportSection,
  SectionType,
} from '@libs/api/types';
import { motion } from 'framer-motion';
import { Building2, Scale, Users } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { useAccountLogo } from '../../../hooks/query/admin.hook';
import {
  useGenerateNucleusReport,
  useNucleusReportLatest,
  useNucleusStatus,
} from '../../../hooks/query/nucleus.hook';
import {
  useUpdateQuestion,
  useUpdateSection,
} from '../../../hooks/query/nucleusCrud.hook';
import useStore from '../../../stores/store';
import LoadingMask from '../../Card/ConceptGeneration/UserExploration/components/util/LoadingMask';
import { animationStyles } from '../../Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import { CompanyContextTab } from '../CompanyContextTab';
import { DecisionMakingTab } from '../DecisionMakingTab';
import DocumentUpload from '../DocumentUpload';
import { LivingPersonasTab } from '../LivingPersonasTab';
import { NucleusHeroBackground } from '../NucleusHeroBackground';
import { NucleusInitiation } from '../NucleusInitiation';
import StatusBadge from '../StatusBadge';
import { CategoryState, QuestionState } from '../StatusDropdown';
import { AlertCircle, AlertTriangle, Lock, Sparkles } from 'lucide-react';

const NucleusPage: React.FC = () => {
  // Track page time for analytics

  // Fetch nucleus status (initialization check)
  // isLoading = React Query's loading state (true while fetching)
  // isNucleusGenerating = API response field (true if report is being generated)
  const {
    nucleusStatus,
    isLoading: isStatusLoading,
    isNucleusGenerating,
  } = useNucleusStatus();
  const queryClient = useQueryClient();

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

  // Hook for generating nucleus report
  const {
    generateReport,
    isGenerating,
    isSuccess: isGenerationStarted,
  } = useGenerateNucleusReport();

  // Hook for updating question assessment status
  const { mutate: updateQuestion, isLoading: isUpdatingQuestion } =
    useUpdateQuestion(nucleusReport?.uuid || '');

  // Hook for updating section assessment status
  const { mutate: updateSection, isLoading: isUpdatingSection } =
    useUpdateSection(nucleusReport?.uuid || '');

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Company logo - fetch from dedicated endpoint
  const { logoUrl: companyLogoUrl } = useAccountLogo();
  const [logoFailed, setLogoFailed] = useState(false);

  // Handle URL query param for tabs and scoring config
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state - persists in URL params
  type NucleusTab = 'company-context' | 'living-personas' | 'decision-making';
  const activeTab: NucleusTab =
    (searchParams.get('tab') as NucleusTab) || 'company-context';

  const setActiveTab = useCallback(
    (tab: NucleusTab) => {
      const newParams = new URLSearchParams(searchParams);
      if (tab === 'company-context') {
        newParams.delete('tab'); // Default, no need to store
      } else {
        newParams.set('tab', tab);
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Tab configuration for LiquidGlassTabs
  const tabConfig = useMemo(
    () => [
      {
        id: 'company-context',
        label: 'Company Context',
        icon: <Building2 className='h-4 w-4' />,
      },
      {
        id: 'living-personas',
        label: 'Living Personas',
        icon: <Users className='h-4 w-4' />,
      },
      {
        id: 'decision-making',
        label: 'Decision Making',
        icon: <Scale className='h-4 w-4' />,
      },
    ],
    [],
  );

  // Handle openScoringConfig URL param by switching to decision-making tab
  useEffect(() => {
    if (searchParams.get('openScoringConfig') === 'true') {
      searchParams.delete('openScoringConfig');
      searchParams.set('tab', 'decision-making');
      setSearchParams(searchParams, { replace: true });
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

  // Handle initialization completion - refetch status to show loading state
  const handleInitializationComplete = useCallback(() => {
    queryClient.invalidateQueries([AucctusQueryKeys.nucleusStatus]);
    queryClient.invalidateQueries([AucctusQueryKeys.nucleusReportLatest]);
  }, [queryClient]);

  // ==============================================
  // INITIALIZATION-BASED ROUTING
  // ==============================================

  // Show loading while fetching status
  if (isStatusLoading) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='aucctus-text-lg aucctus-text-primary mb-4'>
            Loading Nucleus...
          </div>
          <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
        </div>
      </div>
    );
  }

  // If not initialized, show initialization wizard or contact admin message
  if (nucleusStatus && !nucleusStatus.isInitialized) {
    if (isAdmin) {
      // Admin can initialize Nucleus
      return <NucleusInitiation onComplete={handleInitializationComplete} />;
    }
    // Non-admin sees contact admin message
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Lock className='aucctus-text-secondary mx-auto mb-4 h-12 w-12' />
          <div className='aucctus-text-xl aucctus-text-primary mb-2'>
            Nucleus Not Set Up
          </div>
          <div className='aucctus-text-md aucctus-text-secondary max-w-md'>
            Contact your account administrator to set up Nucleus for your
            organization.
          </div>
        </div>
      </div>
    );
  }

  // If initialized but still generating report, show loading state
  if (nucleusStatus?.isInitialized && isNucleusGenerating) {
    return <NucleusLoadingState />;
  }

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
          <AlertTriangle className='aucctus-text-warning-primary mx-auto mb-4 h-12 w-12' />
          <div className='aucctus-text-xl aucctus-text-primary mb-2'>
            No Nucleus Report Found
          </div>
          <div className='aucctus-text-md aucctus-text-secondary mb-6'>
            No nucleus report has been generated for this account yet.
          </div>
          {isAdmin && (
            <button
              onClick={() => generateReport()}
              disabled={isGenerating || isGenerationStarted}
              className='btn btn-primary btn-md inline-flex items-center gap-2'
            >
              {isGenerating || isGenerationStarted ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className='h-4 w-4 fill-white stroke-white' />
                  Generate Nucleus
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!hasNucleusReport || !nucleusReport) {
    return (
      <div className='aucctus-bg-primary flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='aucctus-text-error-primary mx-auto mb-4 h-12 w-12' />
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

  if (!isLoading && nucleusReport?.processingStatus === 'processing') {
    return <NucleusLoadingState />;
  }

  return (
    <div className='aucctus-bg-primary min-h-screen p-8'>
      <style>{animationStyles}</style>
      <div className='aucctus-bg-primary min-h-screen'>
        {/* Hero Header Section - 280px height per design spec */}
        <div className='relative h-[280px] overflow-hidden rounded-xl'>
          <NucleusHeroBackground
            videoUrl={nucleusReport.headquartersVideoUrl}
          />

          {/* Header Content */}
          <div className='relative z-10 flex h-full flex-col items-center justify-center px-6 py-8'>
            {/* Status Badge with pulse animation */}
            <StatusBadge status={nucleusReport.processingStatus} />

            {/* Company Logo or Name */}
            {companyLogoUrl && !logoFailed ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='mb-2 flex items-center justify-center rounded-md bg-white/30 p-3 backdrop-blur-sm'
              >
                <img
                  src={companyLogoUrl}
                  alt={companyName}
                  className='h-16 w-auto max-w-[160px] object-contain drop-shadow-xl'
                  onError={() => setLogoFailed(true)}
                />
              </motion.div>
            ) : (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='aucctus-header-xl-bold mb-2 text-center tracking-tight text-white drop-shadow-xl'
              >
                {companyName}
              </motion.h1>
            )}

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='aucctus-text-md mx-auto mb-6 max-w-2xl text-center leading-relaxed text-white/80'
            >
              Your central hub of company context used by Aucctus AI Agents
            </motion.p>

            {/* Liquid Glass Tab Bar with sliding indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <LiquidGlassTabs
                tabs={tabConfig}
                activeTab={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId as NucleusTab)}
                size='md'
              />
            </motion.div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'company-context' && (
          <div data-tab='company-context'>
            <CompanyContextTab
              allSections={allSections}
              reportSections={reportSections}
              expandedCategory={expandedCategory}
              setExpandedCategory={handleExpandedCategoryChange}
              getCategoryStateInfo={getCategoryStateInfo}
              getStateConfig={getStateConfig}
              sectionTypeDisplayNames={sectionTypeDisplayNames}
              setCategoryStatusOverrides={setCategoryStatusOverrides}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
              questionStatusOverrides={questionStatusOverrides}
              handleQuestionStatusChange={handleQuestionStatusChange}
              handleSectionStatusChange={handleSectionStatusChange}
              getQuestionState={getQuestionState}
              reportUuid={nucleusReport?.uuid || ''}
              isAdmin={isAdmin}
              onNavigateToCategory={(categoryId) => {
                // Switch to intelligence section and expand the category
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('section'); // intelligence is the default
                setSearchParams(newParams, { replace: true });
                setExpandedCategory(categoryId);
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    const categoryElement = document.getElementById(
                      `category-${categoryId}`,
                    );
                    if (categoryElement) {
                      categoryElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }
                  });
                });
              }}
            />
          </div>
        )}

        {/* Living Personas Tab */}
        {activeTab === 'living-personas' && (
          <div data-tab='living-personas'>
            <LivingPersonasTab />
          </div>
        )}

        {/* Decision Making Tab */}
        {activeTab === 'decision-making' && (
          <div data-tab='decision-making'>
            <DecisionMakingTab />
          </div>
        )}

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
