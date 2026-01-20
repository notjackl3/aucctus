import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery, useMutation } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

/**
 * Custom hook for fetching the latest nucleus report for the authenticated user's account.
 * Returns the complete nucleus report with all sections, questions, answers, and sources.
 */
export const useNucleusReportLatest = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReportLatest],
    queryFn: async () => await api.nucleus.getLatestReport(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no reports found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Nucleus Report Fetch Failed',
          message || 'Unable to fetch nucleus report. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    nucleusReport: query.data,
    hasNucleusReport: !!query.data,
    isNoReportFound:
      query.error && (query.error as AxiosError)?.response?.status === 404,
  };
};

/**
 * Custom hook for fetching a list of nucleus reports for the authenticated user's account.
 * Returns simplified report data for overview/summary views.
 */
export const useNucleusReportsList = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReportsList],
    queryFn: async () => await api.nucleus.getReportsList(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Reports List Fetch Failed',
        message || 'Unable to fetch nucleus reports list. Please try again',
      );
    },
  });

  return {
    ...query,
    nucleusReports: query.data || [],
    hasReports: (query.data || []).length > 0,
  };
};

/**
 * Custom hook for fetching a specific nucleus report by UUID.
 * Returns the complete nucleus report with all related data.
 */
export const useNucleusReport = (reportUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReport, reportUuid],
    queryFn: async () =>
      reportUuid ? await api.nucleus.getReportByUuid(reportUuid) : null,
    enabled: !!reportUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Nucleus Report Fetch Failed',
        message || 'Unable to fetch nucleus report. Please try again',
      );
    },
  });

  return {
    ...query,
    nucleusReport: query.data,
    hasNucleusReport: !!query.data,
  };
};

/**
 * Custom hook for uploading documents to a nucleus report.
 * Returns a mutation function for uploading files with progress and error handling.
 */
export const useNucleusDocumentUpload = () => {
  const { mutate, isLoading, error, isSuccess, reset } = useMutation({
    mutationFn: async ({
      reportUuid,
      files,
    }: {
      reportUuid: string;
      files: File[];
    }) => {
      if (!reportUuid) {
        throw new Error('Report UUID is required');
      }
      if (!files || files.length === 0) {
        throw new Error('At least one file is required');
      }

      // Validate file types (PDF, TXT)
      const allowedTypes = ['application/pdf', 'text/plain'];

      const invalidFiles = files.filter(
        (file) => !allowedTypes.includes(file.type),
      );
      if (invalidFiles.length > 0) {
        throw new Error(
          `Invalid file types: ${invalidFiles.map((f) => f.name).join(', ')}. Only PDF and TXT files are allowed.`,
        );
      }

      // Validate file sizes (max 10MB per file)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = files.filter((file) => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        throw new Error(
          `Files too large: ${oversizedFiles.map((f) => f.name).join(', ')}. Maximum size is 10MB per file.`,
        );
      }

      return await api.nucleus.uploadDocuments(reportUuid, files);
    },
    onSuccess: (data, variables) => {
      toast.success(
        'Documents Uploaded',
        `Successfully uploaded ${variables.files.length} document${variables.files.length > 1 ? 's' : ''} for processing`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Document Upload Failed',
        message || 'Unable to upload documents. Please try again',
      );
    },
  });

  return {
    uploadDocuments: mutate,
    isUploading: isLoading,
    uploadError: error,
    isUploadSuccess: isSuccess,
    resetUpload: reset,
  };
};

const useNucleusReportLatestProgress = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReportLatest, 'progress'],
    queryFn: async () => await api.nucleus.getLatestReportProgress(),
    staleTime: 1000 * 60 * 5, // 5 minutes (websockets provide real-time updates)
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: false, // No polling - websockets provide real-time updates
    refetchOnWindowFocus: true, // Refetch on window focus for fresh data when user returns
    refetchOnMount: true, // Fetch on mount for initial load
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no reports found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Nucleus Report Progress Fetch Failed',
          message ||
            'Unable to fetch nucleus report progress. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    nucleusReportProgress: query.data,
    hasProgress: !!query.data,
    overallProgressPercent: query.data?.overallProgressPercent ?? 0,
    totalSections: query.data?.totalSections ?? 0,
    sectionsPhase1Complete: query.data?.sectionsPhase1Complete ?? 0,
    sectionsPhase2Complete: query.data?.sectionsPhase2Complete ?? 0,
    sectionsPhase3Complete: query.data?.sectionsPhase3Complete ?? 0,
    totalQuestions: query.data?.totalQuestions ?? 0,
    totalQuestionsWithAnswers: query.data?.totalQuestionsWithAnswers ?? 0,
    totalQuestionsValidated: query.data?.totalQuestionsValidated ?? 0,
    sections: query.data?.sections ?? {},
    isNoReportFound:
      query.error && (query.error as AxiosError)?.response?.status === 404,
  };
};

/**
 * Custom hook for requesting email notification when nucleus report is ready.
 * Sends a POST request to mark user as wanting to be notified.
 */
export const useNucleusReportEmailWhenReady = () => {
  const { mutate, isLoading, error, isSuccess, reset } = useMutation({
    mutationFn: async (reportUuid: string) => {
      if (!reportUuid) {
        throw new Error('Report UUID is required');
      }
      return await api.nucleus.emailWhenReady(reportUuid);
    },
    onSuccess: () => {
      toast.success(
        'Notification Enabled',
        'You will be notified when the report is ready',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Notification Setup Failed',
        message || 'Unable to set up email notification. Please try again',
      );
    },
  });

  return {
    emailWhenReady: mutate,
    isLoading,
    error,
    isSuccess,
    reset,
  };
};

/**
 * Custom hook for generating a new nucleus report.
 * Admin only. Triggers the nucleus generation pipeline asynchronously.
 */
export const useGenerateNucleusReport = () => {
  const { mutate, isLoading, error, isSuccess, reset } = useMutation({
    mutationFn: async () => {
      return await api.nucleus.generateReport();
    },
    onSuccess: () => {
      toast.success(
        'Generation Started',
        'Your Nucleus report is being generated. This may take several minutes.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Check for specific error codes
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'generation_in_progress') {
        toast.error(
          'Generation In Progress',
          'A Nucleus report is already being generated. Please wait for it to complete.',
        );
      } else if (errorCode === 'admin_required') {
        toast.error(
          'Permission Denied',
          'Only admins can generate Nucleus reports.',
        );
      } else {
        toast.error(
          'Generation Failed',
          message ||
            'Unable to start Nucleus report generation. Please try again.',
        );
      }
    },
  });

  return {
    generateReport: mutate,
    isGenerating: isLoading,
    error,
    isSuccess,
    reset,
  };
};

export { useNucleusReportLatestProgress };
