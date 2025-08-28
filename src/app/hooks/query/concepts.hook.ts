import { toast } from '@components';
import api from '@libs/api';
import {
  EditConceptReportRequest,
  IncubationAnswerRequest,
  IncubationAnswerUpdateRequest,
} from '@libs/api/concepts';
import {
  IAssumptionLifecycleAddRequest,
  IAssumptionLifecycleUpdateRequest,
  IConcept,
  IConceptQueryOptions,
  IConceptSeed,
  IConceptSeedCreate,
  IConceptSeedUpdate,
  IConversationFilterOptions,
  ICreateRealWorldSignal,
  ICustomerJob,
  ICustomerPain,
  ICustomerProfile,
  ICustomerProfileCreate,
  IFinancialProjection,
  IFormError,
  IGeneratedConcept,
  IMarketScan,
  ISeedQueryOptions,
  ITrendsAndDrivers,
  IUserJourneyStep,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { useGenericConceptMutate } from './helper.hooks';
import { AucctusQueryKeys } from './query-keys';

export type PartialConceptWithRequiredIdentifier = Partial<IConcept> & {
  identifier: string;
};
/**
 * Custom hook for fetching list concepts.
 * @param queryOptions - Options for filtering, sorting, and pagination
 * @returns The result of the useQuery hook.
 */
export const useConcepts = (queryOptions: IConceptQueryOptions) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.concepts,
      queryOptions.status,
      queryOptions.category,
      queryOptions.search,
      queryOptions.createdBy,
      queryOptions.page,
      queryOptions.sort,
    ],
    queryFn: () => api.concept.getConcepts(queryOptions),
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true, // Keep previous data while loading new data
  });
};

/**
 * Custom hook for fetching concept seeds.
 * @param queryOptions - Options for filtering, sorting, and pagination
 * @returns The result of the useQuery hook.
 */
export const useSeeds = (queryOptions: ISeedQueryOptions) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.seeds,
      queryOptions.status,
      queryOptions.search,
      queryOptions.createdBy,
      queryOptions.type,
      queryOptions.page,
      queryOptions.sort,
    ],
    queryFn: () => api.seed.getSeeds(queryOptions),
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true, // Keep previous data while loading new data
  });
};

export const useConceptGeneration = (uuid: string) => {
  return useMutation({
    mutationFn: async (payload?: {
      concepts?: IGeneratedConcept[];
      user_generation_instructions?: string;
    }) => await api.concept.generateConcept(uuid, payload),
    onSuccess: () => {},
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Concept generation failed. Please try again.');
    },
  });
};

export const useConceptAiEditing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditConceptReportRequest) =>
      await api.concept.aiEditConcept(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.concepts] });
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Concept edit request failed. Please try again.');
    },
  });
};

export const useGenerateKeyAssumptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.concept.generateKeyAssumptions(conceptIdentifier),
    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
      toast.warning(
        'Key assumptions and tests generation started',
        'This may take up to 10 minutes. You can navigate away.',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Key assumptions generation failed. Please try again.',
      );
    },
  });
};

export const useGenerateCustomerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.concept.generateCustomerProfile(conceptIdentifier),
    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
      toast.warning(
        'Customer profile generation started',
        'This may take up to 10 minutes. You can navigate away.',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Customer profile generation failed. Please try again.',
      );
    },
  });
};

export const useGenerateMarketScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.concept.generateMarketScan(conceptIdentifier),
    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
      toast.warning(
        'Market scan generation started',
        'This may take up to 10 minutes. You can navigate away.',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Market scan generation failed. Please try again.',
      );
    },
  });
};

export const useSeed = (uuid?: string, options?: ISeedQueryOptions) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptSeedDraft, uuid],
    queryFn: async () => (uuid ? await api.seed.getSeed(uuid, options) : null),
  });

  return {
    ...query,
    seedDraft: query.data,
  };
};

export const useSaveSeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: IConceptSeedCreate) => await api.seed.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useDeleteSeed = (options?: ISeedQueryOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) =>
      await api.seed.deleteSeed(uuid, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useCloneSeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (seedUuid: string) => await api.seed.cloneSeed(seedUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.dashboard] });
    },
  });
};

export const useGetConceptSeedDraftAnswers = (seedDraftUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.conceptSeedDraftAnswers, seedDraftUuid],
    queryFn: async () => {
      if (!seedDraftUuid) return [];
      return await api.concept.getSeedDraftAnswers(seedDraftUuid);
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
};

export const useSaveConceptSeedDraftAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      uuid: string;
      body: IncubationAnswerRequest;
    }) => await api.concept.saveSeedDraftAnswer(params.uuid, params.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useUpdateConceptSeedDraftAnswer = () => {
  return useMutation({
    mutationFn: async (params: {
      answerId: number;
      body: IncubationAnswerUpdateRequest;
    }) => await api.concept.updateSeedDraftAnswer(params.answerId, params.body),
  });
};

export const useUpdateConceptSeedDraftAnswerAndDeleteHigherOrderAnswers =
  () => {
    return useMutation({
      mutationFn: async (params: {
        answerId: number;
        body: IncubationAnswerUpdateRequest;
      }) =>
        await api.concept.updateSeedDraftAnswerAndDeleteHigherOrderAnswers(
          params.answerId,
          params.body,
        ),
    });
  };

export const useDeleteConceptSeedDraftAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerId: number) =>
      await api.concept.deleteSeedDraftAnswer(answerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useGenerateConceptIncubationClarifyingQuestions = () => {
  return useMutation({
    mutationFn: async (params: { seedUuid: string; conceptUuid?: string }) =>
      await api.conceptIncubate.generateClarifyingQuestions(
        params.seedUuid,
        params.conceptUuid,
      ),
  });
};

export const useConceptIncubationQuestionnaire = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptIgnitionQuestionnaire],
    cacheTime: Infinity,
    staleTime: Infinity,
    queryFn: async () => await api.conceptIncubate.questionnaire(),
  });

  return {
    ...query,

    questionnaires: query.data || {
      expandAnExistingIdea: {
        name: '',
        type: '',
        description: '',
        questions: undefined,
      },
      identifyNewOpportunities: {
        name: '',
        type: '',
        description: '',
        questions: undefined,
      },
    },
  };
};

/**
 * Custom hook for fetching a concept by UUID.
 * @param uuid - The UUID of the concept to fetch.
 * @returns An object containing the query result and the concept data.
 */
export const useConcept = (identifier?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.concept, identifier],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () =>
      identifier ? await api.concept.getConcept(identifier) : void 0,
    enabled: !!identifier,
  });

  return { ...query, concept: query.data };
};

export const useDownloadConcept = (uuid?: string) => {
  const query = useQuery({
    queryFn: async () =>
      uuid ? await api.concept.downloadConcept(uuid) : void 0,
    enabled: !!uuid,
    cacheTime: 0, // disable caching
  });

  return { ...query, concept: query.data };
};

/**
 * Custom hook for saving generated concepts.
 *
 * @returns {MutationFunction} The mutation function for saving generated concepts.
 */
export const useSaveGeneratedConcepts = (seedUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: IGeneratedConcept[]) => {
      return api.conceptIncubate.saveGeneratedConcept(seedUuid, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.concepts] });
    },
    onError: () => {
      toast.error('Concepts could not be saved. Please try again later.');
    },
  });
};

/**
 * Custom hook for fetching a concept market scan by their Concept UUID.
 * @param uuid - The UUID of the concept.
 * @returns An object containing the query result and the concept market scan data.
 */
export const useConceptMarketScan = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketScan, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.marketScan.getMarketScan(uuid),
    enabled: !!uuid,
  });

  return { ...query, marketScan: query.data };
};

/**
 * Custom hook for fetching market scan trends V3 by concept UUID.
 * @param uuid - The UUID of the concept.
 * @returns An object containing the query result and the trends data.
 */
export const useMarketScanTrendsV3 = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketScanTrendsV3, uuid],
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => await api.marketScan.getMarketScanTrendsV3(uuid),
    enabled: !!uuid,
  });

  return { ...query, trends: query.data || [] };
};

/**
 * Custom hook for fetching market scan priority insights V3 by concept UUID.
 * @param uuid - The UUID of the concept.
 * @returns An object containing the query result and the priority insights data.
 */
export const useMarketScanPriorityInsightsV3 = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketScanPriorityInsightsV3, uuid],
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () =>
      await api.marketScan.getMarketScanPriorityInsightsV3(uuid),
    enabled: !!uuid,
  });

  return { ...query, priorityInsights: query.data || [] };
};

/**
 * Custom hook for fetching market scan market forces V3 by concept UUID.
 * @param uuid - The UUID of the concept.
 * @returns An object containing the query result and the market forces data.
 */
export const useMarketScanMarketForcesV3 = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketScanMarketForcesV3, uuid],
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => await api.marketScan.getMarketScanMarketForcesV3(uuid),
    enabled: !!uuid,
  });

  return { ...query, marketForces: query.data || [] };
};

export const useConceptCustomerProfiles = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.customerProfiles, uuid],
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => await api.concept.getConceptCustomerProfiles(uuid),
    enabled: !!uuid,
  });

  return { ...query, profiles: query.data?.results || [] };
};

export const useConceptCustomerProfileConversationMessages = (
  profileUuid?: string,
  sessionId?: string,
  enabled?: boolean,
) => {
  const isEnabled =
    enabled !== undefined ? enabled : !!profileUuid && !!sessionId;

  const query = useQuery({
    queryKey: [
      AucctusQueryKeys.customerProfileConversation,
      profileUuid,
      sessionId,
    ],
    staleTime: 0,
    queryFn: async () => {
      if (!profileUuid || !sessionId) return null;
      return await api.concept.getConceptCustomerProfileConversationMessages(
        profileUuid,
        sessionId,
      );
    },
    enabled: isEnabled,
  });

  return { ...query, conversation: query.data };
};

export const useConceptCustomerProfileConversationList = (
  profileUuid: string,
  filterOptions?: IConversationFilterOptions,
) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.customerProfileConversationSearch,
      profileUuid,
      filterOptions?.message,
      filterOptions?.page,
    ],
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => {
      return await api.concept.getCustomerProfileConversationList(
        profileUuid,
        filterOptions,
      );
    },
    onError: (e: AxiosError) => {
      if (e.response?.status === 404) {
        return; // Don't show error toast for 404 responses
      }
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to search conversation. Please try again.',
      );
    },
  });
};

export const useConceptCustomerProfile = (profileUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.customerProfile, profileUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.concept.getConceptCustomerProfile(profileUuid),
    enabled: !!profileUuid,
  });

  return { ...query, profile: query.data };
};

export const useCustomerProfileRealWorldSignals = (profileUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.customerProfileRealWorldSignals, profileUuid],
    queryFn: async () =>
      await api.concept.getConceptCustomerProfileRealWorldSignals(profileUuid),
    enabled: !!profileUuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return { ...query, signalsResponse: query.data };
};

export const useCustomerProfileRealWorldSignal = (
  profileUuid: string,
  signalUuid: string,
) => {
  const query = useQuery({
    queryKey: [
      AucctusQueryKeys.customerProfileRealWorldSignal,
      profileUuid,
      signalUuid,
    ],
    queryFn: async () =>
      await api.concept.getConceptCustomerProfileRealWorldSignalUuid(
        profileUuid,
        signalUuid,
      ),
    enabled: !!profileUuid && !!signalUuid,
  });

  return { ...query, signal: query.data };
};

export const useCustomerProfileRealWorldSignalCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      profileUuid: string;
      signal: ICreateRealWorldSignal;
    }) => {
      const { profileUuid, signal } = params;
      return await api.concept.createConceptCustomerProfileRealWorldSignal(
        profileUuid,
        signal,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfileRealWorldSignals,
          variables.profileUuid,
        ],
      });
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message ||
          'Failed to create real world signal. Please try again later.',
      );
    },
  });
};

export const useCustomerProfileRealWorldSignalUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      profileUuid: string;
      signalUuid: string;
      signal: Partial<ICreateRealWorldSignal>;
    }) => {
      const { profileUuid, signalUuid, signal } = params;
      return await api.concept.updateConceptCustomerProfileRealWorldSignal(
        profileUuid,
        signalUuid,
        signal,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfileRealWorldSignals,
          variables.profileUuid,
        ],
      });
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message ||
          'Failed to update real world signal. Please try again later.',
      );
    },
  });
};

export const useCustomerProfileRealWorldSignalDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { profileUuid: string; signalUuid: string }) => {
      const { profileUuid, signalUuid } = params;
      return await api.concept.deleteConceptCustomerProfileRealWorldSignal(
        profileUuid,
        signalUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfileRealWorldSignals,
          variables.profileUuid,
        ],
      });
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message ||
          'Failed to delete real world signal. Please try again later.',
      );
    },
  });
};

export const useFinancialProjection = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.financialProjection, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptFinancialProjection(uuid),
    enabled: !!uuid,
  });

  return { ...query, financialProjection: query.data };
};

/**
 * Creates a mutation function for updating a concept.
 *
 * @param conceptUuid - The UUID of the concept to update.
 * @returns A mutation function that can be used to update the concept.
 */
const createConceptMutation = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const queryClient = useQueryClient();

  // Helper function to create mutations with common onSuccess and onError callbacks
  return <
    TData extends IConcept = IConcept,
    TError = IFormError<IConcept>,
    TVariables = unknown,
  >(
    mutationFn: (variables: TVariables) => Promise<TData>,
  ) => {
    return useMutation<TData, AxiosError<TError>, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.userDetails],
          }),
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concepts],
          }),
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.dashboard],
          }),
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concept, data.identifier],
          }),
        ]);
      },
      onError: (e) => {
        const message = utils.osiris.parseFormError(e);
        toast.error(message);
      },
    });
  };
};

/**
 * Custom hook for updating a concept.
 * @returns The result of the useMutation hook.
 */
export const useConceptUpdate = () => {
  return createConceptMutation()<
    IConcept,
    IFormError<IConcept>,
    PartialConceptWithRequiredIdentifier
  >(
    async (concept) =>
      await api.concept.updateConcept(concept, concept.identifier),
  );
};

/**
 * Custom hook for updating a concept.
 * @returns The result of the useMutation hook.
 */
export const useUnarchiveConcept = () => {
  return createConceptMutation()<IConcept, IFormError<IConcept>, string>(
    async (conceptUuid) => await api.concept.unarchive(conceptUuid),
  );
};

/**
 * Custom hook for retrying a concept report.
 * @returns The result of the useMutation hook.
 */
export const useRetryConceptReport = () => {
  return createConceptMutation()<IConcept, IFormError<IConcept>, string>(
    async (conceptUuid: string) => await api.concept.retryReport(conceptUuid),
  );
};

/**
 * Custom hook for generating a concept report.
 * @returns The result of the useMutation hook.
 */
export const useConceptReportGenerate = () => {
  return createConceptMutation()<IConcept, IFormError<IConcept>, string>(
    async (conceptUuid: string) =>
      await api.concept.generateReport(conceptUuid),
  );
};

export const useConceptReportCancel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptUuid: string) =>
      await api.concept.cancelReport(conceptUuid),
    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
      toast.success('Report generation cancelled successfully');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to cancel report generation');
    },
  });
};

/**
 * Custom hook for updating the concept market scan.
 *
 * @param uuid - The UUID of the concept.
 * @returns The result of the generic concept update.
 */
export const useMarketScanUpdate = (conceptUuid: string) => {
  return useGenericConceptMutate<IMarketScan>(
    (data) => api.concept.updateConceptMarketScan(data.uuid, data),
    [[AucctusQueryKeys.marketScan, conceptUuid]],
  );
};

export const useCustomerProfileUpdate = (
  profileUuid: string,
  conceptUuid?: string,
) => {
  const conceptProfileListQueryKey = conceptUuid
    ? [AucctusQueryKeys.customerProfiles, conceptUuid]
    : [AucctusQueryKeys.customerProfiles];
  const queryKeys = [
    conceptProfileListQueryKey,
    [AucctusQueryKeys.customerProfile, profileUuid],
  ];
  return useGenericConceptMutate<ICustomerProfile>(
    (data) => api.concept.updateConceptCustomerProfile(data.uuid, data),
    queryKeys,
  );
};

export const useCustomerProfileCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<ICustomerProfile, ICustomerProfileCreate>(
    (data) => api.concept.createConceptCustomerProfile(conceptUuid, data),
    [[AucctusQueryKeys.customerProfiles, conceptUuid]],
  );
};

export function useDeleteCustomerProfile() {
  return useGenericConceptMutate<ICustomerProfile, string>(
    (uuid) => api.concept.deleteConceptCustomerProfile(uuid),
    [[AucctusQueryKeys.customerProfiles]],
  );
}

export const useFinancialProjectionUpdate = (uuid: string) => {
  return useGenericConceptMutate<IFinancialProjection>(
    (data) => api.concept.updateConceptFinancialProjection(data.uuid, data),
    [[AucctusQueryKeys.financialProjection, uuid]],
  );
};

// /**
//  * Custom hook for updating a market metric size.
//  *
//  * @param uuid - The UUID of the Concept.
//  * @returns The result of the generic concept update.
//  */
// export const useMarketMetricSizeUpdate = (uuid: string) => {
//   return useGenericConceptMutate<IMarketSizeMetric>(
//     (data) => api.concept.updateMarketMetricSize(data.uuid, data),
//     [
//       [AucctusQueryKeys.conceptFinancialProjection, uuid],
//       [AucctusQueryKeys.conceptOverview, uuid],
//     ],
//   );
// };

export const doFullConceptInvalidation = (queryClient: QueryClient) => {
  Promise.all([
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.concept],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.conceptVersions],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.marketScan],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfile],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfiles],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfileRealWorldSignals],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.financialProjection],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.concepts],
    }),
  ]);
};

export const useTrendAndDriverUpdate = () => {
  return useGenericConceptMutate<ITrendsAndDrivers>(
    (data) => api.concept.updateTrendAndDriver(data.uuid, data),
    [[AucctusQueryKeys.marketScan]],
  );
};

export const useTrendAndDriverDelete = () => {
  return useGenericConceptMutate<ITrendsAndDrivers, string>(
    (uuid) => api.concept.deleteTrendAndDriver(uuid),
    [[AucctusQueryKeys.marketScan]],
  );
};

/**
 * Custom hook for updating a concept seed.
 * @returns The result of the useMutation hook.
 */
export const useSeedUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation<
    IConceptSeedUpdate,
    AxiosError<IFormError<IConceptSeed>>,
    Partial<IConceptSeed> & { uuid: string }
  >({
    mutationFn: async (seed) => await api.seed.update(seed.uuid, seed),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.seeds],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.dashboard],
        }),
        queryClient.invalidateQueries({
          queryKey: [AucctusQueryKeys.conceptSeed],
        }),
      ]);
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message);
    },
  });
};

/**
 * Custom hook for saving a concept version.
 * @returns The result of the useMutation hook.
 */
export const useSaveConceptVersion = () => {
  return useMutation({
    mutationFn: async (uuid: string) =>
      await api.concept.saveConceptVersion(uuid),
    onSuccess: () => {
      toast.success('Concept version saved successfully');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to save concept version');
    },
  });
};

/**
 * Custom hook for fetching concept versions.
 * @param uuid - The UUID of the concept.
 * @returns The result of the useQuery hook.
 */
export const useConceptVersions = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptVersions, uuid],
    queryFn: async () =>
      uuid ? await api.concept.getConceptVersions(uuid) : undefined,
    enabled: !!uuid,
    staleTime: 0,
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    ...query,
    versions: query.data || { versions: [], version_count: 0 },
  };
};

/**
 * Custom hook for reverting to a specific concept version.
 * @returns The result of the useMutation hook.
 */
export const useRevertConceptVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      uuid: string;
      payload: { versionId: number };
    }) => await api.concept.revertConceptVersion(params.uuid, params.payload),
    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to view historical version');
    },
  });
};

/**


 * Custom hook for committing a concept version revert.


 * @returns The result of the useMutation hook.


 */

export const useCommitConceptVersionRevert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) =>
      await api.concept.commitConceptVersionRevert(uuid),

    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
      toast.success('Concept version revert committed successfully');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to commit concept version revert');
    },
  });
};

/**
 * Custom hook for canceling a concept version revert.
 * @returns The result of the useMutation hook.
 */

export const useCancelConceptVersionRevert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) =>
      await api.concept.cancelConceptVersionRevert(uuid),
    onSuccess: () => {
      doFullConceptInvalidation(queryClient);
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to cancel concept version revert');
    },
  });
};

/**
 * Customer Jobs API hooks using api.concept methods
 */
export const useCustomerJobsList = (customerProfileUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.customerProfile, customerProfileUuid, 'jobs'],
    queryFn: async () => {
      if (!customerProfileUuid) return [];
      return await api.concept.getCustomerJobs(customerProfileUuid);
    },
    enabled: !!customerProfileUuid,
  });
};

export const useCustomerJob = (
  customerProfileUuid: string,
  jobUuid: string,
) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.customerJob, customerProfileUuid, jobUuid],
    queryFn: async () => {
      if (!customerProfileUuid || !jobUuid) return null;
      return await api.concept.getCustomerJob(customerProfileUuid, jobUuid);
    },
    enabled: !!customerProfileUuid && !!jobUuid,
  });
};

export const useCustomerJobCreate = (customerProfileUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      description: string;
      order?: number;
      icon?: IconVariant;
    }) => {
      return await api.concept.createCustomerJob(customerProfileUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          customerProfileUuid,
          'jobs',
        ],
      });
      toast.success('Job created');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to create job');
    },
  });
};

export const useCustomerJobUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerProfileUuid: string;
      jobUuid: string;
      data: Partial<ICustomerJob>;
    }) => {
      const { customerProfileUuid, jobUuid, data } = params;
      return await api.concept.updateCustomerJob(
        customerProfileUuid,
        jobUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          variables.customerProfileUuid,
          'jobs',
        ],
      });
      toast.success('Job updated');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update job');
    },
  });
};

export const useCustomerJobDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerProfileUuid: string;
      jobUuid: string;
    }) => {
      const { customerProfileUuid, jobUuid } = params;
      return await api.concept.deleteCustomerJob(customerProfileUuid, jobUuid);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          variables.customerProfileUuid,
          'jobs',
        ],
      });
      toast.success('Job deleted');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete job');
    },
  });
};

/**
 * Customer Pains API hooks using api.concept methods
 */
export const useCustomerPainsList = (customerProfileUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.customerProfile, customerProfileUuid, 'pains'],
    queryFn: async () => {
      if (!customerProfileUuid) return [];
      return await api.concept.getCustomerPains(customerProfileUuid);
    },
    enabled: !!customerProfileUuid,
  });
};

export const useCustomerPain = (
  customerProfileUuid: string,
  painUuid: string,
) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.customerPain, customerProfileUuid, painUuid],
    queryFn: async () => {
      if (!customerProfileUuid || !painUuid) return null;
      return await api.concept.getCustomerPain(customerProfileUuid, painUuid);
    },
    enabled: !!customerProfileUuid && !!painUuid,
  });
};

export const useCustomerPainCreate = (customerProfileUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      description: string;
      order?: number;
      icon?: IconVariant;
    }) => {
      return await api.concept.createCustomerPain(customerProfileUuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          customerProfileUuid,
          'pains',
        ],
      });
      toast.success('Pain point created');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to create pain point');
    },
  });
};

export const useCustomerPainUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerProfileUuid: string;
      painUuid: string;
      data: Partial<ICustomerPain>;
    }) => {
      const { customerProfileUuid, painUuid, data } = params;
      return await api.concept.updateCustomerPain(
        customerProfileUuid,
        painUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          variables.customerProfileUuid,
          'pains',
        ],
      });
      toast.success('Pain point updated');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update pain point');
    },
  });
};

export const useCustomerPainDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerProfileUuid: string;
      painUuid: string;
    }) => {
      const { customerProfileUuid, painUuid } = params;
      return await api.concept.deleteCustomerPain(
        customerProfileUuid,
        painUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          variables.customerProfileUuid,
          'pains',
        ],
      });
      toast.success('Pain point deleted');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete pain point');
    },
  });
};

/**
 * Customer Alternatives API hooks
 */
export const useCustomerAlternativesList = (customerProfileUuid: string) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.customerProfile,
      customerProfileUuid,
      'alternatives',
    ],
    queryFn: async () => {
      if (!customerProfileUuid) return [];
      return await api.concept.getCustomerAlternatives(customerProfileUuid);
    },
    enabled: !!customerProfileUuid,
  });
};

/**
 * User Journey Steps API hooks
 */
export const useCustomerJourneyStepsList = (customerProfileUuid: string) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.customerProfile,
      customerProfileUuid,
      'journey-steps',
    ],
    queryFn: async () => {
      if (!customerProfileUuid) return [];
      return await api.concept.getCustomerJourneySteps(customerProfileUuid);
    },
    enabled: !!customerProfileUuid,
  });
};

export const useCustomerJourneyStep = (
  customerProfileUuid: string,
  stepUuid: string,
) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.customerJourneyStep,
      customerProfileUuid,
      stepUuid,
    ],
    queryFn: async () => {
      if (!customerProfileUuid || !stepUuid) return null;
      return await api.concept.getCustomerJourneyStep(
        customerProfileUuid,
        stepUuid,
      );
    },
    enabled: !!customerProfileUuid && !!stepUuid,
  });
};

export const useCustomerJourneyStepCreate = (customerProfileUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      order?: number;
      relationType?: string;
      isProductIntervention?: boolean;
    }) => {
      return await api.concept.createCustomerJourneyStep(
        customerProfileUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          customerProfileUuid,
          'journey-steps',
        ],
      });
      toast.success('Journey step created');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to create journey step');
    },
  });
};

export const useCustomerJourneyStepUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerProfileUuid: string;
      stepUuid: string;
      data: Partial<IUserJourneyStep>;
    }) => {
      const { customerProfileUuid, stepUuid, data } = params;
      return await api.concept.updateCustomerJourneyStep(
        customerProfileUuid,
        stepUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          variables.customerProfileUuid,
          'journey-steps',
        ],
      });
      toast.success('Journey step updated');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update journey step');
    },
  });
};

export const useCustomerJourneyStepDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      customerProfileUuid: string;
      stepUuid: string;
    }) => {
      const { customerProfileUuid, stepUuid } = params;
      return await api.concept.deleteCustomerJourneyStep(
        customerProfileUuid,
        stepUuid,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.customerProfile,
          variables.customerProfileUuid,
          'journey-steps',
        ],
      });
      toast.success('Journey step deleted');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to delete journey step');
    },
  });
};

/**
 * Custom hook for tracking when a user views a concept.
 * @returns The result of the useMutation hook.
 */
export const useTrackConceptView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptUuid: string) =>
      await api.concept.trackConceptView(conceptUuid),
    onSuccess: () => {
      // Invalidate the concepts query to force a refetch when returning to the concept bank
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.concepts] });
    },
    onError: () => {
      // Silent failure - don't show error to user as this is non-critical tracking
      // Error logging handled by API service
    },
  });
};

// V2 Assumption Lifecycle Hooks

/**
 * Custom hook for adding a new assumption to a concept.
 * @returns The result of the useMutation hook.
 */
export const useAssumptionAdd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      rootIdentifier: string;
      data: IAssumptionLifecycleAddRequest;
    }) => {
      const { rootIdentifier, data } = params;
      return await api.assumption.addAssumption(rootIdentifier, data);
    },
    onSuccess: (_data, variables) => {
      // Invalidate assumptions queries to force a refetch
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.assumptions,
          'filtered',
          variables.rootIdentifier,
        ],
      });
      toast.success(
        'Assumption added successfully. Tests are being regenerated.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to add assumption. Please try again.');
    },
  });
};

/**
 * Custom hook for updating an existing assumption.
 * @returns The result of the useMutation hook.
 */
export const useAssumptionUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      rootIdentifier: string;
      assumptionUuid: string;
      data: IAssumptionLifecycleUpdateRequest;
    }) => {
      const { rootIdentifier, assumptionUuid, data } = params;
      return await api.assumption.updateAssumption(
        rootIdentifier,
        assumptionUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate assumptions queries to force a refetch
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.assumptions,
          'filtered',
          variables.rootIdentifier,
        ],
      });
      toast.success(
        'Assumption updated successfully. Tests are being regenerated.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to update assumption. Please try again.');
    },
  });
};

/**
 * Custom hook for removing an assumption from a concept.
 * @returns The result of the useMutation hook.
 */
export const useAssumptionRemove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      rootIdentifier: string;
      assumptionUuid: string;
    }) => {
      const { rootIdentifier, assumptionUuid } = params;
      return await api.assumption.removeAssumption(
        rootIdentifier,
        assumptionUuid,
      );
    },
    onSuccess: (_data, variables) => {
      // Invalidate assumptions queries to force a refetch
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.assumptions,
          'filtered',
          variables.rootIdentifier,
        ],
      });
      toast.success(
        'Assumption removed successfully. Tests are being regenerated.',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to remove assumption. Please try again.');
    },
  });
};
