import { toast } from '@components';
import api from '@libs/api';
import {
  EditConceptReportRequest,
  IncubationAnswerRequest,
  IncubationAnswerUpdateRequest,
  IncubationAnswerUpdateResponse,
} from '@libs/api/concepts';
import {
  IAssumptionLifecycleAddRequest,
  IAssumptionLifecycleUpdateRequest,
  IAssumptionBatchRequest,
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
      toast.error(
        'Concept Generation Failed',
        message || 'Unable to generate concept. Please try again',
      );
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
      toast.error(
        'Concept Edit Failed',
        message || 'Unable to edit concept. Please try again',
      );
    },
  });
};

export const markConceptSectionsPending = (
  queryClient: QueryClient,
  conceptIdentifier: string,
  sectionKeys: string[],
) => {
  if (!conceptIdentifier || sectionKeys.length === 0) {
    return;
  }

  const timestamp = new Date().toISOString();

  const updateConcept = (concept?: IConcept) => {
    if (!concept?.reportStatusBySection) {
      return concept;
    }

    let didChange = false;
    const nextSections = { ...concept.reportStatusBySection };

    sectionKeys.forEach((key) => {
      const current = nextSections[key];
      if (!current) {
        return;
      }
      if (current.status === 'pending') {
        return;
      }

      nextSections[key] = {
        ...current,
        status: 'pending',
        dateStarted: timestamp,
        dateCompleted: '',
      };
      didChange = true;
    });

    if (!didChange) {
      return concept;
    }

    return {
      ...concept,
      reportStatusBySection: nextSections,
    };
  };

  // Update single concept query (by identifier)
  queryClient.setQueryData<IConcept | undefined>(
    [AucctusQueryKeys.concept, conceptIdentifier],
    (existing) => {
      return updateConcept(existing);
    },
  );

  // Update concept by UUID query (if exists)
  const allQueries = queryClient.getQueryCache().findAll();
  const conceptUuidQuery = allQueries.find((query) => {
    const key = query.queryKey as any[];
    return key[0] === AucctusQueryKeys.concept && key[1] !== conceptIdentifier;
  });

  if (conceptUuidQuery) {
    const conceptUuid = (conceptUuidQuery.queryKey as any[])[1];
    queryClient.setQueryData<IConcept | undefined>(
      [AucctusQueryKeys.concept, conceptUuid],
      (existing) => updateConcept(existing),
    );
  }

  // Update concepts list query
  queryClient.setQueryData<{ results?: IConcept[] } | undefined>(
    [AucctusQueryKeys.concepts],
    (existing) => {
      if (!existing?.results) {
        return existing;
      }

      let didMutate = false;
      const results = existing.results.map((concept) => {
        if (concept.identifier !== conceptIdentifier) {
          return concept;
        }
        const updated = updateConcept(concept);
        if (updated && updated !== concept) {
          didMutate = true;
          return updated;
        }
        return concept;
      });

      if (!didMutate) {
        return existing;
      }

      return {
        ...existing,
        results,
      };
    },
  );
};

export const useGenerateKeyAssumptions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.concept.generateKeyAssumptions(conceptIdentifier),
    onSuccess: (_data, conceptIdentifier) => {
      if (conceptIdentifier) {
        markConceptSectionsPending(queryClient, conceptIdentifier, [
          'assumptions',
        ]);
      }
      toast.info(
        'Key assumptions regeneration started',
        "We'll refresh this section as soon as new insights are ready.",
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Key Assumptions Generation Failed',
        message || 'Unable to generate key assumptions. Please try again',
      );
    },
  });
};

export const useGenerateCustomerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.concept.generateCustomerProfile(conceptIdentifier),
    onSuccess: (_data, conceptIdentifier) => {
      if (conceptIdentifier) {
        markConceptSectionsPending(queryClient, conceptIdentifier, [
          'customerProfiles',
        ]);
      }
      // DO NOT invalidate queries here - that would force a refetch from backend
      // which still shows "complete" status, overwriting our pending states.
      // WebSocket events will handle the actual data updates when backend completes.
      toast.info(
        'Customer profile regeneration started',
        "We'll refresh this section as soon as conversations complete.",
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Customer Profile Generation Failed',
        message || 'Unable to generate customer profile. Please try again',
      );
    },
  });
};

export const useGenerateMarketScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.concept.generateMarketScan(conceptIdentifier),
    onSuccess: (_data, conceptIdentifier) => {
      if (conceptIdentifier) {
        markConceptSectionsPending(queryClient, conceptIdentifier, [
          'marketScan',
        ]);
      }
      // DO NOT invalidate queries here - that would force a refetch from backend
      // which still shows "complete" status, overwriting our pending states.
      // WebSocket events will handle the actual data updates when backend completes.
      toast.info(
        'Market scan regeneration started',
        "We'll refresh this section as soon as new signals arrive.",
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Market Scan Generation Failed',
        message || 'Unable to generate market scan. Please try again',
      );
    },
  });
};

export const useGenerateConceptOverview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) => {
      const result =
        await api.concept.generateConceptOverview(conceptIdentifier);

      return result;
    },
    onSuccess: (_data, conceptIdentifier) => {
      if (conceptIdentifier) {
        markConceptSectionsPending(queryClient, conceptIdentifier, [
          'overview',
        ]);
      }
      // DO NOT invalidate queries here - that would force a refetch from backend
      // which still shows "complete" status, overwriting our pending states.
      // WebSocket events will handle the actual data updates when backend completes.
      toast.info(
        'Overview regeneration started',
        "We'll refresh this section as soon as the updates finish.",
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Overview Generation Failed',
        message || 'Unable to generate overview. Please try again',
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
    return useMutation<
      IncubationAnswerUpdateResponse,
      Error,
      {
        answerId: number;
        body: IncubationAnswerUpdateRequest;
        forceDelete?: boolean;
      }
    >({
      mutationFn: async (params) =>
        await api.concept.updateSeedDraftAnswerAndDeleteHigherOrderAnswers(
          params.answerId,
          params.body,
          params.forceDelete || false,
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

export const useConceptOverview = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptOverview, uuid],
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60, // 1 minute
    queryFn: async () => {
      if (!uuid) return undefined;
      const result = await api.concept.getConceptOverview(uuid);
      return result;
    },
    enabled: !!uuid,
  });

  return { ...query, conceptOverview: query.data };
};

export const useConceptExecutiveSummaries = (conceptUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptExecutiveSummaries, conceptUuid],
    staleTime: 1000 * 20, // 20 seconds - summaries are relatively stable
    cacheTime: 1000 * 20, // 20 seconds
    queryFn: async () => {
      if (!conceptUuid) return undefined;
      const result =
        await api.concept.getConceptExecutiveSummaries(conceptUuid);
      return result;
    },
    enabled: !!conceptUuid,
  });

  return { ...query, executiveSummaries: query.data };
};

export const useConceptVideoGenerate = (conceptUuid: string) => {
  return useMutation({
    mutationFn: async () => {
      return await api.concept.generateConceptVideo(conceptUuid);
    },
    onSuccess: () => {
      // Query will be invalidated when WebSocket completion message is received
      toast.success(
        'Video Generation Started',
        'Your concept video is being generated',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Video Generation Failed',
        message || 'Unable to start video generation',
      );
    },
  });
};

export const useConceptMagicShareLatest = (conceptUuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptMagicShareLatest, conceptUuid],
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => {
      if (!conceptUuid) return undefined;
      try {
        return await api.concept.getConceptMagicShareLatest(conceptUuid);
      } catch (error: any) {
        // 404 means no magic share exists, which is a valid state (not an error)
        if (error?.response?.status === 404) {
          return undefined;
        }
        throw error;
      }
    },
    enabled: !!conceptUuid,
    retry: (failureCount, error: any) => {
      // Don't retry on 404s
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return { ...query, magicShareLatest: query.data };
};

export const useConceptMagicShareEmail = () => {
  return useMutation({
    mutationFn: async (params: {
      conceptUuid: string;
      magicShareUuid: string;
    }) => {
      return await api.concept.emailConceptMagicShare(
        params.conceptUuid,
        params.magicShareUuid,
      );
    },
  });
};

export const useGenerateMagicShare = (uuid?: string) => {
  const query = useQuery({
    queryFn: async () =>
      uuid ? await api.concept.generateMagicShare(uuid) : undefined,
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
      toast.error(
        'Save Failed',
        'Concepts could not be saved. Please try again later',
      );
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
        'Search Failed',
        message || 'Unable to search conversation. Please try again',
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
        'Signal Creation Failed',
        message || 'Unable to create real world signal. Please try again later',
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
        'Signal Update Failed',
        message || 'Unable to update real world signal. Please try again later',
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
        'Signal Deletion Failed',
        message || 'Unable to delete real world signal. Please try again later',
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
        toast.error('Operation Failed', message || 'An error occurred');
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
      toast.success(
        'Report Cancelled',
        'Report generation has been stopped successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Cancellation Failed',
        message || 'Unable to cancel report generation',
      );
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
    // Core concept queries
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.concept],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.concepts],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.conceptOverview],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.conceptExecutiveSummaries],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.conceptVersions],
    }),
    // Market scan queries
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.marketScan],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.marketScanTrendsV3],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.marketScanPriorityInsightsV3],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.marketScanMarketForcesV3],
    }),
    // Customer profile queries
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfile],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfiles],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfileConversation],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfileConversationSearch],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfileRealWorldSignals],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerProfileRealWorldSignal],
    }),
    // Customer profile sub-entities
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerJob],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerPain],
    }),
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.customerJourneyStep],
    }),
    // Financial projection queries
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.financialProjection],
    }),
    // Assumptions queries
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.assumptions],
    }),
    // Dashboard for concept counts/stats
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.dashboard],
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
      toast.error('Operation Failed', message || 'An error occurred');
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
      toast.success(
        'Version Saved',
        'Your concept version has been saved successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Version Save Failed',
        message || 'Unable to save concept version',
      );
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
      toast.error(
        'Version Revert Failed',
        message || 'Unable to revert to historical version',
      );
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
      toast.success(
        'Version Restored',
        'Your concept has been restored to the selected version',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Version Restore Failed',
        message || 'Unable to restore concept version',
      );
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
      toast.error(
        'Cancel Revert Failed',
        message || 'Unable to cancel version revert',
      );
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
      toast.success('Job Created', 'Customer job has been added successfully');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Job Creation Failed',
        message || 'Unable to create customer job',
      );
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
      toast.success(
        'Job Updated',
        'Customer job has been updated successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Job Update Failed',
        message || 'Unable to update customer job',
      );
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
      toast.success(
        'Job Deleted',
        'Customer job has been removed successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Job Deletion Failed',
        message || 'Unable to delete customer job',
      );
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
      toast.success(
        'Pain Created',
        'Customer pain point has been added successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Pain Creation Failed',
        message || 'Unable to create pain point',
      );
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
      toast.success(
        'Pain Updated',
        'Customer pain point has been updated successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Pain Update Failed',
        message || 'Unable to update pain point',
      );
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
      toast.success(
        'Pain Deleted',
        'Customer pain point has been removed successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Pain Deletion Failed',
        message || 'Unable to delete pain point',
      );
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
      toast.success(
        'Journey Step Created',
        'Step has been added to the customer journey',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Journey Step Creation Failed',
        message || 'Unable to create journey step',
      );
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
      toast.success(
        'Journey Step Updated',
        'Step has been updated successfully',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Journey Step Update Failed',
        message || 'Unable to update journey step',
      );
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
      toast.success(
        'Journey Step Deleted',
        'Step has been removed from the customer journey',
      );
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Journey Step Deletion Failed',
        message || 'Unable to delete journey step',
      );
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
        'Assumption Added',
        'Tests are being regenerated for your new assumption',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Addition Failed',
        message || 'Unable to add assumption. Please try again',
      );
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
        'Assumption Updated',
        'Tests are being regenerated for your updated assumption',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Update Failed',
        message || 'Unable to update assumption. Please try again',
      );
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
        'Assumption Removed',
        'Tests are being regenerated with the updated assumptions',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Removal Failed',
        message || 'Unable to remove assumption. Please try again',
      );
    },
  });
};

/**
 * Custom hook for uploading custom images to concept overview.
 * @param conceptUuid - UUID of the concept
 * @returns The result of the useMutation hook.
 */
export const useUploadConceptCustomImage = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) =>
      await api.concept.uploadConceptCustomImage(conceptUuid, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptOverview, conceptUuid],
      });
      toast.success('Custom image uploaded successfully');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Failed to upload image. Please try again.');
    },
  });
};

/**
 * Custom hook for updating concept image settings (AI vs custom).
 * @param conceptUuid - UUID of the concept
 * @returns The result of the useMutation hook.
 */
export const useUpdateConceptImageSettings = (conceptUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: {
      useCustomImage: boolean;
      customImageUrl?: string;
    }) => await api.concept.updateConceptImageSettings(conceptUuid, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.conceptOverview, conceptUuid],
      });
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to update image settings. Please try again.',
      );
    },
  });
};

/**
 * Custom hook for batch updating assumptions (create, update, delete).
 * @returns The result of the useMutation hook.
 */
export const useAssumptionBatchUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      rootIdentifier: string;
      data: IAssumptionBatchRequest;
    }) => {
      const { rootIdentifier, data } = params;
      return await api.assumption.batchUpdateAssumptions(rootIdentifier, data);
    },
    onSuccess: async (_data, variables) => {
      // Invalidate assumptions queries to force a refetch
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.assumptions,
          'filtered',
          variables.rootIdentifier,
          AucctusQueryKeys.concept,
        ],
      });

      const { create, update, delete: deleteItems } = variables.data;
      const totalChanges = create.length + update.length + deleteItems.length;

      toast.success(
        `Successfully applied ${totalChanges} changes! Tests are being regenerated.`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        message || 'Failed to apply batch changes. Please try again.',
      );
    },
  });
};
