import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../../libs/api';
import { AucctusQueryKeys } from './query-keys';
import {
  ConceptCategory,
  ConceptStatus,
  Ecosystem,
  IAssumption,
  IAssumptionCreate,
  IConcept,
  IConceptOverview,
  IConceptPage,
  ICustomerProfile,
  ICustomerProfileCreate,
  IEcosystemCreate,
  IFinancialProjection,
  IFormError,
  IMarketScan,
  IMarketScanElementCreate,
  IMarketSizeMetric,
  ITrendsAndDrivers,
} from '../../../libs/api/types';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { parseFormError } from '../../../libs/utils';
import analytics from '../../../libs/analytics';

export type PartialConceptWithRequiredUuid = Partial<IConcept> & { uuid: string };
export type PartialConceptOverviewWithRequiredUuid = Partial<IConceptOverview> & { uuid: string };

/**
 * Custom hook for fetching list concepts.
 * @param category - Optional concept category filter
 * @param status - Optional concept status filter
 * @param page - Optional page number for pagination
 * @returns The result of the useQuery hook.
 */
export const useConcepts = (category?: ConceptCategory, status?: ConceptStatus, page?: string) => {
  return useQuery({
    queryKey: [AucctusQueryKeys.concepts, status, category, page],
    cacheTime: Infinity,
    staleTime: 100 * 60, // 1 minute
    refetchInterval: (data?: IConceptPage) => {
      return data && data.results.some((concept) => concept.reportStatus === 'pending') ? 5000 : false;
    },
    queryFn: async () =>
      await api.concept.getConcepts({
        status,
        category,
        page: page ? parseInt(page) : undefined,
      }),
  });
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
    cacheTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => (uuid ? await api.concept.getConcept(uuid) : void 0),
  });

  return { ...query, concept: query.data };
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
  });

  return { ...query, overview: query.data };
};

/**
 * Custom hook for fetching a concept market scan by their Concept UUID.
 * @param uuid - The UUID of the concept.
 * @returns An object containing the query result and the concept market scan data.
 */
export const useConceptMarketScan = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptMarketScan, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptMarketScan(uuid),
  });

  return { ...query, marketScan: query.data };
};

export const useConceptCustomerProfiles = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptCustomerProfiles, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptCustomerProfiles(uuid),
  });

  return { ...query, profiles: query.data?.results || [] };
};

export const useConceptCustomerProfile = (profileUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptCustomerProfile, profileUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptCustomerProfile(profileUuid),
  });

  return { ...query, profile: query.data };
};

export const useFinancialProjection = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptFinancialProjection, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptFinancialProjection(uuid),
  });

  return { ...query, financialProjection: query.data };
};

export const useKeyAssumptions = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptKeyAssumptions, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptKeyAssumptions(uuid),
  });

  return { ...query, assumptions: query.data?.results || [] };
};

/**
 * Custom hook for fetching a concept key assumptions by UUID.
 * @param uuid - The UUID of the concept to fetch.
 * @returns An object containing the query result and the concept key assumptions data.
 */
export const useConceptAssumptions = (uuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptKeyAssumptions, uuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.concept.getConceptKeyAssumptions(uuid),
  });
  return { ...query, assumptions: query.data };
};

/**
 * Creates a mutation function for updating a concept.
 *
 * @param conceptUuid - The UUID of the concept to update.
 * @returns A mutation function that can be used to update the concept.
 */
const createConceptMutation = () => {
  const queryClient = useQueryClient();

  // Helper function to create mutations with common onSuccess and onError callbacks
  return <TData extends IConcept = IConcept, TError extends IFormError = IFormError<IConcept>, TVariables = unknown>(
    mutationFn: (variables: TVariables) => Promise<TData>,
  ) => {
    return useMutation<TData, AxiosError<TError>, TVariables>({
      mutationFn,
      onSuccess: (data) => {
        Promise.all([
          queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.concepts] }),
          queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.dashboard] }),
          queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.concept, data.uuid] }),
        ]);
      },
      onError: (e) => {
        const message = parseFormError(e);
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
  return createConceptMutation()<IConcept, IFormError<IConcept>, PartialConceptWithRequiredUuid>(
    async (concept) => await api.concept.updateConcept(concept, concept.uuid),
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

// Common useMutation hook
function useGenericConceptMutate<T, K = Partial<T> & { uuid: string }>(
  mutationFunction: (data: K) => Promise<T>,
  queryKeys: string[][],
) {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError<IFormError<T>>, K>({
    mutationFn: mutationFunction,
    onSuccess: () => {
      Promise.all(
        queryKeys.map((queryKey) => [
          queryClient.invalidateQueries({
            queryKey: queryKey,
          }),
        ]),
      );
    },
    onError: (e) => {
      analytics.debug(`Error:`, e);
      const message = parseFormError(e);
      toast.error(message);
    },
  });
}

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
  return useGenericConceptMutate<IMarketScan>(
    (data) => api.concept.updateConceptMarketScan(data.uuid, data),
    [[AucctusQueryKeys.conceptMarketScan, conceptUuid]],
  );
};

export const useTrendAndDriverCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<ITrendsAndDrivers, IMarketScanElementCreate>(
    (data) => api.concept.createTrendAndDriver(conceptUuid, data),
    [[AucctusQueryKeys.conceptMarketScan, conceptUuid]],
  );
};

export const useEcosystemCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<Ecosystem, IEcosystemCreate>(
    (data) => api.concept.createEcosystem(conceptUuid, data),
    [[AucctusQueryKeys.conceptMarketScan, conceptUuid]],
  );
};

export const useCustomerProfileUpdate = (profileUuid: string, conceptUuid?: string) => {
  const conceptProfileListQueryKey = conceptUuid
    ? [AucctusQueryKeys.conceptCustomerProfiles, conceptUuid]
    : [AucctusQueryKeys.conceptCustomerProfiles];
  const queryKeys = [conceptProfileListQueryKey, [AucctusQueryKeys.conceptCustomerProfile, profileUuid]];
  return useGenericConceptMutate<ICustomerProfile>(
    (data) => api.concept.updateConceptCustomerProfile(data.uuid, data),
    queryKeys,
  );
};

export const useCustomerProfileCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<ICustomerProfile, ICustomerProfileCreate>(
    (data) => api.concept.createConceptCustomerProfile(conceptUuid, data),
    [[AucctusQueryKeys.conceptCustomerProfiles, conceptUuid]],
  );
};

export function useDeleteCustomerProfile() {
  return useGenericConceptMutate<ICustomerProfile, string>(
    (uuid) => api.concept.deleteConceptCustomerProfile(uuid),
    [[AucctusQueryKeys.conceptCustomerProfiles]],
  );
}

export const useAssumptionUpdate = () => {
  return useGenericConceptMutate<IAssumption>(
    (data) => api.concept.updateConceptAssumption(data.uuid, data),
    [[AucctusQueryKeys.conceptKeyAssumptions]],
  );
};

export const useAssumptionCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<IAssumption, IAssumptionCreate>(
    (data) => api.concept.createConceptAssumption(conceptUuid, data),
    [[AucctusQueryKeys.conceptKeyAssumptions, conceptUuid]],
  );
};

export const useAssumptionDelete = () => {
  return useGenericConceptMutate<IAssumption, string>(
    (uuid) => api.concept.deleteConceptAssumption(uuid),
    [[AucctusQueryKeys.conceptKeyAssumptions]],
  );
};

export const useFinancialProjectionUpdate = (uuid: string) => {
  return useGenericConceptMutate<IFinancialProjection>(
    (data) => api.concept.updateConceptFinancialProjection(data.uuid, data),
    [
      [AucctusQueryKeys.conceptFinancialProjection, uuid],
      [AucctusQueryKeys.conceptOverview, uuid],
    ],
  );
};

/**
 * Custom hook for updating a market metric size.
 *
 * @param uuid - The UUID of the Concept.
 * @returns The result of the generic concept update.
 */
export const useMarketMetricSizeUpdate = (uuid: string) => {
  return useGenericConceptMutate<IMarketSizeMetric>(
    (data) => api.concept.updateMarketMetricSize(data.uuid, data),
    [
      [AucctusQueryKeys.conceptFinancialProjection, uuid],
      [AucctusQueryKeys.conceptOverview, uuid],
    ],
  );
};

export const useTrendAndDriverUpdate = () => {
  return useGenericConceptMutate<ITrendsAndDrivers>(
    (data) => api.concept.updateTrendAndDriver(data.uuid, data),
    [[AucctusQueryKeys.conceptMarketScan]],
  );
};

export const useTrendAndDriverDelete = () => {
  return useGenericConceptMutate<ITrendsAndDrivers, string>(
    (uuid) => api.concept.deleteTrendAndDriver(uuid),
    [[AucctusQueryKeys.conceptMarketScan]],
  );
};

export const useEcosystemUpdate = () => {
  return useGenericConceptMutate<Ecosystem>(
    (data) => api.concept.updateEcosystem(data.uuid, data),
    [[AucctusQueryKeys.conceptMarketScan]],
  );
};

export const useEcosystemDelete = () => {
  return useGenericConceptMutate<Ecosystem, string>(
    (uuid) => api.concept.deleteEcosystem(uuid),
    [[AucctusQueryKeys.conceptMarketScan]],
  );
};
