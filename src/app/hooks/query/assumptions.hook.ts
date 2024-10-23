import api from '@libs/api';
import {
  IAssumption,
  IAssumptionCreate,
  IAssumptionTestDetails,
  IAssumptionTestStatus,
  IAssumptionTestStatusCategory,
} from '@libs/api/types/assumptions';
import { useQuery } from 'react-query';
import { useGenericConceptMutate, useGenericMutate } from './helper.hooks';
import { AucctusQueryKeys } from './query-keys';

/**
 * Custom hook for fetching a concept key assumptions by UUID.
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

export const useAssumptionUpdate = () => {
  return useGenericConceptMutate<IAssumption>(
    (data) => api.assumption.update(data.uuid, data),
    [[AucctusQueryKeys.assumptions]],
  );
};

export const useAssumptionCreate = (conceptUuid: string) => {
  return useGenericConceptMutate<IAssumption, IAssumptionCreate>(
    (data) => api.assumption.create(conceptUuid, data),
    [[AucctusQueryKeys.assumptions, conceptUuid]],
  );
};

export const useAssumptionDelete = () => {
  return useGenericConceptMutate<IAssumption, string>(
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
