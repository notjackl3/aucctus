import { toast } from '@components';
import api from '@libs/api';
import {
  ICreatePricingV2,
  IPatchPricingV2,
  ICreateBusinessModelV2,
  IPatchBusinessModelV2,
  ICreateMarketSizingV2,
  IPatchMarketSizingV2,
  ICreateMarketSizingAssumptionEntryV2,
  IPatchMarketSizingAssumptionEntryV2,
  ICreateCostDriverV2,
  IPatchCostDriverV2,
  ICreateDistributionChannelV2,
  IPatchDistributionChannelV2,
} from '@libs/api/types';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  doFullConceptInvalidation,
  markConceptSectionsPending,
} from './concepts.hook';
import { AucctusQueryKeys } from './query-keys';

// Financial Projection hooks
export const useFinancialProjectionV2 = (conceptUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.financialProjectionV2, conceptUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.financialProjection.getFinancialProjection(conceptUuid),
    enabled: !!conceptUuid,
  });

  return { ...query, financialProjectionV2: query.data };
};

// Pricing hooks
export const usePricingV2 = (pricingUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.pricingV2, pricingUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => await api.financialProjection.getPricing(pricingUuid),
    enabled: !!pricingUuid,
  });

  return { ...query, pricing: query.data };
};

export const usePricingCreateV2 = (financialProjectionUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreatePricingV2) => {
      return await api.financialProjection.createPricing(
        financialProjectionUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.financialProjectionV2,
          financialProjectionUuid,
        ],
      });
      toast.success(
        'Pricing Model Created',
        'Your pricing model has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Pricing Model Creation Failed',
        message || 'Unable to create pricing model',
      );
    },
  });
};

export const usePricingUpdateV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      pricingUuid: string;
      data: IPatchPricingV2;
    }) => {
      const { pricingUuid, data } = params;
      return await api.financialProjection.updatePricing(pricingUuid, data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.pricingV2, variables.pricingUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Pricing Model Updated',
        'Your pricing model has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Pricing Model Update Failed',
        message || 'Unable to update pricing model',
      );
    },
  });
};

export const usePricingDeleteV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pricingUuid: string) => {
      return await api.financialProjection.deletePricing(pricingUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Pricing Model Deleted',
        'Your pricing model has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Pricing Model Deletion Failed',
        message || 'Unable to delete pricing model',
      );
    },
  });
};

// Business Model hooks
export const useBusinessModelV2 = (businessModelUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.businessModelV2, businessModelUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.financialProjection.getBusinessModel(businessModelUuid),
    enabled: !!businessModelUuid,
  });

  return { ...query, businessModel: query.data };
};

export const useBusinessModelCreateV2 = (financialProjectionUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateBusinessModelV2) => {
      return await api.financialProjection.createBusinessModel(
        financialProjectionUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.financialProjectionV2,
          financialProjectionUuid,
        ],
      });
      toast.success(
        'Business Model Created',
        'Your business model has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Business Model Creation Failed',
        message || 'Unable to create business model',
      );
    },
  });
};

export const useBusinessModelUpdateV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      businessModelUuid: string;
      data: IPatchBusinessModelV2;
    }) => {
      const { businessModelUuid, data } = params;
      return await api.financialProjection.updateBusinessModel(
        businessModelUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.businessModelV2,
          variables.businessModelUuid,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Business Model Updated',
        'Your business model has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Business Model Update Failed',
        message || 'Unable to update business model',
      );
    },
  });
};

export const useBusinessModelDeleteV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessModelUuid: string) => {
      return await api.financialProjection.deleteBusinessModel(
        businessModelUuid,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Business Model Deleted',
        'Your business model has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Business Model Deletion Failed',
        message || 'Unable to delete business model',
      );
    },
  });
};

// Market Sizing hooks
export const useMarketSizingV2 = (marketSizingUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketSizingV2, marketSizingUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.financialProjection.getMarketSizing(marketSizingUuid),
    enabled: !!marketSizingUuid,
  });

  return { ...query, marketSizing: query.data };
};

export const useMarketSizingCreateV2 = (financialProjectionUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateMarketSizingV2) => {
      return await api.financialProjection.createMarketSizing(
        financialProjectionUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.financialProjectionV2,
          financialProjectionUuid,
        ],
      });
      toast.success(
        'Market Sizing Created',
        'Your market sizing has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Market Sizing Creation Failed',
        message || 'Unable to create market sizing',
      );
    },
  });
};

export const useMarketSizingUpdateV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      marketSizingUuid: string;
      data: IPatchMarketSizingV2;
    }) => {
      const { marketSizingUuid, data } = params;
      return await api.financialProjection.updateMarketSizing(
        marketSizingUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.marketSizingV2, variables.marketSizingUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Market Sizing Updated',
        'Your market sizing has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Market Sizing Update Failed',
        message || 'Unable to update market sizing',
      );
    },
  });
};

export const useMarketSizingDeleteV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (marketSizingUuid: string) => {
      return await api.financialProjection.deleteMarketSizing(marketSizingUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Market Sizing Deleted',
        'Your market sizing has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Market Sizing Deletion Failed',
        message || 'Unable to delete market sizing',
      );
    },
  });
};

// Cost Driver hooks
export const useCostDriverV2 = (costDriverUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.costDriverV2, costDriverUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.financialProjection.getCostDriver(costDriverUuid),
    enabled: !!costDriverUuid,
  });

  return { ...query, costDriver: query.data };
};

export const useCostDriverCreateV2 = (financialProjectionUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateCostDriverV2) => {
      return await api.financialProjection.createCostDriver(
        financialProjectionUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.financialProjectionV2,
          financialProjectionUuid,
        ],
      });
      toast.success(
        'Cost Driver Created',
        'Your cost driver has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Cost Driver Creation Failed',
        message || 'Unable to create cost driver',
      );
    },
  });
};

export const useCostDriverUpdateV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      costDriverUuid: string;
      data: IPatchCostDriverV2;
    }) => {
      const { costDriverUuid, data } = params;
      return await api.financialProjection.updateCostDriver(
        costDriverUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.costDriverV2, variables.costDriverUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Cost Driver Updated',
        'Your cost driver has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Cost Driver Update Failed',
        message || 'Unable to update cost driver',
      );
    },
  });
};

export const useCostDriverDeleteV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (costDriverUuid: string) => {
      return await api.financialProjection.deleteCostDriver(costDriverUuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Cost Driver Deleted',
        'Your cost driver has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Cost Driver Deletion Failed',
        message || 'Unable to delete cost driver',
      );
    },
  });
};

// Distribution Channel hooks
export const useDistributionChannelV2 = (distributionChannelUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.distributionChannelV2, distributionChannelUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.financialProjection.getDistributionChannel(
        distributionChannelUuid,
      ),
    enabled: !!distributionChannelUuid,
  });

  return { ...query, distributionChannel: query.data };
};

export const useDistributionChannelCreateV2 = (
  financialProjectionUuid: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateDistributionChannelV2) => {
      return await api.financialProjection.createDistributionChannel(
        financialProjectionUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.financialProjectionV2,
          financialProjectionUuid,
        ],
      });
      toast.success(
        'Distribution Channel Created',
        'Your distribution channel has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Distribution Channel Creation Failed',
        message || 'Unable to create distribution channel',
      );
    },
  });
};

export const useDistributionChannelUpdateV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      distributionChannelUuid: string;
      data: IPatchDistributionChannelV2;
    }) => {
      const { distributionChannelUuid, data } = params;
      return await api.financialProjection.updateDistributionChannel(
        distributionChannelUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.distributionChannelV2,
          variables.distributionChannelUuid,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Distribution Channel Updated',
        'Your distribution channel has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Distribution Channel Update Failed',
        message || 'Unable to update distribution channel',
      );
    },
  });
};

export const useDistributionChannelDeleteV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (distributionChannelUuid: string) => {
      return await api.financialProjection.deleteDistributionChannel(
        distributionChannelUuid,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Distribution Channel Deleted',
        'Your distribution channel has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Distribution Channel Deletion Failed',
        message || 'Unable to delete distribution channel',
      );
    },
  });
};

// Market Sizing Assumption hooks
export const useMarketSizingAssumptionV2 = (assumptionUuid: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.marketSizingAssumptionV2, assumptionUuid],
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () =>
      await api.financialProjection.getMarketSizingAssumption(assumptionUuid),
    enabled: !!assumptionUuid,
  });

  return { ...query, assumption: query.data };
};

export const useMarketSizingAssumptionCreateV2 = (marketSizingUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ICreateMarketSizingAssumptionEntryV2) => {
      return await api.financialProjection.createMarketSizingAssumption(
        marketSizingUuid,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.marketSizingV2, marketSizingUuid],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Assumption Created',
        'Your market sizing assumption has been added successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Creation Failed',
        message || 'Unable to create market sizing assumption',
      );
    },
  });
};

export const useMarketSizingAssumptionUpdateV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      assumptionUuid: string;
      data: IPatchMarketSizingAssumptionEntryV2;
    }) => {
      const { assumptionUuid, data } = params;
      return await api.financialProjection.updateMarketSizingAssumption(
        assumptionUuid,
        data,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.marketSizingAssumptionV2,
          variables.assumptionUuid,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.marketSizingV2],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Assumption Updated',
        'Your market sizing assumption has been updated successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Update Failed',
        message || 'Unable to update market sizing assumption',
      );
    },
  });
};

export const useMarketSizingAssumptionDeleteV2 = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assumptionUuid: string) => {
      return await api.financialProjection.deleteMarketSizingAssumption(
        assumptionUuid,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.marketSizingV2],
      });
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.financialProjectionV2],
      });
      toast.success(
        'Assumption Deleted',
        'Your market sizing assumption has been removed successfully',
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Assumption Deletion Failed',
        message || 'Unable to delete market sizing assumption',
      );
    },
  });
};

export const useGenerateFinancialProjection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conceptIdentifier: string) =>
      await api.financialProjection.generateFinancialProjection(
        conceptIdentifier,
      ),
    onSuccess: (_data, conceptIdentifier) => {
      if (conceptIdentifier) {
        markConceptSectionsPending(queryClient, conceptIdentifier, [
          'financialProjection',
        ]);
      }
      doFullConceptInvalidation(queryClient, conceptIdentifier);
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error(
        'Financial Projection Failed',
        message || 'Unable to generate financial projection. Please try again',
      );
    },
  });
};
