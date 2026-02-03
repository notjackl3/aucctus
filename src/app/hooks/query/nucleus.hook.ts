import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AucctusQueryKeys } from './query-keys';

/**
 * Custom hook for fetching the latest nucleus report for the authenticated user's account.
 * Returns the complete nucleus report with all sections, questions, answers, and sources.
 */
export const useNucleusReportLatest = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusReportLatest],
    queryFn: async () => {
      try {
        return await api.nucleus.getLatestReport();
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
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
    isNoReportFound: query.isSuccess && query.data === null,
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
    queryFn: async () => {
      try {
        return await api.nucleus.getLatestReportProgress();
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (websockets provide real-time updates)
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: false, // No polling - websockets provide real-time updates
    refetchOnWindowFocus: true, // Refetch on window focus for fresh data when user returns
    refetchOnMount: true, // Fetch on mount for initial load
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
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
    isNoReportFound: query.isSuccess && query.data === null,
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

/**
 * Custom hook for generating a nucleus headquarters video.
 * Admin only. Triggers the video generation pipeline asynchronously.
 */
export const useGenerateNucleusVideo = () => {
  const { mutate, isLoading, error, isSuccess, reset, data } = useMutation({
    mutationFn: async (params?: {
      image?: File;
      mood?: string;
      duration?: number;
    }) => {
      return await api.nucleus.generateVideo({
        image: params?.image,
        mood: params?.mood as
          | 'professional'
          | 'innovative'
          | 'established'
          | 'modern'
          | undefined,
        duration: params?.duration,
      });
    },
    onSuccess: () => {
      toast.success(
        'Video Generation Started',
        'Your headquarters video is being generated. This may take several minutes.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Check for specific error codes
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'aucctus_admin_required') {
        toast.error(
          'Permission Denied',
          'This feature is restricted to Aucctus administrators.',
        );
      } else {
        toast.error(
          'Video Generation Failed',
          message || 'Unable to start video generation. Please try again.',
        );
      }
    },
  });

  return {
    generateVideo: mutate,
    isGenerating: isLoading,
    error,
    isSuccess,
    taskId: data?.taskId,
    reset,
  };
};

// ============================================
// Nucleus Status & Initialization Hooks
// ============================================

import type {
  NucleusStatus,
  InitializeNucleusRequest,
  DocumentWithUsage,
  DocumentUsage,
  CompanyLookupResponse,
} from '@libs/api/types/nucleus';

/**
 * Custom hook for fetching the Nucleus initialization status.
 * Returns whether Nucleus has been initialized and if it's currently loading.
 */
export const useNucleusStatus = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusStatus],
    queryFn: async () => await api.nucleus.getNucleusStatus(),
    staleTime: 1000 * 30, // 30 seconds - status can change during initialization
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Nucleus Status Fetch Failed',
        message || 'Unable to fetch Nucleus status. Please try again',
      );
    },
  });

  return {
    ...query,
    // Note: query.isLoading is React Query's loading state (true while fetching)
    // nucleusStatus.isLoading is the API response field (true if report is being generated)
    nucleusStatus: query.data as NucleusStatus | undefined,
    isInitialized: query.data?.isInitialized ?? false,
    isNucleusGenerating: query.data?.isLoading ?? false, // Renamed to avoid collision with query.isLoading
    initializationProgress: query.data?.initializationProgress ?? [],
  };
};

/**
 * Parameters for initializing Nucleus with optional files.
 */
interface InitializeNucleusParams {
  data: InitializeNucleusRequest;
  files?: File[];
  headquartersImage?: File;
}

/**
 * Custom hook for initializing Nucleus.
 * Admin only. Saves company info, context questions, uploads documents, and triggers the Nucleus research pipeline.
 */
export const useInitializeNucleus = () => {
  const { mutate, isLoading, error, isSuccess, reset } = useMutation({
    mutationFn: async ({
      data,
      files,
      headquartersImage,
    }: InitializeNucleusParams) => {
      return await api.nucleus.initializeNucleus(
        data,
        files,
        headquartersImage,
      );
    },
    onSuccess: (_, variables) => {
      const fileCount = variables.files?.length ?? 0;
      const fileMessage =
        fileCount > 0
          ? ` with ${fileCount} document${fileCount > 1 ? 's' : ''}`
          : '';
      toast.success(
        'Initialization Started',
        `Your Nucleus is being initialized${fileMessage}. This may take several minutes.`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'already_initialized') {
        toast.error(
          'Already Initialized',
          'Nucleus has already been initialized for this account.',
        );
      } else if (errorCode === 'admin_required') {
        toast.error('Permission Denied', 'Only admins can initialize Nucleus.');
      } else {
        toast.error(
          'Initialization Failed',
          message || 'Unable to initialize Nucleus. Please try again.',
        );
      }
    },
  });

  return {
    initializeNucleus: mutate,
    isInitializing: isLoading,
    error,
    isSuccess,
    reset,
  };
};

/**
 * Custom hook for looking up company headquarters and website from a company name.
 * Uses AI-powered web search to find company information.
 * Results are ephemeral and not persisted to the database.
 */
export const useCompanyInfoLookup = () => {
  const { mutateAsync, isLoading, error, data, reset } = useMutation({
    mutationFn: async (companyName: string) => {
      return await api.nucleus.lookupCompanyInfo(companyName);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Company Lookup Failed',
        message ||
          'Unable to look up company information. Please enter manually.',
      );
    },
  });

  return {
    lookupCompanyInfo: mutateAsync,
    isLookingUp: isLoading,
    lookupResult: data as CompanyLookupResponse | undefined,
    error,
    reset,
  };
};

/**
 * Custom hook for fetching all uploaded documents with category usage.
 * Returns documents from the latest nucleus report with which categories use each document.
 */
export const useNucleusDocuments = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusDocuments],
    queryFn: async () => {
      try {
        return await api.nucleus.getDocuments();
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no reports found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Documents Fetch Failed',
          message || 'Unable to fetch documents. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    documents: (query.data as DocumentWithUsage[] | undefined) ?? [],
    hasDocuments:
      ((query.data as DocumentWithUsage[] | undefined) ?? []).length > 0,
    isNoReportFound: query.isSuccess && query.data === null,
  };
};

/**
 * Custom hook for fetching usage/cascade information for a document.
 * Returns which categories and how many sources would be affected by deletion.
 */
export const useNucleusDocumentUsage = (documentUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.nucleusDocumentUsage, documentUuid],
    queryFn: async () =>
      documentUuid ? await api.nucleus.getDocumentUsage(documentUuid) : null,
    enabled: !!documentUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Document Usage Fetch Failed',
        message || 'Unable to fetch document usage. Please try again',
      );
    },
  });

  return {
    ...query,
    documentUsage: query.data as DocumentUsage | null,
    categories: (query.data as DocumentUsage | null)?.categories ?? [],
    totalSourcesAffected:
      (query.data as DocumentUsage | null)?.totalSourcesAffected ?? 0,
  };
};

/**
 * Custom hook for deleting a document and all associated answer sources.
 * Admin only. Returns usage info showing what was deleted.
 * Invalidates the nucleus report query to refresh answers after deletion.
 */
export const useDeleteNucleusDocument = () => {
  const queryClient = useQueryClient();

  const { mutate, isLoading, error, isSuccess, reset, data } = useMutation({
    mutationFn: async (documentUuid: string) => {
      return await api.nucleus.deleteDocument(documentUuid);
    },
    onSuccess: (result) => {
      toast.success(
        'Document Deleted',
        `Successfully deleted document and ${result?.totalSourcesAffected ?? 0} associated sources`,
      );
      // Invalidate nucleus report to refresh answers that may have been deleted
      queryClient.invalidateQueries([AucctusQueryKeys.nucleusReportLatest]);
      // Also invalidate documents list
      queryClient.invalidateQueries([AucctusQueryKeys.nucleusDocuments]);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      const errorCode = (e.response?.data as { code?: string })?.code;
      if (errorCode === 'admin_required') {
        toast.error('Permission Denied', 'Only admins can delete documents.');
      } else {
        toast.error(
          'Delete Failed',
          message || 'Unable to delete document. Please try again.',
        );
      }
    },
  });

  return {
    deleteDocument: mutate,
    isDeleting: isLoading,
    error,
    isSuccess,
    deletedDocumentUsage: data as DocumentUsage | undefined,
    reset,
  };
};

export { useNucleusReportLatestProgress };
