import type { IBaseConceptEntity } from './concepts';

export type MarketMetricType = 'TAM' | 'SAM' | 'SOM';

export interface BaseFinancialProjectionItem extends IBaseConceptEntity {
  rationale: string;
  sources: ISource[];
}

export interface IBusinessModel extends BaseFinancialProjectionItem {
  name: string;
  description: string;
}
export interface IFinancialProjectionPricing
  extends BaseFinancialProjectionItem {
  price: number;
  billing: string;
  averageRevenuePerCustomer: number;
  purchasingFrequency: number;
}

export interface IFinancialMarketSizeItem extends BaseFinancialProjectionItem {
  value: number;
  assumptions: string[];
}

export interface IFinancialProjection extends IBaseConceptEntity {
  overview: string;
  businessModel: IBusinessModel;
  pricing: IFinancialProjectionPricing;
  totalUsers: IFinancialMarketSizeItem;
  serviceableAddressablePercent: IFinancialMarketSizeItem;
  serviceableObtainablePercent: IFinancialMarketSizeItem;

  tam: number;
  sam: number;
  som: number;
}
