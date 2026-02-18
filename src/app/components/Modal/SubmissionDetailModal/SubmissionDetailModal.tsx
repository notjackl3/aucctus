import { Loading, ScoringCriteriaSection, toast } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useSubmissionDetail } from '@hooks/query/idea-submissions.hook';
import api from '@libs/api';
import {
  IIdeaSubmission,
  IdeaSubmissionStatus,
} from '@libs/api/types/ideaSubmissions';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  FolderPlus,
  Lightbulb,
  Link2,
  Loader2,
  Star,
  User,
  X,
} from 'lucide-react';
import { FunctionComponent, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

// Status display configuration
const STATUS_CONFIG: Record<
  IdeaSubmissionStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  to_review: {
    label: 'To Review',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  },
  approved: {
    label: 'Approved',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
  },
};

// Theme color palette for badges
const THEME_COLORS = [
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
];

// Get consistent color for a theme name
const getThemeColor = (themeName: string) => {
  const hash = themeName
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return THEME_COLORS[hash % THEME_COLORS.length];
};

// Score interpretation based on value
const getScoreInterpretation = (score: number | null): string => {
  if (score === null) return 'This submission has not been scored yet.';
  if (score >= 80)
    return 'This submission shows high potential and should be prioritized for review.';
  if (score >= 60)
    return 'This submission has good potential with some areas for improvement.';
  if (score >= 40)
    return 'This submission has moderate potential but needs further refinement.';
  return 'This submission needs significant development before proceeding.';
};

interface SubmissionDetailModalProps {
  submission: IIdeaSubmission;
  /** The submission link UUID - required for fetching detailed scores */
  linkUuid: string;
  linkTitle?: string;
  onStatusChange?: () => void;
}

/**
 * Submission Detail Modal Component
 *
 * Right-side drawer modal showing complete submission details.
 * Uses the Modal system with position: 'right' for slide-in animation.
 */
const SubmissionDetailModal: FunctionComponent<SubmissionDetailModalProps> = ({
  submission,
  linkUuid,
  linkTitle,
  onStatusChange,
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { closeModal } = useModal();

  // Status dropdown state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(submission.status);

  // Generate report state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Track if saved to bank (local state to immediately disable buttons)
  const [isSavedToBank, setIsSavedToBank] = useState(!!submission.conceptUuid);

  // Score editing state
  const [questionScores, setQuestionScores] = useState<Record<string, number>>(
    {},
  );
  const [updatingQuestionId, setUpdatingQuestionId] = useState<string | null>(
    null,
  );

  // Fetch detailed submission with score breakdown
  const { submissionDetail, isLoading: isLoadingDetail } = useSubmissionDetail(
    linkUuid,
    submission.uuid,
  );

  // Update question score mutation
  const updateQuestionScoreMutation = useMutation({
    mutationFn: ({
      questionUuid,
      score,
    }: {
      questionUuid: string;
      score: number;
    }) =>
      api.ideaSubmissions.updateQuestionScore(
        submission.uuid,
        questionUuid,
        score,
      ),
    onMutate: ({ questionUuid, score }) => {
      // Optimistic update
      setUpdatingQuestionId(questionUuid);
      setQuestionScores((prev) => ({ ...prev, [questionUuid]: score }));
    },
    onSuccess: () => {
      // Invalidate to refetch updated totals
      queryClient.invalidateQueries({
        queryKey: ['submissionDetail', linkUuid, submission.uuid],
      });
      queryClient.invalidateQueries({
        queryKey: ['submissionLinkSubmissions'],
      });
      toast.success('Score updated');
    },
    onError: (_, { questionUuid }) => {
      // Revert optimistic update
      setQuestionScores((prev) => {
        const updated = { ...prev };
        delete updated[questionUuid];
        return updated;
      });
      toast.error('Failed to update score');
    },
    onSettled: () => {
      setUpdatingQuestionId(null);
    },
  });

  // Handle score change
  const handleScoreChange = (questionId: string, score: number) => {
    updateQuestionScoreMutation.mutate({ questionUuid: questionId, score });
  };

  // Get theme color
  const themeColor = submission.theme ? getThemeColor(submission.theme) : null;
  const statusConfig = STATUS_CONFIG[currentStatus];

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: IdeaSubmissionStatus) =>
      api.ideaSubmissions.updateSubmissionStatus(submission.uuid, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['submissionLinkSubmissions'],
      });
      queryClient.invalidateQueries({ queryKey: ['ideaSubmissions'] });
      toast.success('Status updated successfully');
      onStatusChange?.();
    },
    onError: () => {
      toast.error('Failed to update status');
      setCurrentStatus(submission.status);
    },
  });

  // Save to bank mutation
  const saveToBankMutation = useMutation({
    mutationFn: () => api.ideaSubmissions.saveToBank(submission.uuid),
    onSuccess: () => {
      setIsSavedToBank(true);
      queryClient.invalidateQueries({
        queryKey: ['submissionLinkSubmissions'],
      });
      toast.success('Saved to concept bank!');
    },
    onError: () => {
      toast.error('Failed to save to concept bank');
    },
  });

  // Buttons should be disabled if already saved to bank
  const isAlreadySaved = isSavedToBank || !!submission.conceptUuid;
  const shouldGenerateReport = !submission?.reportGenerated && !isAlreadySaved;

  // Handle generate report
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setIsSavedToBank(true);

    try {
      let conceptUuid = submission.conceptUuid;

      // If not already saved to bank, save first (with generateReport flag if needed)
      if (!conceptUuid) {
        const result = await api.ideaSubmissions.saveToBank(submission.uuid, {
          generateReport: !submission?.reportGenerated,
        });
        conceptUuid = result.conceptUuid;
        queryClient.invalidateQueries({
          queryKey: ['submissionLinkSubmissions'],
        });
        toast.success(
          !submission?.reportGenerated
            ? 'Saved to concept bank! Report generation started.'
            : 'Saved to concept bank!',
        );
      }

      // Close modal and navigate to concept detail page
      // Only pass generateReport flag if report hasn't been generated and concept already existed
      closeModal();
      navigate(AppPath.ConceptBank);
    } catch {
      toast.error('Failed to generate report');
      setIsGeneratingReport(false);
      setIsSavedToBank(false);
    }
  };

  // Handle status change
  const handleStatusChange = (newStatus: IdeaSubmissionStatus) => {
    setCurrentStatus(newStatus);
    setIsStatusDropdownOpen(false);
    updateStatusMutation.mutate(newStatus);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get submitter display name
  const getSubmitterName = () => {
    if (submission.firstName && submission.lastName) {
      return `${submission.firstName} ${submission.lastName}`;
    }
    return submission.submitterName || 'Anonymous';
  };

  return (
    <div className='aucctus-bg-primary flex h-screen w-[480px] flex-col overflow-hidden'>
      {/* Header Image - Gradient with Lightbulb */}
      <div
        className='relative flex h-32 w-full flex-shrink-0 items-center justify-center'
        style={{
          background:
            'linear-gradient(to bottom right, hsla(0, 27%, 29%, 0.2), hsla(0, 27%, 29%, 0.05))',
        }}
      >
        {/* Close Button - Top Right */}
        <motion.button
          onClick={closeModal}
          className='absolute right-4 top-4 rounded-lg bg-white/80 p-2 backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800'
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <X className='aucctus-stroke-secondary h-5 w-5' />
        </motion.button>

        {/* Lightbulb Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
        >
          <Lightbulb
            className='h-16 w-16'
            style={{ color: 'hsla(0, 27%, 29%, 0.4)' }}
          />
        </motion.div>
      </div>

      {/* Header Content */}
      <div className='aucctus-border-secondary flex-shrink-0 border-b px-6 pb-6 pt-4'>
        {/* Theme Badge and Status Row */}
        <motion.div
          className='mb-4 flex items-center justify-center gap-3'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {/* Theme Badge */}
          {submission.theme && themeColor && (
            <motion.span
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold',
                themeColor.bg,
                themeColor.text,
                themeColor.border,
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {submission.theme}
            </motion.span>
          )}

          {/* Status Dropdown */}
          <div className='relative'>
            <motion.button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={cn(
                'flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                statusConfig.bgClass,
                statusConfig.textClass,
                statusConfig.borderClass,
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {statusConfig.label}
              <motion.div
                animate={{ rotate: isStatusDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className='h-3 w-3' />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isStatusDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className='aucctus-bg-primary aucctus-border-secondary absolute left-1/2 top-full z-20 mt-1 w-36 -translate-x-1/2 rounded-lg border shadow-lg'
                >
                  {Object.entries(STATUS_CONFIG).map(
                    ([status, config], index) => (
                      <motion.button
                        key={status}
                        onClick={() =>
                          handleStatusChange(status as IdeaSubmissionStatus)
                        }
                        className={cn(
                          'aucctus-text-sm flex w-full items-center gap-2 px-3 py-2 text-left transition-colors first:rounded-t-lg last:rounded-b-lg',
                          currentStatus === status
                            ? 'aucctus-bg-brand-secondary aucctus-text-brand-primary'
                            : 'aucctus-text-secondary hover:aucctus-bg-secondary',
                        )}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ x: 2 }}
                      >
                        <motion.span
                          className={cn(
                            'h-2 w-2 rounded-full',
                            status === 'to_review' && 'bg-amber-500',
                            status === 'approved' && 'bg-emerald-500',
                            status === 'rejected' && 'bg-red-500',
                          )}
                          layoutId={
                            currentStatus === status
                              ? 'activeStatus'
                              : undefined
                          }
                        />
                        {config.label}
                      </motion.button>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className='aucctus-text-xl-semibold aucctus-text-primary mb-2 text-center'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {submission.title}
        </motion.h2>

        {/* Subtitle / Description */}
        <motion.p
          className='aucctus-text-sm aucctus-text-secondary mb-4 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          {submission.proposedSolution?.slice(0, 100)}
          {(submission.proposedSolution?.length || 0) > 100 ? '...' : ''}
        </motion.p>

        {/* Submitter Info */}
        <motion.div
          className='aucctus-text-xs aucctus-text-tertiary flex flex-wrap items-center justify-center gap-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <User className='h-3.5 w-3.5' />
          <span>{getSubmitterName()}</span>
          <span className='aucctus-text-quaternary'>|</span>
          <span>{formatDate(submission.createdAt)}</span>
          {linkTitle && (
            <>
              <span className='aucctus-text-quaternary'>|</span>
              <Link2 className='h-3.5 w-3.5' />
              <span>{linkTitle}</span>
            </>
          )}
        </motion.div>
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        {/* Action Buttons */}
        <motion.div
          className='mb-6 flex gap-3'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <motion.button
            onClick={() => saveToBankMutation.mutate()}
            disabled={saveToBankMutation.isLoading || isAlreadySaved}
            className='btn btn-secondary btn-md flex flex-1 items-center justify-center gap-2 disabled:opacity-50'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FolderPlus className='h-4 w-4' />
            {isAlreadySaved ? 'Saved to Bank' : 'Save to Bank'}
          </motion.button>
          <motion.button
            onClick={handleGenerateReport}
            disabled={!shouldGenerateReport}
            className='btn btn-primary btn-md flex flex-1 items-center justify-center gap-2 disabled:opacity-50'
            style={{ backgroundColor: '#1a1a1a' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className='h-4 w-4 fill-white stroke-white' />
                Generate Report
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Score Display */}
        <motion.div
          className='mb-6 rounded-xl bg-amber-50 p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.2,
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
        >
          <div className='flex items-center gap-4'>
            <motion.div
              className='flex h-16 w-16 items-center justify-center'
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >
              <Star className='h-12 w-12 fill-amber-400 stroke-amber-500' />
            </motion.div>
            <motion.div
              className='text-4xl font-bold text-amber-600'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
            >
              {submission.totalScore ?? '--'}
            </motion.div>
          </div>
          <motion.p
            className='aucctus-text-sm mt-4 text-amber-800'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {getScoreInterpretation(submission.totalScore)}
          </motion.p>
        </motion.div>

        {/* Idea Details Section */}
        <motion.div
          className='mb-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className='mb-4 flex items-center gap-2'>
            <Lightbulb className='aucctus-stroke-brand-primary h-5 w-5' />
            <h3 className='aucctus-text-xl-semibold aucctus-text-primary'>
              Idea Details
            </h3>
          </div>

          <div className='space-y-4'>
            {/* Idea Title */}
            <motion.div
              className='aucctus-bg-secondary rounded-lg border border-gray-200/40 p-4 dark:border-gray-700/40'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wide'>
                Idea Title
              </label>
              <p className='aucctus-text-sm aucctus-text-primary mt-1'>
                {submission.title}
              </p>
            </motion.div>

            {/* Idea Description */}
            <motion.div
              className='aucctus-bg-secondary rounded-lg border border-gray-200/40 p-4 dark:border-gray-700/40'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wide'>
                Idea Description
              </label>
              <p className='aucctus-text-sm aucctus-text-primary mt-1 whitespace-pre-wrap'>
                {submission.proposedSolution || 'No description provided'}
              </p>
            </motion.div>

            {/* Problem Statement */}
            <motion.div
              className='aucctus-bg-secondary rounded-lg border border-gray-200/40 p-4 dark:border-gray-700/40'
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wide'>
                What Problem Does It Solve?
              </label>
              <p className='aucctus-text-sm aucctus-text-primary mt-1 whitespace-pre-wrap'>
                {submission.problemStatement || 'No problem statement provided'}
              </p>
            </motion.div>

            {/* Expected Impact */}
            {submission.expectedImpact && (
              <motion.div
                className='aucctus-bg-secondary rounded-lg border border-gray-200/40 p-4 dark:border-gray-700/40'
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wide'>
                  Expected Impact
                </label>
                <p className='aucctus-text-sm aucctus-text-primary mt-1 whitespace-pre-wrap'>
                  {submission.expectedImpact}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Score Breakdown Section - Using shared component with detailed API data */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isLoadingDetail ? (
            <div className='flex items-center justify-center py-8'>
              <Loading />
            </div>
          ) : (
            <ScoringCriteriaSection
              categories={submissionDetail?.categoryScores ?? []}
              totalScore={
                submissionDetail?.totalScore ?? submission.totalScore ?? 0
              }
              variant='editable'
              questionScores={questionScores}
              onScoreChange={handleScoreChange}
              isUpdating={updateQuestionScoreMutation.isLoading}
              updatingQuestionId={updatingQuestionId}
              showQuestionReasoning
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SubmissionDetailModal;
