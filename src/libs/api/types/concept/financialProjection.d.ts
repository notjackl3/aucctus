import type { IBaseConceptEntity } from './concepts';

type MarketMetricType = 'TAM' | 'SAM' | 'SOM';

interface BaseFinancialProjectionItem extends IBaseConceptEntity {
  rationale: string;
  sources: ISource[];
}

interface IBusinessModel extends BaseFinancialProjectionItem {
  name: string;
  description: string;
}
interface IFinancialProjectionPricing extends BaseFinancialProjectionItem {
  price: number;
  billing: string;
  averageRevenuePerCustomer: number;
  purchasingFrequency: number;
}

interface IFinancialMarketSizeItem extends BaseFinancialProjectionItem {
  value: number;
  assumptions: string[];
}

interface IFinancialProjection extends IBaseConceptEntity {
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
