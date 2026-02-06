import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Lightbulb,
  Link2,
  Copy,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  Filter,
  AlertTriangle,
  X,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  TrendingUp,
} from 'lucide-react';
import api from '@libs/api';
import {
  IIdeaSubmission,
  IdeaSubmissionStatus,
  CATEGORY_LABELS,
  IProcessIdeasResponse,
  IProcessTaskStatus,
} from '@libs/api/types/ideaSubmissions';
import useStore from '@stores/store';
import { toast } from '@components';
import { cn } from '@libs/utils/react';
import { useSocketEvent } from '@hooks/sockets/aucctus';

// Status options for filtering and updating (updated to match new backend schema)
const statusOptions: IdeaSubmissionStatus[] = [
  'to_review',
  'approved',
  'rejected',
];
const filterOptions: Array<'all' | IdeaSubmissionStatus> = [
  'all',
  ...statusOptions,
];

// Status display labels for UI
const STATUS_LABELS: Record<IdeaSubmissionStatus, string> = {
  to_review: 'To Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

/**
 * Admin Panel for Idea Submissions
 *
 * Displays all submitted ideas for the authenticated user's account.
 * Allows admins to view submissions and update their status.
 */
const AdminPanel: FunctionComponent = () => {
  // Track page time for analytics

  const queryClient = useQueryClient();
  const account = useStore((state) => state.auth.account);
  const [selectedSubmission, setSelectedSubmission] =
    useState<IIdeaSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    IdeaSubmissionStatus | 'all'
  >('all');

  // Multi-select state for processing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<string>('');
  const [processingResults, setProcessingResults] =
    useState<IProcessIdeasResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());

  // Fetch all submissions
  const {
    data: submissionResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ideaSubmissions'],
    queryFn: () => api.ideaSubmissions.getAllSubmissions(),
  });

  // Extract submissions array from response
  const submissions = submissionResponse?.submissions ?? [];

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      uuid,
      status,
    }: {
      uuid: string;
      status: IdeaSubmissionStatus;
    }) => api.ideaSubmissions.updateSubmissionStatus(uuid, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaSubmissions'] });
      toast.success('Status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  // Delete submission mutation
  const deleteSubmissionMutation = useMutation({
    mutationFn: (uuid: string) => api.ideaSubmissions.deleteSubmission(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideaSubmissions'] });
      toast.success('Idea submission deleted successfully');
      setSelectedSubmission(null);
    },
    onError: () => {
      toast.error('Failed to delete submission');
    },
  });

  // Process ideas mutation
  const processIdeasMutation = useMutation({
    mutationFn: (submissionUuids: string[]) =>
      api.ideaSubmissions.processIdeas(submissionUuids),
    onSuccess: (data) => {
      setProcessingTaskId(data.taskId);
      setProcessingProgress('Starting AI processing...');
      toast.success('Processing started!');
    },
    onError: () => {
      setIsProcessing(false);
      toast.error('Failed to start processing');
    },
  });

  // Poll for task status (fallback if WebSocket doesn't respond)
  const { data: taskStatus } = useQuery<IProcessTaskStatus>({
    queryKey: ['ideaProcessingStatus', processingTaskId],
    queryFn: () => api.ideaSubmissions.getProcessingStatus(processingTaskId!),
    enabled: !!processingTaskId && isProcessing,
    refetchInterval: 5000, // Reduced frequency since we have WebSocket
  });

  // WebSocket: Listen for processing started event
  useSocketEvent<'idea_submissions.processing.started.user'>(
    'idea_submissions.processing.started.user',
    useCallback(
      (data) => {
        // eslint-disable-next-line no-console
        console.log('🔔 WebSocket: Processing started event received', {
          data,
          processingTaskId,
          matches: data.taskId === processingTaskId,
        });
        // Accept message regardless of taskId since it might not be set yet
        if (data.accountUuid === account?.uuid) {
          setProcessingProgress(
            `Processing ${data.submissionCount} ideas with AI...`,
          );
        }
      },
      [processingTaskId, account?.uuid],
    ),
  );

  // WebSocket: Listen for processing completed event
  useSocketEvent<'idea_submissions.processing.completed.user'>(
    'idea_submissions.processing.completed.user',
    useCallback(
      (data) => {
        // eslint-disable-next-line no-console
        console.log('🔔 WebSocket: Processing completed event received', {
          data,
          processingTaskId,
          matches: data.taskId === processingTaskId,
        });
        // Match by taskId if available, otherwise match by account
        const isMatch =
          (processingTaskId && data.taskId === processingTaskId) ||
          (!processingTaskId && data.accountUuid === account?.uuid);

        if (isMatch && isProcessing) {
          // Fetch the full results via API since WebSocket only has summary
          api.ideaSubmissions
            .getProcessingStatus(data.taskId)
            .then((status) => {
              // eslint-disable-next-line no-console
              console.log('📦 API: Got processing status', status);

              if (status.result) {
                setProcessingResults(status.result);
                setShowResults(true);
                setIsProcessing(false);
                setProcessingTaskId(null);
                setSelectedIds(new Set());

                toast.success(
                  `Processed ${status.result.totalIdeasProcessed} ideas successfully! Found ${status.result.themes?.length ?? 0} themes and ${status.result.topRecommendations?.length ?? 0} top recommendations.`,
                );
              }
            })
            .catch((err) => {
              // eslint-disable-next-line no-console
              console.error('❌ API: Error fetching status', err);
              setIsProcessing(false);
              setProcessingTaskId(null);
              toast.error('Failed to load processing results');
            });
        }
      },
      [processingTaskId, account?.uuid, isProcessing],
    ),
  );

  // WebSocket: Listen for processing error event
  useSocketEvent<'idea_submissions.processing.error.user'>(
    'idea_submissions.processing.error.user',
    useCallback(
      (data) => {
        // eslint-disable-next-line no-console
        console.log('🔔 WebSocket: Processing error event received', {
          data,
          processingTaskId,
        });
        // Match by taskId if available, otherwise match by account
        const isMatch =
          (processingTaskId && data.taskId === processingTaskId) ||
          (!processingTaskId && data.accountUuid === account?.uuid);

        if (isMatch && isProcessing) {
          setIsProcessing(false);
          setProcessingTaskId(null);
          toast.error(data.errorMessage || 'Processing failed');
        }
      },
      [processingTaskId, account?.uuid, isProcessing],
    ),
  );

  // Handle task status updates (fallback for polling)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('📊 Polling: taskStatus updated', {
      taskStatus,
      isProcessing,
      processingTaskId,
    });

    if (!taskStatus) return;

    if (taskStatus.status === 'SUCCESS' && taskStatus.result) {
      // Only update if WebSocket hasn't already handled it
      if (isProcessing) {
        setProcessingResults(taskStatus.result);
        setIsProcessing(false);
        setProcessingTaskId(null);
        setSelectedIds(new Set());
        setShowResults(true);
        toast.success(
          `Processed ${taskStatus.result.totalIdeasProcessed} ideas successfully!`,
        );
      }
    } else if (taskStatus.status === 'FAILURE') {
      setIsProcessing(false);
      setProcessingTaskId(null);
      toast.error(taskStatus.error || 'Processing failed');
    } else if (taskStatus.status === 'STARTED') {
      setProcessingProgress('AI is analyzing your ideas...');
    }
  }, [taskStatus, isProcessing, processingTaskId]);

  // Selection handlers
  const toggleSelection = (uuid: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid);
    } else {
      newSelected.add(uuid);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (filteredSubmissions) {
      setSelectedIds(
        new Set(filteredSubmissions.map((s: IIdeaSubmission) => s.uuid)),
      );
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleProcessIdeas = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one idea to process');
      return;
    }
    setIsProcessing(true);
    setProcessingResults(null);
    processIdeasMutation.mutate(Array.from(selectedIds));
  };

  // Toggle theme expansion
  const toggleTheme = (themeName: string) => {
    const newExpanded = new Set(expandedThemes);
    if (newExpanded.has(themeName)) {
      newExpanded.delete(themeName);
    } else {
      newExpanded.add(themeName);
    }
    setExpandedThemes(newExpanded);
  };

  // Filter submissions
  const filteredSubmissions = submissions?.filter(
    (submission: IIdeaSubmission) =>
      filterStatus === 'all' ? true : submission.status === filterStatus,
  );

  // Status badge styling
  const getStatusBadge = (status: IdeaSubmissionStatus) => {
    const styles: { [key: string]: string } = {
      pending:
        'aucctus-bg-warning-secondary aucctus-text-warning-primary aucctus-border-warning',
      reviewed:
        'aucctus-bg-success-secondary aucctus-text-success-primary aucctus-border-success',
      archived:
        'aucctus-bg-secondary aucctus-text-tertiary aucctus-border-secondary',
    };

    const labels: { [key: string]: string } = {
      pending: 'Pending',
      reviewed: 'Reviewed',
      archived: 'Archived',
    };

    return (
      <span
        className={cn(
          'aucctus-text-xs-semibold rounded-full border px-3 py-1',
          styles[status],
        )}
      >
        {labels[status]}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate shareable link
  const shareableLink = account?.uuid
    ? `${window.location.origin}/submit-idea/${account.uuid}`
    : '';

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='flex animate-pulse flex-col items-center gap-4'>
          <div className='aucctus-border-brand h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Loading submissions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <div className='aucctus-bg-error-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
            <AlertTriangle className='aucctus-stroke-error-primary h-8 w-8' />
          </div>
          <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
            Failed to load submissions
          </h3>
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      {/* Header with Icon */}
      <div className='mb-8 flex items-start justify-between'>
        <div className='flex items-start gap-4'>
          <div className='aucctus-bg-brand-secondary flex h-14 w-14 items-center justify-center rounded-xl shadow-sm'>
            <Lightbulb className='aucctus-stroke-brand-primary h-7 w-7' />
          </div>
          <div>
            <h1 className='aucctus-header-xl-semibold aucctus-text-primary mb-1'>
              Idea Submissions
            </h1>
            <p className='aucctus-text-md aucctus-text-secondary'>
              Review and manage innovation ideas submitted by your team.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className='flex gap-4'>
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-4 py-3 text-center'>
            <div className='aucctus-text-2xl-bold aucctus-text-brand-primary'>
              {submissions?.length || 0}
            </div>
            <div className='aucctus-text-xs aucctus-text-tertiary uppercase tracking-wide'>
              Total Ideas
            </div>
          </div>
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-4 py-3 text-center'>
            <div className='aucctus-text-2xl-bold aucctus-text-warning-primary'>
              {submissions?.filter(
                (s: IIdeaSubmission) => s.status === 'to_review',
              ).length || 0}
            </div>
            <div className='aucctus-text-xs aucctus-text-tertiary uppercase tracking-wide'>
              To Review
            </div>
          </div>
        </div>
      </div>

      {/* Shareable Link Card - Redesigned */}
      <div className='aucctus-bg-primary aucctus-border-secondary mb-8 rounded-xl border shadow-sm'>
        <div className='flex items-center gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-700'>
          <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-lg'>
            <Link2 className='aucctus-stroke-brand-primary h-5 w-5' />
          </div>
          <div>
            <h3 className='aucctus-text-md-semibold aucctus-text-primary'>
              Share Submission Form
            </h3>
            <p className='aucctus-text-sm aucctus-text-tertiary'>
              Share this link with your team to collect innovation ideas
            </p>
          </div>
        </div>
        <div className='px-6 py-5'>
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-secondary aucctus-border-secondary flex-1 rounded-lg border px-4 py-3'>
              <code className='aucctus-text-sm aucctus-text-brand-primary font-mono'>
                {shareableLink}
              </code>
            </div>
            <button
              onClick={copyShareableLink}
              className='btn btn-primary btn-md flex items-center gap-2'
            >
              <Copy className='h-4 w-4' />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Filters - Redesigned */}
      <div className='aucctus-bg-primary aucctus-border-secondary mb-6 rounded-xl border p-4 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Filter className='aucctus-stroke-tertiary h-5 w-5' />
            <span className='aucctus-text-sm-semibold aucctus-text-secondary'>
              Filter by Status
            </span>
          </div>
          <div className='flex gap-2'>
            {filterOptions.map((status) => {
              const count =
                status !== 'all' && submissions
                  ? submissions.filter(
                      (s: IIdeaSubmission) => s.status === status,
                    ).length
                  : submissions?.length || 0;

              const isActive = filterStatus === status;

              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'aucctus-text-sm-semibold flex items-center gap-2 rounded-lg border px-4 py-2 transition-all',
                    {
                      'aucctus-bg-brand-secondary aucctus-text-brand-primary aucctus-border-brand shadow-sm':
                        isActive,
                      'aucctus-bg-secondary aucctus-text-secondary aucctus-border-secondary hover:aucctus-bg-tertiary':
                        !isActive,
                    },
                  )}
                >
                  {status === 'all' && <Filter className='h-4 w-4' />}
                  {status === 'to_review' && <Clock className='h-4 w-4' />}
                  {status === 'approved' && (
                    <CheckCircle2 className='h-4 w-4' />
                  )}
                  {status === 'rejected' && <Archive className='h-4 w-4' />}
                  {status === 'all' ? 'All' : STATUS_LABELS[status]}
                  <span
                    className={cn(
                      'aucctus-text-xs-semibold rounded-full border px-2 py-0.5',
                      isActive
                        ? 'aucctus-bg-brand-secondary aucctus-text-brand-primary aucctus-border-brand'
                        : 'aucctus-bg-secondary aucctus-text-secondary aucctus-border-secondary',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selection and Processing Controls */}
      {filteredSubmissions && filteredSubmissions.length > 0 && (
        <div className='aucctus-bg-primary aucctus-border-secondary mb-6 flex items-center justify-between rounded-xl border p-4 shadow-sm'>
          <div className='flex items-center gap-4'>
            <button
              onClick={
                selectedIds.size === filteredSubmissions.length
                  ? deselectAll
                  : selectAll
              }
              className='aucctus-text-sm-semibold aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-2 transition-colors'
            >
              {selectedIds.size === filteredSubmissions.length ? (
                <>
                  <CheckSquare className='aucctus-stroke-brand-primary h-5 w-5' />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className='h-5 w-5' />
                  Select All
                </>
              )}
            </button>
            {selectedIds.size > 0 && (
              <span className='aucctus-text-sm aucctus-text-secondary'>
                {selectedIds.size} idea{selectedIds.size !== 1 ? 's' : ''}{' '}
                selected
              </span>
            )}
          </div>

          {selectedIds.size > 0 && (
            <button
              onClick={handleProcessIdeas}
              disabled={isProcessing}
              className='btn btn-primary btn-md flex items-center gap-2 disabled:opacity-50'
            >
              {isProcessing ? (
                <>
                  <Loader2 className='h-5 w-5 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className='h-5 w-5' />
                  Process {selectedIds.size} Idea
                  {selectedIds.size !== 1 ? 's' : ''} with AI
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className='aucctus-bg-brand-secondary aucctus-border-brand mb-6 rounded-xl border p-6'>
          <div className='flex items-center gap-4'>
            <div className='aucctus-bg-brand-primary flex h-12 w-12 items-center justify-center rounded-full'>
              <Loader2 className='h-6 w-6 animate-spin text-white' />
            </div>
            <div>
              <h3 className='aucctus-text-lg-semibold aucctus-text-brand-primary mb-1'>
                AI Processing Your Ideas
              </h3>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                {processingProgress}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Processing Results */}
      {showResults && processingResults && (
        <div className='aucctus-bg-primary aucctus-border-secondary mb-6 overflow-hidden rounded-xl border shadow-lg'>
          {/* Results Header */}
          <div className='aucctus-bg-success-secondary border-b border-green-200 p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='aucctus-bg-success-solid flex h-14 w-14 items-center justify-center rounded-full'>
                  <Sparkles className='h-7 w-7 text-white' />
                </div>
                <div>
                  <h3 className='aucctus-text-xl-bold aucctus-text-success-primary mb-1'>
                    AI Analysis Complete
                  </h3>
                  <p className='aucctus-text-sm aucctus-text-secondary'>
                    Processed {processingResults.totalIdeasProcessed} ideas →{' '}
                    {processingResults.uniqueIdeasCount} unique
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResults(false)}
                className='aucctus-bg-tertiary hover:aucctus-bg-quaternary rounded-lg p-2 transition-colors'
              >
                <X className='aucctus-stroke-secondary h-5 w-5' />
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className='border-b border-gray-200 p-6'>
            <p className='aucctus-text-md aucctus-text-primary leading-relaxed'>
              {processingResults.executiveSummary}
            </p>
          </div>

          {/* Top Recommendations */}
          <div className='border-b border-gray-200 p-6'>
            <div className='mb-4 flex items-center gap-2'>
              <Award className='aucctus-stroke-brand-primary h-5 w-5' />
              <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Top Recommendations
              </h4>
            </div>
            <div className='space-y-3'>
              {(processingResults.topRecommendations ?? [])
                .slice(0, 5)
                .map((rec, idx) => (
                  <div
                    key={rec.uuid}
                    className='aucctus-bg-secondary flex items-start gap-4 rounded-lg p-4'
                  >
                    <div className='aucctus-bg-brand-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full'>
                      <span className='aucctus-text-sm-bold text-white'>
                        #{idx + 1}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <div className='mb-1 flex items-center justify-between'>
                        <h5 className='aucctus-text-md-semibold aucctus-text-primary'>
                          {rec.title}
                        </h5>
                        <span className='aucctus-text-sm-semibold aucctus-text-brand-primary'>
                          Score: {rec.overallScore?.toFixed(1) ?? 0}/10
                        </span>
                      </div>
                      <p className='aucctus-text-sm aucctus-text-secondary mb-2'>
                        {rec.recommendation}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {(rec.keyStrengths ?? []).map((strength, i) => (
                          <span
                            key={i}
                            className='aucctus-text-xs aucctus-bg-success-secondary aucctus-text-success-primary rounded-full px-2 py-1'
                          >
                            ✓ {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Themes */}
          <div className='border-b border-gray-200 p-6'>
            <div className='mb-4 flex items-center gap-2'>
              <Users className='aucctus-stroke-brand-primary h-5 w-5' />
              <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Themes ({(processingResults.themes ?? []).length})
              </h4>
            </div>
            <div className='space-y-3'>
              {(processingResults.themes ?? []).map((theme) => (
                <div
                  key={theme.themeName}
                  className='aucctus-bg-secondary aucctus-border-secondary overflow-hidden rounded-lg border'
                >
                  <button
                    onClick={() => toggleTheme(theme.themeName)}
                    className='hover:aucctus-bg-tertiary flex w-full items-center justify-between p-4 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-2xl'>{theme.themeIcon}</span>
                      <div className='text-left'>
                        <h5 className='aucctus-text-md-semibold aucctus-text-primary'>
                          {theme.themeName}
                        </h5>
                        <p className='aucctus-text-sm aucctus-text-secondary'>
                          {(theme.ideaUuids ?? []).length} idea
                          {(theme.ideaUuids ?? []).length !== 1 ? 's' : ''} •
                          Priority: {theme.themePriority}
                        </p>
                      </div>
                    </div>
                    {expandedThemes.has(theme.themeName) ? (
                      <ChevronUp className='aucctus-stroke-secondary h-5 w-5' />
                    ) : (
                      <ChevronDown className='aucctus-stroke-secondary h-5 w-5' />
                    )}
                  </button>
                  {expandedThemes.has(theme.themeName) && (
                    <div className='border-t border-gray-200 p-4'>
                      <p className='aucctus-text-sm aucctus-text-secondary'>
                        {theme.themeDescription}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className='p-6'>
            <div className='mb-4 flex items-center gap-2'>
              <TrendingUp className='aucctus-stroke-brand-primary h-5 w-5' />
              <h4 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Key Insights
              </h4>
            </div>
            <ul className='aucctus-text-sm aucctus-text-secondary space-y-2'>
              {(processingResults.keyInsights ?? []).map((insight, idx) => (
                <li key={idx} className='flex items-start gap-2'>
                  <span className='aucctus-text-brand-primary mt-1'>•</span>
                  {insight}
                </li>
              ))}
            </ul>
            {(processingResults.suggestedNextSteps ?? []).length > 0 && (
              <div className='mt-4'>
                <h5 className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                  Suggested Next Steps:
                </h5>
                <ul className='aucctus-text-sm aucctus-text-secondary space-y-1'>
                  {(processingResults.suggestedNextSteps ?? []).map(
                    (step, idx) => (
                      <li key={idx} className='flex items-start gap-2'>
                        <span className='aucctus-text-success-primary'>→</span>
                        {step}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions Grid - Redesigned as Cards */}
      {filteredSubmissions && filteredSubmissions.length > 0 ? (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredSubmissions.map((submission: IIdeaSubmission) => {
            const isSelected = selectedIds.has(submission.uuid);
            return (
              <div
                key={submission.uuid}
                className={cn(
                  'aucctus-bg-primary group cursor-pointer rounded-xl border shadow-sm transition-all',
                  {
                    'aucctus-border-brand ring-brand-primary/20 ring-2':
                      isSelected,
                    'aucctus-border-secondary hover:aucctus-border-brand':
                      !isSelected,
                  },
                )}
              >
                {/* Card Header */}
                <div className='border-b border-gray-200 p-4 dark:border-gray-700'>
                  <div className='mb-3 flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                      {/* Selection Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(submission.uuid);
                        }}
                        className='aucctus-bg-secondary hover:aucctus-bg-tertiary flex h-8 w-8 items-center justify-center rounded-lg transition-colors'
                      >
                        {isSelected ? (
                          <CheckSquare className='aucctus-stroke-brand-primary h-5 w-5' />
                        ) : (
                          <Square className='aucctus-stroke-secondary h-5 w-5' />
                        )}
                      </button>
                      <span className='aucctus-text-xs-semibold aucctus-bg-secondary aucctus-text-secondary rounded-full px-3 py-1'>
                        {submission.category
                          ? CATEGORY_LABELS[submission.category] ||
                            submission.category
                          : 'Uncategorized'}
                      </span>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>
                  <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-2 line-clamp-2'>
                    {submission.title}
                  </h3>
                  <p className='aucctus-text-sm aucctus-text-secondary line-clamp-2'>
                    {submission.problemStatement}
                  </p>
                </div>

                {/* Card Footer */}
                <div className='flex items-center justify-between p-4'>
                  <div className='flex items-center gap-2'>
                    <div className='aucctus-bg-secondary flex h-8 w-8 items-center justify-center rounded-full'>
                      <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                        {submission.submitterName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='aucctus-text-xs-semibold aucctus-text-primary'>
                        {submission.submitterName}
                      </span>
                      <span className='aucctus-text-xs aucctus-text-tertiary'>
                        {formatDate(submission.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(submission);
                      }}
                      className='aucctus-text-brand-primary hover:aucctus-bg-brand-secondary flex items-center gap-1 rounded-lg px-3 py-2 transition-colors'
                    >
                      <Eye className='h-4 w-4' />
                      <span className='aucctus-text-xs-semibold'>View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${submission.title}"?`,
                          )
                        ) {
                          deleteSubmissionMutation.mutate(submission.uuid);
                        }
                      }}
                      disabled={deleteSubmissionMutation.isLoading}
                      className='aucctus-text-error-primary hover:aucctus-bg-error-secondary flex items-center gap-1 rounded-lg px-3 py-2 transition-colors disabled:opacity-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border py-16 text-center shadow-sm'>
          <div className='aucctus-bg-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full'>
            <Lightbulb className='aucctus-stroke-tertiary h-10 w-10' />
          </div>
          <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
            No submissions yet
          </h3>
          <p className='aucctus-text-sm aucctus-text-secondary mb-6'>
            Share the submission link with your team to start collecting ideas.
          </p>
        </div>
      )}

      {/* Detail Modal - Redesigned */}
      {selectedSubmission && (
        <div className='aucctus-bg-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
          <div className='aucctus-bg-primary aucctus-border-secondary max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl'>
            {/* Modal Header - Enhanced */}
            <div className='aucctus-bg-secondary border-b border-gray-200 p-6 dark:border-gray-700'>
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='aucctus-bg-brand-secondary flex h-12 w-12 items-center justify-center rounded-xl'>
                    <Lightbulb className='aucctus-stroke-brand-primary h-6 w-6' />
                  </div>
                  <div>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='aucctus-text-xs-semibold aucctus-bg-brand-secondary aucctus-text-brand-primary aucctus-border-brand rounded-full border px-3 py-1'>
                        {selectedSubmission.category
                          ? CATEGORY_LABELS[selectedSubmission.category] ||
                            selectedSubmission.category
                          : 'Uncategorized'}
                      </span>
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                    <h2 className='aucctus-text-xl-bold aucctus-text-primary'>
                      {selectedSubmission.title}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className='aucctus-bg-tertiary hover:aucctus-bg-quaternary rounded-lg p-2 transition-colors'
                >
                  <X className='aucctus-stroke-secondary h-5 w-5' />
                </button>
              </div>

              {/* Submitter Info Bar */}
              <div className='aucctus-bg-primary flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                <div className='aucctus-bg-brand-secondary flex h-10 w-10 items-center justify-center rounded-full'>
                  <span className='aucctus-text-md-semibold aucctus-text-brand-primary'>
                    {selectedSubmission.submitterName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className='flex-1'>
                  <div className='aucctus-text-sm-semibold aucctus-text-primary'>
                    {selectedSubmission.submitterName}
                  </div>
                  <div className='aucctus-text-xs aucctus-text-tertiary'>
                    {selectedSubmission.submitterEmail} •{' '}
                    {selectedSubmission.department || 'No department'}
                  </div>
                </div>
                <div className='aucctus-text-xs aucctus-text-tertiary'>
                  {formatDate(selectedSubmission.createdAt)}
                </div>
              </div>
            </div>

            {/* Modal Body - Enhanced */}
            <div className='space-y-6 p-6'>
              {/* Problem Statement Card */}
              <div className='aucctus-bg-secondary rounded-xl border border-gray-200 p-5 dark:border-gray-700'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='aucctus-bg-error-secondary flex h-8 w-8 items-center justify-center rounded-lg'>
                    <span className='aucctus-text-error-primary text-lg'>
                      ⚠️
                    </span>
                  </div>
                  <span className='aucctus-text-sm-semibold aucctus-text-secondary uppercase tracking-wide'>
                    Problem Statement
                  </span>
                </div>
                <div className='aucctus-text-md aucctus-text-primary whitespace-pre-wrap leading-relaxed'>
                  {selectedSubmission.problemStatement}
                </div>
              </div>

              {/* Proposed Solution Card */}
              <div className='aucctus-bg-secondary rounded-xl border border-gray-200 p-5 dark:border-gray-700'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='aucctus-bg-success-secondary flex h-8 w-8 items-center justify-center rounded-lg'>
                    <Lightbulb className='aucctus-stroke-success-primary h-5 w-5' />
                  </div>
                  <span className='aucctus-text-sm-semibold aucctus-text-secondary uppercase tracking-wide'>
                    Proposed Solution
                  </span>
                </div>
                <div className='aucctus-text-md aucctus-text-primary whitespace-pre-wrap leading-relaxed'>
                  {selectedSubmission.proposedSolution}
                </div>
              </div>

              {/* Expected Impact Card */}
              {selectedSubmission.expectedImpact && (
                <div className='aucctus-bg-secondary rounded-xl border border-gray-200 p-5 dark:border-gray-700'>
                  <div className='mb-3 flex items-center gap-2'>
                    <div className='aucctus-bg-info-secondary flex h-8 w-8 items-center justify-center rounded-lg'>
                      <span className='aucctus-text-info-primary text-lg'>
                        📈
                      </span>
                    </div>
                    <span className='aucctus-text-sm-semibold aucctus-text-secondary uppercase tracking-wide'>
                      Expected Impact
                    </span>
                  </div>
                  <div className='aucctus-text-md aucctus-text-primary whitespace-pre-wrap leading-relaxed'>
                    {selectedSubmission.expectedImpact}
                  </div>
                </div>
              )}

              {/* Status Actions - Enhanced */}
              <div className='aucctus-bg-tertiary rounded-xl border border-gray-200 p-5 dark:border-gray-700'>
                <div className='mb-4 flex items-center gap-2'>
                  <CheckCircle2 className='aucctus-stroke-brand-primary h-5 w-5' />
                  <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                    Update Status
                  </span>
                </div>
                <div className='flex gap-3'>
                  {statusOptions.map((status) => {
                    const isActive = selectedSubmission.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          updateStatusMutation.mutate({
                            uuid: selectedSubmission.uuid,
                            status,
                          });
                          setSelectedSubmission({
                            ...selectedSubmission,
                            status,
                          });
                        }}
                        disabled={isActive || updateStatusMutation.isLoading}
                        className={cn(
                          'aucctus-text-sm-semibold flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 transition-all',
                          {
                            'aucctus-bg-brand-secondary aucctus-text-brand-primary aucctus-border-brand cursor-default shadow-sm':
                              isActive,
                            'aucctus-bg-primary aucctus-text-secondary aucctus-border-secondary hover:aucctus-bg-secondary disabled:opacity-50':
                              !isActive,
                          },
                        )}
                      >
                        {status === 'to_review' && (
                          <Clock
                            className={cn('h-4 w-4', {
                              'aucctus-stroke-brand-primary': isActive,
                              'aucctus-stroke-secondary': !isActive,
                            })}
                          />
                        )}
                        {status === 'approved' && (
                          <CheckCircle2
                            className={cn('h-4 w-4', {
                              'aucctus-stroke-brand-primary': isActive,
                              'aucctus-stroke-secondary': !isActive,
                            })}
                          />
                        )}
                        {status === 'rejected' && (
                          <Archive
                            className={cn('h-4 w-4', {
                              'aucctus-stroke-brand-primary': isActive,
                              'aucctus-stroke-secondary': !isActive,
                            })}
                          />
                        )}
                        {STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className='aucctus-border-secondary flex items-center justify-between border-t p-6'>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete "${selectedSubmission.title}"? This action cannot be undone.`,
                    )
                  ) {
                    deleteSubmissionMutation.mutate(selectedSubmission.uuid);
                  }
                }}
                disabled={deleteSubmissionMutation.isLoading}
                className='btn btn-danger btn-md flex items-center gap-2 disabled:opacity-50'
              >
                <Trash2 className='h-4 w-4' />
                Delete Submission
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className='btn btn-secondary btn-md'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
