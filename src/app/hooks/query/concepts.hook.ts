import api from '@libs/api';
import {
  IConceptSeed,
  IGeneratedConceptsSaveBody,
  IncubationAnswerPayload,
  IncubationAnswerUpdatePayload,
} from '@libs/api/concepts';
import {
  Ecosystem,
  IConcept,
  IConceptOverview,
  IConceptPage,
  IConceptQueryOptions,
  ICustomerProfile,
  ICustomerProfileCreate,
  IEcosystemCreate,
  IFinancialProjection,
  IFormError,
  IMarketScanElementCreate,
  IMarketScanV1,
  // IMarketSizeMetric,
  ITrendsAndDriversV1,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useGenericConceptMutate } from './helper.hooks';
import { AucctusQueryKeys } from './query-keys';

// TODO: Remove once endpoint is implemented
const dummyConcepts = [
  {
    title: 'Cheese Rolls',
    description: 'Cheesy spirals! (short description)',
    uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  },
  {
    title: 'Chocolatey Balls',
    description:
      'Spherical chocolate bombs that explode with flavor and temporarily transform your tongue into a chocolate waterslide! Side effects include chocolate-induced giggling fits and the sudden ability to speak in rhymes for up to 37 minutes after consumption. Double the length to of this description to make it more lorem ipsumy and see how long we can make this thing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
    uuid: '38c7a6f0-b253-4e7b-a2c3-1f59c0fe05ab',
  },
  {
    title: 'Fruit Salad Hands',
    description:
      'Edible gloves made entirely of fruit leather that make eating fruit salad a high-five experience! Each finger contains a different fruit surprise, and the palm holds a secret tropical punch reservoir. Perfect for food fights that leave you smelling like a Hawaiian vacation!',
    uuid: 'c9b5f5e0-d7a3-4c05-9f38-a21c4e5d22b7',
  },
];

export type PartialConceptWithRequiredUuid = Partial<IConcept> & {
  uuid: string;
};
export type PartialConceptOverviewWithRequiredUuid =
  Partial<IConceptOverview> & { uuid: string };

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
export const useSeeds = (queryOptions: IConceptQueryOptions) => {
  return useQuery({
    queryKey: [
      AucctusQueryKeys.seeds,
      queryOptions.status,
      queryOptions.search,
      queryOptions.page,
      queryOptions.sort,
    ],
    queryFn: () => api.concept.getSeeds(queryOptions),
    staleTime: 1000 * 60 * 2, // 2 minutes
    keepPreviousData: true, // Keep previous data while loading new data
  });
};

export const useConceptSeed = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptSeed, AucctusQueryKeys.concept, uuid],
    cacheTime: Infinity,
    staleTime: 1000 * 60 * 2, // 2 minute
    enabled: !!uuid,
    queryFn: async () => await api.concept.seed(uuid),
  });

  return {
    ...query,
    seed: query.data || {
      answers: [],
    },
  };
};

// Dummy call for now
export const useConceptGeneration = () => {
  return useMutation({
    mutationFn: async (body: any) => {
      // Simulate network latency (between 1-3 seconds)
      const delay = 1000 + Math.random() * 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      return { concepts: dummyConcepts };
    },
    onSuccess: () => {},
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(message || 'Concept generation failed. Please try again.');
    },
  });
};

export const useConceptSeedDraft = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptSeedDraft, uuid],
    queryFn: async () => {
      return uuid ? await api.concept.seedDraft(uuid) : {};
    },
  });

  return {
    ...query,
    seedDraft: query.data || {
      answers: [],
    },
  };
};

export const useSaveConceptSeedDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: IConceptSeed) =>
      await api.concept.saveSeedDraft(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useDeleteConceptSeedDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => await api.concept.deleteSeedDraft(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useGetConceptSeedDraftAnswers = (seedDraftUuid: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.conceptSeedDraftAnswers, seedDraftUuid],
    queryFn: async () => await api.concept.getSeedDraftAnswers(seedDraftUuid),
    cacheTime: Infinity,
    staleTime: Infinity,
  });
};

export const useSaveConceptSeedDraftAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      uuid: string;
      body: IncubationAnswerPayload;
    }) => await api.concept.saveSeedDraftAnswer(params.uuid, params.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
  });
};

export const useUpdateConceptSeedDraftAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      answerId: number;
      body: IncubationAnswerUpdatePayload;
    }) =>
      await api.concept.updateSeedDraftAnswerAndDeleteHigherOrderAnswers(
        params.answerId,
        params.body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.seeds] });
    },
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

export const useConceptIgnitionQuestionnaire = () => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptIgnitionQuestionnaire],
    cacheTime: Infinity,
    staleTime: Infinity,
    queryFn: async () => await api.conceptIgnite.questionnaire(),
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
export const useConcept = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.concept, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => (uuid ? await api.concept.getConcept(uuid) : void 0),
    enabled: !!uuid,
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
export const useSaveGeneratedConcepts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: IGeneratedConceptsSaveBody) => {
      return api.concept.saveGeneratedConcepts(body);
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
 * Custom hook for fetching a concept overview by their concept UUID.
 * @param uuid - The UUID of the concept to fetch.
 * @returns An object containing the query result and the concept overview data.
 */
export const useConceptOverview = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptOverview, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptOverview(uuid),
    enabled: !!uuid,
  });

  return { ...query, overview: query.data };
};

/**
 * @deprecated Use useConceptMarketScan instead.
 * Custom hook for fetching a concept market scan by their Concept UUID.
 * @param uuid - The UUID of the concept.
 * @returns An object containing the query result and the concept market scan data.
 */
export const useConceptMarketScanV1 = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketScan, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptMarketScan(uuid),
    enabled: !!uuid,
  });

  return { ...query, marketScan: query.data };
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

export const useConceptCustomerProfiles = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.customerProfiles, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptCustomerProfiles(uuid),
    enabled: !!uuid,
  });

  return { ...query, profiles: query.data?.results || [] };
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
            queryKey: [AucctusQueryKeys.concept, data.uuid],
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
    PartialConceptWithRequiredUuid
  >(async (concept) => await api.concept.updateConcept(concept, concept.uuid));
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

// Specific hooks using the generic one
/**
 * Custom hook for updating the concept overview.
 *
 * @param uuid - The UUID of the concept.
 * @returns The result of the generic concept update.
 */
export const useConceptOverviewUpdate = (conceptUuid: string) => {
  return useGenericConceptMutate<IConceptOverview>(
    (data) => api.concept.updateConceptOverview(data.uuid, data),
    [[AucctusQueryKeys.conceptOverview, conceptUuid]],
  );
};

/**
 * Custom hook for updating the concept market scan.
 *
 * @param uuid - The UUID of the concept.
 * @returns The result of the generic concept update.
 */
export const useMarketScanUpdate = (conceptUuid: string) => {
  return useGenericConceptMutate<IMarketScanV1>(
    (data) => api.concept.updateConceptMarketScan(data.uuid, data),
    [[AucctusQueryKeys.marketScan, conceptUuid]],
  );
};

export const useTrendAndDriverCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<ITrendsAndDriversV1, IMarketScanElementCreate>(
    (data) => api.concept.createTrendAndDriver(conceptUuid, data),
    [[AucctusQueryKeys.marketScan, conceptUuid]],
  );
};

export const useEcosystemCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<Ecosystem, IEcosystemCreate>(
    (data) => api.concept.createEcosystem(conceptUuid, data),
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
    [
      [AucctusQueryKeys.financialProjection, uuid],
      [AucctusQueryKeys.conceptOverview, uuid],
    ],
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

export const useTrendAndDriverUpdate = () => {
  return useGenericConceptMutate<ITrendsAndDriversV1>(
    (data) => api.concept.updateTrendAndDriver(data.uuid, data),
    [[AucctusQueryKeys.marketScan]],
  );
};

export const useTrendAndDriverDelete = () => {
  return useGenericConceptMutate<ITrendsAndDriversV1, string>(
    (uuid) => api.concept.deleteTrendAndDriver(uuid),
    [[AucctusQueryKeys.marketScan]],
  );
};

export const useEcosystemUpdate = () => {
  return useGenericConceptMutate<Ecosystem>(
    (data) => api.concept.updateEcosystem(data.uuid, data),
    [[AucctusQueryKeys.marketScan]],
  );
};

export const useEcosystemDelete = () => {
  return useGenericConceptMutate<Ecosystem, string>(
    (uuid) => api.concept.deleteEcosystem(uuid),
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
    IConceptSeed,
    AxiosError<IFormError<IConceptSeed>>,
    Partial<IConceptSeed> & { uuid: string }
  >({
    mutationFn: async (seed) => await api.concept.updateSeed(seed, seed.uuid),
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
