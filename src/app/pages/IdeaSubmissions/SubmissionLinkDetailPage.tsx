import {
  FunctionComponent,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Eye,
  Pencil,
  PlayCircle,
  Lightbulb,
  Users,
  Star,
  AlertTriangle,
  Sparkles,
  LayoutGrid,
  List,
  GitCompare,
  X,
  Target,
  ChevronUp,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
} from 'lucide-react';
import api from '@libs/api';
import {
  IIdeaSubmission,
  ISubmissionFilterParams,
  ISubmissionLink,
  ISubmissionLinkTheme,
} from '@libs/api/types/ideaSubmissions';
import useStore from '@stores/store';
import { Modal, toast } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import { AppPath } from '@routes/routes';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { SubmissionFilter } from '@components/Submissions/SubmissionFilter';
import {
  useSubmissionLink,
  useSubmissionLinkSubmissions,
} from '@hooks/query/idea-submissions.hook';
import SubmissionLinkModal from './components/SubmissionLinkModal';
import SubmissionCard from './components/SubmissionCard';
import SubmissionsListView from './components/SubmissionsListView';
import ComparisonModal from './components/ComparisonModal';
import BulkEditSubmissionsModal from './components/BulkEditSubmissionsModal';
import FileUploadProgressCard from './components/FileUploadProgressCard';
import DeleteSubmissionLinkModal from './components/DeleteSubmissionLinkModal';
// Note: SubmissionDetailDrawer is no longer used - we now use Modal.SubmissionDetail via openModal

// Local storage key for view preference
const VIEW_PREFERENCE_KEY = 'submission-view-preference';

type ViewMode = 'grid' | 'list';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Submission Link Detail/Dashboard Page
 *
 * Shows all submissions for a specific submission link with:
 * - Header with link info and actions
 * - Stats row (total ideas, duplicates, high-priority)
 * - Major themes section with filterable chips
 * - Analysis summary section
 * - Submissions grid/list with compare functionality
 */
const SubmissionLinkDetailPage: FunctionComponent = () => {
  // Track page time for analytics

  const { linkUuid } = useParams<{ linkUuid: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const account = useStore((state) => state.auth.account);
  const { openModal } = useModal();

  // Modal state for editing and deleting
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Theme filter state
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // View mode state (grid or list)
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return (saved as ViewMode) || 'grid';
  });

  // Filter state for SubmissionFilter component
  const [filterState, setFilterState] = useState<ISubmissionFilterParams>({});

  // Selection mode state for comparison and bulk edit
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionPurpose, setSelectionPurpose] = useState<
    'compare' | 'bulk_edit'
  >('compare');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk edit modal state
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  // Comparison modal state
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Expanded duplicate group state
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<
    string | null
  >(null);

  // File upload progress state
  const [uploadProgress, setUploadProgress] = useState<{
    isActive: boolean;
    sourceFileUuid: string | null;
    filename: string | null;
    stage: string;
    message: string;
    progress: number;
    ideasExtracted: number | null;
    error: string | null;
  }>({
    isActive: false,
    sourceFileUuid: null,
    filename: null,
    stage: '',
    message: '',
    progress: 0,
    ideasExtracted: null,
    error: null,
  });

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
  }, [viewMode]);

  // Listen for upload started events scoped to this submission link
  useSocketEvent<'idea_submissions.upload.started.user'>(
    'idea_submissions.upload.started.user',
    useCallback(
      (data) => {
        if (data.submissionLinkUuid === linkUuid) {
          setUploadProgress({
            isActive: true,
            sourceFileUuid: data.sourceFileUuid,
            filename: data.filename,
            stage: 'started',
            message: `Processing ${data.filename}...`,
            progress: 5,
            ideasExtracted: null,
            error: null,
          });
        }
      },
      [linkUuid],
    ),
  );

  // Listen for upload progress events
  useSocketEvent<'idea_submissions.upload.progress.user'>(
    'idea_submissions.upload.progress.user',
    useCallback(
      (data) => {
        if (data.submissionLinkUuid === linkUuid) {
          setUploadProgress((prev) => ({
            ...prev,
            stage: data.stage,
            message: data.message,
            progress: data.progress,
          }));
        }
      },
      [linkUuid],
    ),
  );

  // Listen for upload completed events
  useSocketEvent<'idea_submissions.upload.completed.user'>(
    'idea_submissions.upload.completed.user',
    useCallback(
      (data) => {
        if (data.submissionLinkUuid === linkUuid) {
          // Show toast outside of state updater to avoid setState during render
          toast.success(
            `Uploaded ${data.ideasExtracted} idea${data.ideasExtracted !== 1 ? 's' : ''} successfully`,
          );

          setUploadProgress((prev) => ({
            ...prev,
            isActive: false,
            stage: 'completed',
            message: `Successfully extracted ${data.ideasExtracted} ideas!`,
            progress: 100,
            ideasExtracted: data.ideasExtracted,
          }));

          // Invalidate queries to refresh submission list
          queryClient.invalidateQueries({
            queryKey: ['submissionLinkSubmissions', linkUuid],
          });
          queryClient.invalidateQueries({
            queryKey: ['submissionLink', linkUuid],
          });

          // Auto-dismiss after delay
          setTimeout(() => {
            setUploadProgress((prev) => ({
              ...prev,
              isActive: false,
              stage: '',
            }));
          }, 5000);
        }
      },
      [linkUuid, queryClient],
    ),
  );

  // Listen for upload error events
  useSocketEvent<'idea_submissions.upload.error.user'>(
    'idea_submissions.upload.error.user',
    useCallback(
      (data) => {
        if (data.submissionLinkUuid === linkUuid) {
          setUploadProgress((prev) => ({
            ...prev,
            isActive: false,
            stage: 'error',
            message: data.errorMessage,
            error: data.errorMessage,
            progress: 0,
          }));

          toast.error(data.errorMessage || 'File upload failed');

          // Auto-dismiss after delay
          setTimeout(() => {
            setUploadProgress((prev) => ({
              ...prev,
              isActive: false,
              stage: '',
            }));
          }, 5000);
        }
      },
      [linkUuid],
    ),
  );

  // Listen for bulk rescore completed events to refresh submission data
  useSocketEvent<'idea_submissions.bulk_rescore.completed.user'>(
    'idea_submissions.bulk_rescore.completed.user',
    useCallback(
      (data) => {
        // Refresh if this event is for our link or is account-wide (no link specified)
        if (!data.submissionLinkUuid || data.submissionLinkUuid === linkUuid) {
          queryClient.invalidateQueries({
            queryKey: ['submissionLinkSubmissions', linkUuid],
          });
          queryClient.invalidateQueries({
            queryKey: ['submissionLink', linkUuid],
          });

          const msg =
            data.errorCount > 0
              ? `Re-scored ${data.successCount} of ${data.total} submissions (${data.errorCount} failed)`
              : `Successfully re-scored ${data.successCount} submission${data.successCount !== 1 ? 's' : ''}`;
          toast.success(msg);
        }
      },
      [linkUuid, queryClient],
    ),
  );

  // Fetch submission link details
  const {
    submissionLink: link,
    isLoading: isLoadingLink,
    error: linkError,
  } = useSubmissionLink(linkUuid || null);

  const isMissingLink = !isLoadingLink && !linkError && link === null;

  useEffect(() => {
    if (isMissingLink) {
      navigate(AppPath.ConceptBankSubmissions, { replace: true });
    }
  }, [isMissingLink, navigate]);

  // Fetch submissions for this link with filters (includes scoring metadata)
  const {
    submissions,
    metadata,
    isLoading: isLoadingSubmissions,
    error: submissionsError,
  } = useSubmissionLinkSubmissions(linkUuid || null, filterState);

  // Get scoring questions from the submissions endpoint metadata
  const scoringQuestions = useMemo(
    () => metadata?.scoringQuestions ?? [],
    [metadata],
  );

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      api.ideaSubmissions.updateSubmissionLink(linkUuid!, {
        is_active: isActive,
      }),
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: ['submissionLink', linkUuid] });
      queryClient.invalidateQueries({ queryKey: ['submissionLinks'] });
      toast.success(
        isActive
          ? 'Link is now collecting submissions'
          : 'Link stopped collecting submissions',
      );
    },
    onError: () => {
      toast.error('Failed to update link status');
    },
  });

  // Calculate duplicate counts, groups, and primary UUIDs per submission
  // The "primary" is the one with highest score in each group
  const { duplicateCounts, duplicateGroups, primarySubmissionUuids } =
    useMemo(() => {
      const counts = new Map<string, number>();
      const groups = new Map<string, IIdeaSubmission[]>();
      const primaryUuids = new Set<string>();
      if (!submissions)
        return {
          duplicateCounts: counts,
          duplicateGroups: groups,
          primarySubmissionUuids: primaryUuids,
        };

      // Group submissions by duplicateGroupId
      const groupsByDuplicateId = new Map<string, IIdeaSubmission[]>();
      submissions.forEach((s) => {
        if (s.duplicateGroupId) {
          const existing = groupsByDuplicateId.get(s.duplicateGroupId) || [];
          existing.push(s);
          groupsByDuplicateId.set(s.duplicateGroupId, existing);
        }
      });

      // For each group, sort by highest score and treat the first as "primary"
      groupsByDuplicateId.forEach((group) => {
        // Sort group by highest totalScore first
        const sortedGroup = [...group].sort(
          (a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0),
        );
        // The first one (highest score) is the "primary"
        const primary = sortedGroup[0];
        // The rest are duplicates
        const duplicates = sortedGroup.slice(1);

        counts.set(primary.uuid, duplicates.length);
        groups.set(primary.uuid, duplicates);
        primaryUuids.add(primary.uuid);
      });

      return {
        duplicateCounts: counts,
        duplicateGroups: groups,
        primarySubmissionUuids: primaryUuids,
      };
    }, [submissions]);

  // Filter submissions by selected theme
  // Only show primary submissions from duplicate groups (non-primaries are shown when expanded)
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    let filtered = submissions;

    // Filter by theme if selected
    if (selectedTheme) {
      filtered = filtered.filter((s) => s.theme === selectedTheme);
    }

    // Filter out non-primary duplicates (they'll be shown in expanded view)
    // A submission is shown if:
    // 1. It has no duplicateGroupId (standalone), OR
    // 2. It is the primary (highest score) of its duplicate group
    filtered = filtered.filter(
      (s) => !s.duplicateGroupId || primarySubmissionUuids.has(s.uuid),
    );

    return filtered;
  }, [submissions, selectedTheme, primarySubmissionUuids]);

  // Generate full URL for the link (display version)
  const getFullUrl = (linkData: ISubmissionLink) => {
    const accountSlug = account?.namespace || account?.uuid || '';
    return `${accountSlug}.aucctus.com/${linkData.slug}`;
  };

  const accountSlug = account?.namespace || account?.uuid || '';

  // Copy full URL to clipboard
  const copyLink = () => {
    if (!link) return;
    const fullUrl = `${window.location.origin}/submit/${accountSlug}/${link.slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard');
  };

  // Get the currently selected theme data
  const getSelectedThemeData = (): ISubmissionLinkTheme | null => {
    if (!selectedTheme || !link?.themes) return null;
    return link.themes.find((t) => t.name === selectedTheme) || null;
  };

  // Get theme description text based on selection
  const getThemeDescription = (): string => {
    if (!link?.themes || link.themes.length === 0) {
      return 'No themes have been identified yet. Themes will be generated after submissions are analyzed.';
    }

    if (!selectedTheme) {
      const themeNames = link.themes.map((t) => t.name).join(', ');
      return `During ideation, we observed strong emphasis on ${themeNames} themes. These represent the core focus areas where innovation opportunities were identified.`;
    }

    const themeData = getSelectedThemeData();
    if (!themeData) return '';

    return (
      themeData.description ||
      `Ideas in the ${themeData.name} category focus on related concepts and improvements.`
    );
  };

  // Handle edit modal close
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  // Handle edit modal success
  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['submissionLink', linkUuid] });
    queryClient.invalidateQueries({ queryKey: ['submissionLinks'] });
    setIsEditModalOpen(false);
  };

  // Toggle selection for a submission
  const toggleSelection = (uuid: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid);
    } else {
      if (selectionPurpose === 'compare' && newSelected.size >= 5) {
        toast.error('Maximum 5 submissions can be compared');
        return;
      }
      newSelected.add(uuid);
    }
    setSelectedIds(newSelected);
  };

  // Enter selection mode
  const enterSelectionMode = (purpose: 'compare' | 'bulk_edit') => {
    setIsSelectionMode(true);
    setSelectionPurpose(purpose);
    setSelectedIds(new Set());
  };

  // Exit selection mode
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  // Toggle select all filtered submissions
  const toggleSelectAll = useCallback(() => {
    const allUuids = filteredSubmissions.map((s) => s.uuid);
    const allSelected =
      allUuids.length > 0 && allUuids.every((uuid) => selectedIds.has(uuid));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allUuids));
    }
  }, [filteredSubmissions, selectedIds]);

  // Handle expand/collapse duplicate group
  const handleExpandSubmissionGroup = useCallback((submissionId: string) => {
    setExpandedSubmissionId((prev) =>
      prev === submissionId ? null : submissionId,
    );
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<ISubmissionFilterParams>) => {
      setFilterState((prev) => ({
        ...prev,
        ...newFilters,
      }));
    },
    [],
  );

  // Handle submission click (opens drawer modal - US-023)
  const handleSubmissionClick = useCallback(
    (submission: IIdeaSubmission) => {
      openModal(
        Modal.SubmissionDetail,
        {
          submission,
          linkUuid: linkUuid!,
          linkTitle: link?.title,
          onStatusChange: () => {
            queryClient.invalidateQueries({
              queryKey: ['submissionLinkSubmissions', linkUuid],
            });
          },
        },
        {
          position: 'right',
          modalClassName: 'max-h-screen h-screen',
          hideBodyScroll: true,
          shouldCloseOnOverlayClick: true,
          shouldCloseOnEscape: true,
        },
      );
    },
    [openModal, link?.title, queryClient, linkUuid],
  );

  // Loading state
  const isLoading = isLoadingLink || isLoadingSubmissions;

  // Show error if submissions failed to load (logged for debugging)
  if (submissionsError && !isLoadingSubmissions) {
    // Error is handled by react-query, no need to log here
  }

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='flex animate-pulse flex-col items-center gap-4'>
          <div className='aucctus-border-brand h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Loading submission link...
          </p>
        </div>
      </div>
    );
  }

  if (isMissingLink) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='flex animate-pulse flex-col items-center gap-4'>
          <div className='aucctus-border-brand h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='aucctus-text-sm aucctus-text-secondary'>
            Redirecting to submission links...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (linkError || !link) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <div className='aucctus-bg-error-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
            <AlertTriangle className='aucctus-stroke-error-primary h-8 w-8' />
          </div>
          <h3 className='aucctus-text-lg-semibold aucctus-text-primary mb-2'>
            Failed to load submission link
          </h3>
          <p className='aucctus-text-sm aucctus-text-secondary mb-4'>
            The submission link could not be found or you don&apos;t have
            access.
          </p>
          <Link
            to={AppPath.ConceptBankSubmissions}
            className='btn btn-secondary btn-md inline-flex items-center gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Back to Submission Links
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='py-4 md:py-6'>
      {/* Header Card */}
      <motion.div
        className='aucctus-bg-primary aucctus-border-secondary mb-6 overflow-hidden rounded-xl border shadow-sm'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className='flex'>
          {/* Left Border Accent */}
          <div className='border border-l-4 border-l-primary-600' />

          {/* Header Content */}
          <div className='flex-1 p-5'>
            {/* Top Row: Status + Actions */}
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              {/* Status Badge */}
              <div className='flex flex-col gap-1'>
                <span
                  className={cn(
                    'aucctus-text-xs-semibold flex items-center gap-1.5',
                    link.isActive ? 'text-green-600' : 'aucctus-text-tertiary',
                  )}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      link.isActive ? 'bg-green-500' : 'bg-gray-400',
                    )}
                  />
                  {link.isActive ? 'Collecting Submissions' : 'Stopped'}
                </span>
                {/* Title Row: Title + URL */}
                <div className='flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2'>
                  <h1 className='aucctus-text-lg-semibold aucctus-text-primary'>
                    {link.title}
                  </h1>
                  <span className='aucctus-text-tertiary hidden sm:inline'>
                    •
                  </span>
                  <span className='aucctus-text-sm aucctus-text-tertiary font-mono'>
                    {getFullUrl(link)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-wrap items-center gap-2'>
                <button
                  onClick={copyLink}
                  className='aucctus-text-secondary aucctus-border-secondary hover:aucctus-bg-secondary flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors'
                  title='Copy Link'
                >
                  <Copy className='h-4 w-4' />
                  <span className='aucctus-text-sm'>Copy Link</span>
                </button>

                <Link
                  to={`${window.location.origin}/submit/${accountSlug}/${link.slug}`}
                  target='_blank'
                  className='aucctus-text-secondary aucctus-border-secondary hover:aucctus-bg-secondary flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors'
                  title='Preview Form'
                >
                  <Eye className='h-4 w-4' />
                  <span className='aucctus-text-sm'>Preview</span>
                </Link>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className='aucctus-text-secondary aucctus-border-secondary hover:aucctus-bg-secondary flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors'
                  title='Edit Link'
                >
                  <Pencil className='h-4 w-4' />
                  <span className='aucctus-text-sm'>Edit</span>
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className='flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-red-600 transition-colors hover:bg-red-50'
                  title='Delete Link'
                >
                  <Trash2 className='h-4 w-4' />
                  <span className='aucctus-text-sm'>Delete</span>
                </button>

                <button
                  onClick={() => toggleActiveMutation.mutate(!link.isActive)}
                  disabled={toggleActiveMutation.isLoading}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors disabled:opacity-50',
                    link.isActive
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'aucctus-border-success aucctus-text-success-primary hover:aucctus-bg-success-secondary',
                  )}
                  title={link.isActive ? 'Stop Collecting' : 'Start Collecting'}
                >
                  {link.isActive ? (
                    <>
                      <X className='h-4 w-4' />
                      <span className='aucctus-text-sm'>Stop Collecting</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className='h-4 w-4' />
                      <span className='aucctus-text-sm'>Start Collecting</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* File Upload Progress Card */}
      <FileUploadProgressCard
        isVisible={
          uploadProgress.isActive ||
          uploadProgress.stage === 'completed' ||
          uploadProgress.stage === 'error'
        }
        filename={uploadProgress.filename}
        stage={uploadProgress.stage}
        message={uploadProgress.message}
        progress={uploadProgress.progress}
        ideasExtracted={uploadProgress.ideasExtracted}
      />

      {/* Stats Row */}
      <motion.div
        className='mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
        variants={staggerContainer}
        initial='initial'
        animate='animate'
      >
        {/* Total Ideas Submitted */}
        <motion.div
          className='aucctus-bg-primary aucctus-border-secondary flex items-center gap-4 rounded-xl border p-6 shadow-sm'
          variants={fadeInUp}
        >
          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-100'>
            <Lightbulb className='h-6 w-6 stroke-pink-500' />
          </div>
          <div>
            <div className='aucctus-header-md-semibold aucctus-text-primary'>
              {link.submissionCount}
            </div>
            <div className='aucctus-text-sm aucctus-text-tertiary'>
              Total Ideas Submitted
            </div>
          </div>
        </motion.div>

        {/* Grouped Duplicates */}
        <motion.div
          className='aucctus-bg-primary aucctus-border-secondary flex items-center gap-4 rounded-xl border p-6 shadow-sm'
          variants={fadeInUp}
        >
          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100'>
            <Users className='h-6 w-6 stroke-amber-600' />
          </div>
          <div>
            <div className='aucctus-header-md-semibold aucctus-text-primary'>
              {link.duplicateGroupCount}
            </div>
            <div className='aucctus-text-sm aucctus-text-tertiary'>
              Grouped Duplicates
            </div>
          </div>
        </motion.div>

        {/* High-Priority Ideas */}
        <motion.div
          className='aucctus-bg-primary aucctus-border-secondary flex items-center gap-4 rounded-xl border p-6 shadow-sm'
          variants={fadeInUp}
        >
          <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100'>
            <Star className='h-6 w-6 fill-yellow-500 stroke-yellow-500' />
          </div>
          <div>
            <div className='aucctus-header-md-semibold aucctus-text-primary'>
              {link.highPriorityCount}
            </div>
            <div className='aucctus-text-sm aucctus-text-tertiary'>
              High-Priority Ideas
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Major Themes and Analysis Summary Row */}
      <motion.div
        className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {/* Major Themes */}
        <motion.div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6 shadow-sm'>
          <div className='mb-4 flex items-center gap-2'>
            <Target className='h-5 w-5 stroke-gray-500' />
            <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
              Major Themes
            </h2>
          </div>

          {/* Theme Chips */}
          <div className='mb-4 flex flex-wrap gap-2'>
            {/* All Themes Chip */}
            <motion.button
              onClick={() => setSelectedTheme(null)}
              className={cn(
                'aucctus-text-xs-semibold rounded-full border px-4 py-1.5 transition-colors',
                selectedTheme === null
                  ? 'border-black bg-black text-white'
                  : 'aucctus-bg-secondary aucctus-text-secondary aucctus-border-secondary hover:aucctus-text-primary',
              )}
              whileTap={{ scale: 0.95 }}
            >
              All Themes
            </motion.button>

            {/* Dynamic Theme Chips */}
            {link.themes?.map((theme) => (
              <motion.button
                key={theme.name}
                onClick={() => setSelectedTheme(theme.name)}
                className={cn(
                  'aucctus-text-xs-semibold rounded-full border px-4 py-1.5 transition-colors',
                  selectedTheme === theme.name
                    ? 'border-black bg-black text-white'
                    : 'aucctus-bg-secondary aucctus-text-secondary aucctus-border-secondary hover:aucctus-text-primary',
                )}
                whileTap={{ scale: 0.95 }}
              >
                {theme.name}
              </motion.button>
            ))}
          </div>

          {/* Theme Description */}
          <AnimatePresence mode='wait'>
            {selectedTheme ? (
              <motion.div
                key='selected-theme'
                className='aucctus-bg-secondary-subtle border-secondary rounded-lg border bg-opacity-50 p-4'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className='aucctus-text-sm-semibold mb-1 text-violet-900'>
                  {getSelectedThemeData()?.count || 0}{' '}
                  {selectedTheme.toLowerCase()}-focused ideas
                </p>
                <p className='aucctus-text-sm aucctus-text-secondary'>
                  {getThemeDescription()}
                </p>
              </motion.div>
            ) : (
              <motion.p
                key='all-themes'
                className='aucctus-text-sm aucctus-text-secondary'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {getThemeDescription()}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Analysis Summary */}
        <motion.div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6 shadow-sm'>
          <div className='mb-4 flex items-center gap-2'>
            <Sparkles className='h-5 w-5 stroke-gray-500' />
            <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
              Analysis Summary
            </h2>
          </div>

          {/* Insight Bullets */}
          <div className='space-y-3'>
            {link.analysisSummary && link.analysisSummary.length > 0 ? (
              link.analysisSummary.map((insight, index) => {
                // Find headline pattern: colon must appear before any period
                // This ensures we capture "Headline text here:" without breaking
                // on colons inside quotes or citations like "'Product Name' (83 points)"
                const colonIndex = insight.indexOf(':');
                const firstPeriodIndex = insight.indexOf('.');
                const hasHeadline =
                  colonIndex > 0 &&
                  (firstPeriodIndex === -1 || colonIndex < firstPeriodIndex);
                const headline = hasHeadline
                  ? insight.substring(0, colonIndex)
                  : null;
                const detail = hasHeadline
                  ? insight.substring(colonIndex + 1).trim()
                  : insight;

                return (
                  <div key={index} className='flex items-start gap-3'>
                    <span className='mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400' />
                    <p className='aucctus-text-sm aucctus-text-secondary'>
                      {headline && (
                        <span className='aucctus-text-sm-semibold aucctus-text-primary'>
                          {headline}:
                        </span>
                      )}{' '}
                      {detail}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className='aucctus-text-sm aucctus-text-tertiary'>
                No analysis summary available yet. Insights will be generated
                after submissions are analyzed.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Submissions Section */}
      <motion.div
        className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6 shadow-sm'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {/* Section Header */}
        <div className='mb-4 flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Lightbulb className='aucctus-stroke-primary h-5 w-5' />
              <h2 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Submissions
              </h2>
              <span className='aucctus-text-sm aucctus-text-tertiary'>
                {filteredSubmissions.length}
              </span>
            </div>

            <div className='flex items-center gap-3'>
              {/* Selection mode controls */}
              {isSelectionMode ? (
                <div className='flex items-center gap-3'>
                  <button
                    onClick={toggleSelectAll}
                    className='flex items-center gap-2'
                    title={
                      filteredSubmissions.length > 0 &&
                      filteredSubmissions.every((s) => selectedIds.has(s.uuid))
                        ? 'Deselect all'
                        : 'Select all'
                    }
                  >
                    {filteredSubmissions.length > 0 &&
                    filteredSubmissions.every((s) =>
                      selectedIds.has(s.uuid),
                    ) ? (
                      <CheckSquare className='aucctus-stroke-brand-primary h-4 w-4' />
                    ) : selectedIds.size > 0 ? (
                      <MinusSquare className='aucctus-stroke-brand-primary h-4 w-4' />
                    ) : (
                      <Square className='aucctus-stroke-secondary h-4 w-4' />
                    )}
                    <span className='aucctus-text-sm aucctus-text-secondary'>
                      {selectedIds.size} selected
                    </span>
                  </button>
                  {selectionPurpose === 'compare' && selectedIds.size >= 2 && (
                    <button
                      onClick={() => setShowComparisonModal(true)}
                      className='btn btn-primary btn-sm flex items-center gap-2'
                    >
                      <GitCompare className='h-4 w-4' />
                      Compare Selected
                    </button>
                  )}
                  {selectionPurpose === 'bulk_edit' && (
                    <button
                      onClick={() => setShowBulkEditModal(true)}
                      disabled={selectedIds.size === 0}
                      className='btn btn-primary btn-sm flex items-center gap-2'
                    >
                      <Pencil className='h-4 w-4' />
                      Edit Selected
                    </button>
                  )}
                  <button
                    onClick={exitSelectionMode}
                    className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-1 transition-colors'
                  >
                    <X className='h-4 w-4' />
                    <span className='aucctus-text-sm-semibold'>Cancel</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Bulk Edit Button */}
                  {filteredSubmissions.length >= 1 && (
                    <motion.button
                      onClick={() => enterSelectionMode('bulk_edit')}
                      className='aucctus-text-secondary hover:aucctus-text-brand-primary hover:aucctus-bg-brand-secondary flex items-center gap-2 rounded-lg px-3 py-2 transition-colors'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Pencil className='h-4 w-4' />
                      <span className='aucctus-text-sm-semibold'>
                        Bulk Edit
                      </span>
                    </motion.button>
                  )}

                  {/* Compare Button */}
                  {filteredSubmissions.length >= 2 && (
                    <motion.button
                      onClick={() => enterSelectionMode('compare')}
                      className='aucctus-text-secondary hover:aucctus-text-brand-primary hover:aucctus-bg-brand-secondary flex items-center gap-2 rounded-lg px-3 py-2 transition-colors'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <GitCompare className='h-4 w-4' />
                      <span className='aucctus-text-sm-semibold'>Compare</span>
                    </motion.button>
                  )}

                  {/* View Toggle */}
                  <div className='aucctus-bg-secondary flex rounded-lg p-1'>
                    <motion.button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'rounded-md p-2 transition-colors',
                        viewMode === 'grid'
                          ? 'aucctus-bg-primary aucctus-text-brand-primary shadow-sm'
                          : 'aucctus-text-tertiary hover:aucctus-text-secondary',
                      )}
                      title='Grid View'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <LayoutGrid className='h-4 w-4' />
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'rounded-md p-2 transition-colors',
                        viewMode === 'list'
                          ? 'aucctus-bg-primary aucctus-text-brand-primary shadow-sm'
                          : 'aucctus-text-tertiary hover:aucctus-text-secondary',
                      )}
                      title='List View'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <List className='h-4 w-4' />
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Filter Component */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <SubmissionFilter
              filterState={filterState}
              onFilterChange={handleFilterChange}
              scoringQuestions={scoringQuestions}
            />
          </motion.div>
        </div>

        {/* Submissions Content */}
        <AnimatePresence mode='wait'>
          {isLoadingSubmissions ? (
            <motion.div
              key='loading'
              className='py-12 text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className='flex animate-pulse flex-col items-center gap-4'>
                <div className='aucctus-border-brand h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
                <p className='aucctus-text-sm aucctus-text-secondary'>
                  Loading submissions...
                </p>
              </div>
            </motion.div>
          ) : filteredSubmissions.length === 0 ? (
            <motion.div
              key='empty'
              className='py-12 text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className='aucctus-bg-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                <Lightbulb className='aucctus-stroke-tertiary h-8 w-8' />
              </div>
              <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
                {selectedTheme
                  ? `No ${selectedTheme} submissions`
                  : 'No submissions yet'}
              </h3>
              <p className='aucctus-text-sm aucctus-text-secondary'>
                {selectedTheme
                  ? 'Try selecting a different theme or "All Themes".'
                  : 'Share your link to start collecting ideas.'}
              </p>
            </motion.div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <motion.div
              key='grid'
              className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredSubmissions.map((submission) => {
                const duplicates = duplicateGroups.get(submission.uuid) || [];
                const hasDuplicates = duplicates.length > 0;
                const isExpanded = expandedSubmissionId === submission.uuid;

                // If this submission is expanded and has duplicates, render expanded container
                if (isExpanded && hasDuplicates) {
                  return (
                    <div
                      key={submission.uuid}
                      className='aucctus-bg-secondary/30 aucctus-border-brand relative rounded-2xl border-2 border-dashed p-6'
                      style={{
                        paddingBottom: '4rem',
                        gridColumn: `span ${Math.min(duplicates.length + 1, 3)} / span ${Math.min(duplicates.length + 1, 3)}`,
                      }}
                    >
                      <div
                        className='grid grid-cols-1 gap-6'
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(duplicates.length + 1, 3)}, minmax(0, 1fr))`,
                        }}
                      >
                        {/* Primary Card */}
                        <SubmissionCard
                          submission={submission}
                          onClick={() => handleSubmissionClick(submission)}
                          isSelectionMode={isSelectionMode}
                          isSelected={selectedIds.has(submission.uuid)}
                          onToggleSelect={() =>
                            toggleSelection(submission.uuid)
                          }
                          duplicateCount={duplicates.length}
                          onExpandDuplicates={() =>
                            handleExpandSubmissionGroup(submission.uuid)
                          }
                          isExpanded
                        />

                        {/* Duplicate Cards */}
                        {duplicates.map((dup, dupIndex) => (
                          <motion.div
                            key={dup.uuid}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.2,
                              delay: dupIndex * 0.05,
                            }}
                          >
                            <SubmissionCard
                              submission={dup}
                              onClick={() => handleSubmissionClick(dup)}
                              isSelectionMode={isSelectionMode}
                              isSelected={selectedIds.has(dup.uuid)}
                              onToggleSelect={() => toggleSelection(dup.uuid)}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {/* Collapse Button */}
                      <button
                        onClick={() =>
                          handleExpandSubmissionGroup(submission.uuid)
                        }
                        className='aucctus-bg-brand-solid absolute -bottom-4 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white text-white shadow-lg dark:border-gray-900'
                        title='Collapse group'
                      >
                        <ChevronUp className='h-5 w-5' />
                      </button>
                    </div>
                  );
                }

                // Normal card (not expanded or no duplicates)
                return (
                  <motion.div
                    key={submission.uuid}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SubmissionCard
                      submission={submission}
                      onClick={() => handleSubmissionClick(submission)}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedIds.has(submission.uuid)}
                      onToggleSelect={() => toggleSelection(submission.uuid)}
                      duplicateCount={duplicateCounts.get(submission.uuid)}
                      onExpandDuplicates={
                        hasDuplicates
                          ? () => handleExpandSubmissionGroup(submission.uuid)
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            // List View
            <motion.div
              key='list'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SubmissionsListView
                submissions={filteredSubmissions}
                onSubmissionClick={handleSubmissionClick}
                isSelectionMode={isSelectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelection}
                onSelectAll={toggleSelectAll}
                duplicateCounts={duplicateCounts}
                duplicateGroups={duplicateGroups}
                expandedSubmissionId={expandedSubmissionId}
                onExpandSubmission={handleExpandSubmissionGroup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <SubmissionLinkModal
          link={link}
          onClose={handleEditModalClose}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Modal */}
      <DeleteSubmissionLinkModal
        linkUuid={linkUuid!}
        linkTitle={link.title}
        submissionCount={link.submissionCount}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          submissions={filteredSubmissions.filter((s) =>
            selectedIds.has(s.uuid),
          )}
          onClose={() => {
            setShowComparisonModal(false);
            exitSelectionMode();
          }}
        />
      )}

      {/* Bulk Edit Modal */}
      <BulkEditSubmissionsModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedSubmissionUuids={Array.from(selectedIds)}
        onSuccess={exitSelectionMode}
      />
    </div>
  );
};

export default SubmissionLinkDetailPage;
