import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { AucctusQueryKeys } from './query-keys';
import type {
  ISignalQueryOptions,
  ICreateConceptFromSignalPayload,
  IAttachSignalToConceptPayload,
  SignalStatus,
} from '@libs/api/types';

/**
 * Custom hook for fetching the Signal Scanning dashboard data.
 * Returns the complete dashboard with gut check, metrics, signals, opportunities, intelligence, and radar points.
 */
export const useSignalScanningDashboard = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.signalScanningDashboard],
    queryFn: async () => await api.signalScanning.getDashboard(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      // Only show error if it's not a 404 (no data found)
      if (e.response?.status !== 404) {
        const message = utils.osiris.parseFormError(e);
        toast.error(
          'Dashboard Fetch Failed',
          message ||
            'Unable to fetch signal scanning dashboard. Please try again',
        );
      }
    },
  });

  return {
    ...query,
    dashboard: query.data,
    gutCheck: query.data?.gutCheck,
    metrics: query.data?.metrics,
    recentSignals: query.data?.recentSignals || [],
    topOpportunities: query.data?.topOpportunities || [],
    industryIntelligence: query.data?.industryIntelligence || [],
    radarPoints: query.data?.radarPoints || [],
    hasDashboard: !!query.data,
  };
};

/**
 * Custom hook for triggering a signal refresh.
 * Returns a mutation function that triggers background signal scanning.
 */
export const useSignalRefresh = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => await api.signalScanning.refreshSignals(),
    onSuccess: () => {
      toast.success(
        'Signal Refresh Started',
        'Scanning for new signals. This may take a few minutes.',
      );
      // Invalidate after a delay to allow background task to start producing results
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.signalScanningDashboard],
        });
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.signalScanningSignals],
        });
      }, 5000);
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      // Handle special case of refresh already in progress
      if (
        (e.response?.data as { code?: string })?.code === 'refresh_in_progress'
      ) {
        toast.info(
          'Refresh In Progress',
          'A signal refresh is already running. Please wait.',
        );
      } else {
        toast.error(
          'Refresh Failed',
          message || 'Unable to start signal refresh. Please try again',
        );
      }
    },
  });

  return {
    refreshSignals: mutation.mutate,
    isRefreshing: mutation.isLoading,
    refreshError: mutation.error,
    refreshData: mutation.data,
  };
};

/**
 * Custom hook for fetching a list of signals with optional filtering.
 */
export const useSignals = (options?: ISignalQueryOptions) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.signalScanningSignals, options],
    queryFn: async () => await api.signalScanning.getSignals(options),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // For pagination
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Signals Fetch Failed',
        message || 'Unable to fetch signals. Please try again',
      );
    },
  });

  return {
    ...query,
    signals: query.data?.signals || [],
    totalCount: query.data?.count || 0,
    hasNext: !!query.data?.next,
    hasPrevious: !!query.data?.previous,
  };
};

/**
 * Custom hook for fetching a single signal by UUID.
 */
export const useSignal = (signalUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.signalScanningSignal, signalUuid],
    queryFn: async () =>
      signalUuid ? await api.signalScanning.getSignal(signalUuid) : null,
    enabled: !!signalUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Signal Fetch Failed',
        message || 'Unable to fetch signal. Please try again',
      );
    },
  });

  return {
    ...query,
    signal: query.data,
    hasSignal: !!query.data,
  };
};

/**
 * Custom hook for updating a signal's status.
 */
export const useUpdateSignalStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      signalUuid,
      status,
    }: {
      signalUuid: string;
      status: SignalStatus;
    }) => await api.signalScanning.updateSignalStatus(signalUuid, { status }),
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningSignals],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningSignal, variables.signalUuid],
      });

      const statusLabels: Record<SignalStatus, string> = {
        new: 'New',
        exploring: 'Exploring',
        monitoring: 'Monitoring',
        ignored: 'Ignored',
        actioned: 'Actioned',
      };
      toast.success(
        'Signal Updated',
        `Status changed to ${statusLabels[variables.status]}`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Update Failed',
        message || 'Unable to update signal status. Please try again',
      );
    },
  });

  return {
    updateStatus: mutation.mutate,
    updateStatusAsync: mutation.mutateAsync,
    isUpdating: mutation.isLoading,
    updateError: mutation.error,
  };
};

/**
 * Custom hook for creating a concept from a signal.
 */
export const useCreateConceptFromSignal = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({
      signalUuid,
      data,
    }: {
      signalUuid: string;
      data?: ICreateConceptFromSignalPayload;
    }) => await api.signalScanning.createConceptFromSignal(signalUuid, data),
    onSuccess: (response) => {
      // Invalidate signal queries since status changed to "actioned"
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningSignals],
      });

      toast.success(
        'Concept Created',
        'A new concept has been created from this signal',
      );

      // Navigate to the new concept
      if (response.conceptUuid) {
        navigate(`/concept/${response.conceptUuid}`);
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create concept. Please try again',
      );
    },
  });

  return {
    createConcept: mutation.mutate,
    createConceptAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
    createError: mutation.error,
  };
};

/**
 * Custom hook for attaching a signal to an existing concept.
 */
export const useAttachSignalToConcept = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      signalUuid,
      data,
    }: {
      signalUuid: string;
      data: IAttachSignalToConceptPayload;
    }) => await api.signalScanning.attachSignalToConcept(signalUuid, data),
    onSuccess: () => {
      // Invalidate signal queries since status changed to "actioned"
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningSignals],
      });

      toast.success('Signal Attached', 'Signal has been linked to the concept');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Attach Failed',
        message || 'Unable to attach signal. Please try again',
      );
    },
  });

  return {
    attachSignal: mutation.mutate,
    attachSignalAsync: mutation.mutateAsync,
    isAttaching: mutation.isLoading,
    attachError: mutation.error,
  };
};

/**
 * Custom hook for fetching opportunities.
 */
export const useOpportunities = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.signalScanningOpportunities],
    queryFn: async () => await api.signalScanning.getOpportunities(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Opportunities Fetch Failed',
        message || 'Unable to fetch opportunities. Please try again',
      );
    },
  });

  return {
    ...query,
    opportunities: query.data || [],
    hasOpportunities: (query.data || []).length > 0,
  };
};

/**
 * Custom hook for fetching a single opportunity by UUID.
 */
export const useOpportunity = (opportunityUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.signalScanningOpportunity, opportunityUuid],
    queryFn: async () =>
      opportunityUuid
        ? await api.signalScanning.getOpportunity(opportunityUuid)
        : null,
    enabled: !!opportunityUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Opportunity Fetch Failed',
        message || 'Unable to fetch opportunity. Please try again',
      );
    },
  });

  return {
    ...query,
    opportunity: query.data,
    hasOpportunity: !!query.data,
  };
};

/**
 * Custom hook for creating a concept from an opportunity.
 */
export const useCreateConceptFromOpportunity = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (opportunityUuid: string) =>
      await api.signalScanning.createConceptFromOpportunity(opportunityUuid),
    onSuccess: (response) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningDashboard],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningOpportunities],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.signalScanningSignals],
      });

      toast.success(
        'Concept Created',
        'A new concept has been created from this opportunity',
      );

      // Navigate to the new concept
      if (response.conceptUuid) {
        navigate(`/concept/${response.conceptUuid}`);
      }
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Creation Failed',
        message || 'Unable to create concept. Please try again',
      );
    },
  });

  return {
    createConcept: mutation.mutate,
    createConceptAsync: mutation.mutateAsync,
    isCreating: mutation.isLoading,
    createError: mutation.error,
  };
};

/**
 * Custom hook for fetching intelligence items.
 */
export const useIntelligence = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.signalScanningIntelligence],
    queryFn: async () => await api.signalScanning.getIntelligence(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Intelligence Fetch Failed',
        message || 'Unable to fetch intelligence. Please try again',
      );
    },
  });

  return {
    ...query,
    intelligence: query.data || [],
    hasIntelligence: (query.data || []).length > 0,
  };
};
