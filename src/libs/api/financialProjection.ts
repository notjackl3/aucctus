import Api from './api';
import { ApiService, IApiServiceConfig } from './base/apiService';
import { Endpoints as endpoints } from './endpoints';
import {
  IFinancialProjectionV2,
  IPricingV2,
  ICreatePricingV2,
  IPatchPricingV2,
  IBusinessModelV2,
  ICreateBusinessModelV2,
  IPatchBusinessModelV2,
  IMarketSizingV2,
  ICreateMarketSizingV2,
  IPatchMarketSizingV2,
  IMarketSizingAssumptionEntryV2,
  ICreateMarketSizingAssumptionEntryV2,
  IPatchMarketSizingAssumptionEntryV2,
  ICostDriverV2,
  ICreateCostDriverV2,
  IPatchCostDriverV2,
  IDistributionChannelV2,
  ICreateDistributionChannelV2,
  IPatchDistributionChannelV2,
  IMessageResponse,
} from './types/concept/financialProjectionV2';

/**
 * Financial Projection V2 API
 *
 * Handles all the requests for the Financial Projection V2 backend.
 */
export class FinancialProjectionApi extends ApiService {
  protected _excludeAllFromRefresh: boolean = false;
  protected _excludePathFromRefresh: string[] = [];

  constructor(apiInstance: Api, apiConfig: IApiServiceConfig) {
    super(apiInstance, apiConfig);
    this._setupMiddleware();
    this._shouldSkipRefresh = this._shouldSkipRefresh.bind(this);
  }

  // Financial Projection methods
  getFinancialProjection(conceptUuid: string) {
    return this.get<IFinancialProjectionV2>(
      endpoints.financialProjectionV2(conceptUuid),
    );
  }

  // Pricing methods
  createPricing(financialProjectionUuid: string, data: ICreatePricingV2) {
    return this.post<IPricingV2>(
      endpoints.financialProjectionPricing(financialProjectionUuid),
      data,
    );
  }

  getPricing(pricingUuid: string) {
    return this.get<IPricingV2>(endpoints.pricingUuid(pricingUuid));
  }

  updatePricing(pricingUuid: string, data: IPatchPricingV2) {
    return this.patch<IPricingV2>(endpoints.pricingUuid(pricingUuid), data);
  }

  deletePricing(pricingUuid: string) {
    return this.delete<IMessageResponse>(endpoints.pricingUuid(pricingUuid));
  }

  // Business Model methods
  createBusinessModel(
    financialProjectionUuid: string,
    data: ICreateBusinessModelV2,
  ) {
    return this.post<IBusinessModelV2>(
      endpoints.financialProjectionBusinessModel(financialProjectionUuid),
      data,
    );
  }

  getBusinessModel(businessModelUuid: string) {
    return this.get<IBusinessModelV2>(
      endpoints.businessModelUuid(businessModelUuid),
    );
  }

  updateBusinessModel(businessModelUuid: string, data: IPatchBusinessModelV2) {
    return this.patch<IBusinessModelV2>(
      endpoints.businessModelUuid(businessModelUuid),
      data,
    );
  }

  deleteBusinessModel(businessModelUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.businessModelUuid(businessModelUuid),
    );
  }

  // Market Sizing methods
  createMarketSizing(
    financialProjectionUuid: string,
    data: ICreateMarketSizingV2,
  ) {
    return this.post<IMarketSizingV2>(
      endpoints.financialProjectionMarketSizing(financialProjectionUuid),
      data,
    );
  }

  getMarketSizing(marketSizingUuid: string) {
    return this.get<IMarketSizingV2>(
      endpoints.marketSizingUuid(marketSizingUuid),
    );
  }

  updateMarketSizing(marketSizingUuid: string, data: IPatchMarketSizingV2) {
    return this.patch<IMarketSizingV2>(
      endpoints.marketSizingUuid(marketSizingUuid),
      data,
    );
  }

  deleteMarketSizing(marketSizingUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.marketSizingUuid(marketSizingUuid),
    );
  }

  // Market Sizing Assumption methods
  createMarketSizingAssumption(
    marketSizingUuid: string,
    data: ICreateMarketSizingAssumptionEntryV2,
  ) {
    return this.post<IMarketSizingAssumptionEntryV2>(
      `${endpoints.marketSizingUuid(marketSizingUuid)}/assumption`,
      data,
    );
  }

  getMarketSizingAssumption(assumptionUuid: string) {
    return this.get<IMarketSizingAssumptionEntryV2>(
      `api/v2/market-sizing-assumption/${assumptionUuid}`,
    );
  }

  updateMarketSizingAssumption(
    assumptionUuid: string,
    data: IPatchMarketSizingAssumptionEntryV2,
  ) {
    return this.patch<IMarketSizingAssumptionEntryV2>(
      `api/v2/market-sizing-assumption/${assumptionUuid}`,
      data,
    );
  }

  deleteMarketSizingAssumption(assumptionUuid: string) {
    return this.delete<IMessageResponse>(
      `api/v2/market-sizing-assumption/${assumptionUuid}`,
    );
  }

  // Cost Driver methods
  createCostDriver(financialProjectionUuid: string, data: ICreateCostDriverV2) {
    return this.post<ICostDriverV2>(
      endpoints.financialProjectionCostDriver(financialProjectionUuid),
      data,
    );
  }

  getCostDriver(costDriverUuid: string) {
    return this.get<ICostDriverV2>(endpoints.costDriverUuid(costDriverUuid));
  }

  updateCostDriver(costDriverUuid: string, data: IPatchCostDriverV2) {
    return this.patch<ICostDriverV2>(
      endpoints.costDriverUuid(costDriverUuid),
      data,
    );
  }

  deleteCostDriver(costDriverUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.costDriverUuid(costDriverUuid),
    );
  }

  // Distribution Channel methods
  createDistributionChannel(
    financialProjectionUuid: string,
    data: ICreateDistributionChannelV2,
  ) {
    return this.post<IDistributionChannelV2>(
      endpoints.financialProjectionDistributionChannel(financialProjectionUuid),
      data,
    );
  }

  getDistributionChannel(distributionChannelUuid: string) {
    return this.get<IDistributionChannelV2>(
      endpoints.distributionChannelUuid(distributionChannelUuid),
    );
  }

  updateDistributionChannel(
    distributionChannelUuid: string,
    data: IPatchDistributionChannelV2,
  ) {
    return this.patch<IDistributionChannelV2>(
      endpoints.distributionChannelUuid(distributionChannelUuid),
      data,
    );
  }

  deleteDistributionChannel(distributionChannelUuid: string) {
    return this.delete<IMessageResponse>(
      endpoints.distributionChannelUuid(distributionChannelUuid),
    );
  }
}
