import api from '@libs/api';
import type {
  IAssumptionV1,
  IAssumptionCreate,
  IAssumptionTestDetails,
  IAssumptionTestStatus,
  IAssumptionTestStatusCategory,
  ITestStep,
  AssumptionCategory,
} from '@libs/api/types';
import { useQuery } from 'react-query';
import { useGenericConceptMutate, useGenericMutate } from './helper.hooks';
import { AucctusQueryKeys } from './query-keys';

// Define the category metrics structure for V2 API response
export interface CategoryMetric {
  category: AssumptionCategory;
  count: number;
  cumulativeCertainty: number;
  cumulativeImportance: number;
  averageRisk: number;
  validationStatus:
    | 'validated'
    | 'unvalidated'
    | 'partially_validated'
    | 'invalidated'
    | 'untested';
  validationPercentage: number; // 0-1 range from API
}

/**
 * TODO: DEPRECATE - Custom hook for fetching a concept key assumptions by UUID.
 * This hook returns V1 format data. Remove once all components migrate to V2.
 * @param uuid - The UUID of the concept to fetch.
 * @returns An object containing the query result and the concept key assumptions data.
 */
export const useAssumptions = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.assumptions, conceptUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => await api.assumption.getAll(conceptUuid),
    enabled: !!conceptUuid,
  });
  return { ...query, assumptions: query.data?.results || [] };
};

/**
 * Custom hook for fetching filtered assumptions with category and other filters.
 * Returns V2 format assumptions with categoryMetrics.
 * @param rootIdentifier - The root identifier (e.g., concept UUID)
 * @param filters - Filter options including category, search, pagination, etc.
 * @returns An object containing the query result and filtered assumptions data in V2 format.
 */
export const useFilteredAssumptions = (
  rootIdentifier: string,
  filters?: {
    category?: string;
    search?: string;
    status?: string;
    created_by?: string;
    min_certainty?: number;
    max_certainty?: number;
    min_importance?: number;
    max_importance?: number;
    sort?: string;
    page?: number;
    page_size?: number;
  },
) => {
  const query = useQuery({
    queryKey: [
      AucctusQueryKeys.assumptions,
      'filtered',
      rootIdentifier,
      filters,
    ],
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () =>
      await api.assumption.getAllFiltered(rootIdentifier, filters),
    enabled: !!rootIdentifier,
  });
  return {
    ...query,
    assumptions: query.data?.results || [],
    count: query.data?.count || 0,
    numberOfPages: query.data?.numberOfPages || 0,
    pageSize: query.data?.pageSize || 10,
    categoryMetrics: query.data?.categoryMetrics,
  };
};

// TODO: DEPRECATE - V1 assumption mutation hooks. Remove once all components migrate to V2.
export const useAssumptionUpdate = () => {
  return useGenericConceptMutate<IAssumptionV1>(
    (data) => api.assumption.update(data.uuid, data),
    [[AucctusQueryKeys.assumptions]],
  );
};

// TODO: DEPRECATE - V1 assumption creation hook. Remove once all components migrate to V2.
export const useAssumptionCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<IAssumptionV1, IAssumptionCreate>(
    (data) => api.assumption.create(conceptUuid, data),
    [[AucctusQueryKeys.assumptions, conceptUuid]],
  );
};

// TODO: DEPRECATE - V1 assumption deletion hook. Remove once all components migrate to V2.
export const useAssumptionDelete = () => {
  return useGenericConceptMutate<IAssumptionV1, string>(
    (uuid) => api.assumption.deleteAssumption(uuid),
    [[AucctusQueryKeys.assumptions]],
  );
};

export const useAssumptionTestDetails = (assumptionUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.assumptionTestDetails, assumptionUuid],
    queryFn: async () =>
      await api.assumption.getAllAssumptionTests(assumptionUuid),
    enabled: !!assumptionUuid,
  });

  return { ...query, testDetails: query.data };
};

export const useStartTest = (assumptionUuid: string) => {
  return useGenericMutate<IAssumptionTestDetails, string>(
    (assumptionTestDetailUuid) =>
      api.assumption.startTest(assumptionUuid, assumptionTestDetailUuid),
    [
      [AucctusQueryKeys.assumptionTestDetails, assumptionUuid],
      [AucctusQueryKeys.assumption],
    ],
  );
};

export const useAllConceptTestDetails = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.conceptTestDetails, conceptUuid],
    queryFn: async () =>
      await api.assumption.getAllConceptTestDetails(conceptUuid),
    enabled: !!conceptUuid,
  });
  return { ...query, testDetails: query.data };
};

export const useConceptTestDetails = (
  conceptUuid: string,
  conceptTestUuid: string,
) => {
  const query = useQuery({
    queryKey: [
      AucctusQueryKeys.conceptTestDetails,
      conceptUuid,
      conceptTestUuid,
    ],
    queryFn: async () =>
      await api.assumption.getConceptTestDetails(conceptUuid, conceptTestUuid),
    enabled: !!conceptUuid && !!conceptTestUuid,
  });
  return { ...query, testDetails: query.data };
};

export const useUpdateAssumptionTestDetails = (assumptionUuid: string) => {
  return useGenericMutate<
    IAssumptionTestDetails,
    Partial<IAssumptionTestDetails> & { uuid: string }
  >(
    (data) =>
      api.assumption.updateAssumptionTestDetails(
        assumptionUuid,
        data.uuid,
        data,
      ),
    [
      [AucctusQueryKeys.assumptionTestDetails, assumptionUuid],
      [AucctusQueryKeys.assumption],
    ],
  );
};

export const useUpdateConceptTestStep = (conceptTestUuid: string) => {
  return useGenericMutate<ITestStep, Partial<ITestStep> & { uuid: string }>(
    (data) =>
      api.assumption.updateConceptTestStep(conceptTestUuid, data.uuid, data),
    [[AucctusQueryKeys.conceptTestDetails], [AucctusQueryKeys.assumption]],
  );
};

const defaultAssumptionTestStatusCategory: IAssumptionTestStatusCategory = {
  status: 'notStarted',
  testProgress: [],
  estimatedEndDate: undefined,
};

const defaultAssumptionTestStatusOverview: IAssumptionTestStatus = {
  desirability: { ...defaultAssumptionTestStatusCategory },
  feasibility: { ...defaultAssumptionTestStatusCategory },

  viability: { ...defaultAssumptionTestStatusCategory },
  adaptability: { ...defaultAssumptionTestStatusCategory },
  overview: {
    daysRemaining: undefined,
    daysPast: undefined,
    riskiestCategory: undefined,
    riskiestCategoryStatus: undefined,
    averageDuration: undefined,
    lastMonthAverageTestDuration: undefined,
  },
};

export const useAssumptionTestStatusOverview = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.assumptionTestStatusOverview, conceptUuid],
    queryFn: async () =>
      await api.assumption.getAssumptionTestStatusOverview(conceptUuid),
    enabled: !!conceptUuid,
  });
  return {
    ...query,
    data: { ...defaultAssumptionTestStatusOverview, ...query.data },
  };
};
