import { IFinancialProjection } from './financialProjection';

export interface IBaseFinancialProjectionEntity {
  uuid: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBaseFinancialProjectionSourceV2 {
  uuid: string;
  title: string;
  url?: string;
  reasoning: string;
}

// Pricing types
export interface IPricingV2 extends IBaseFinancialProjectionEntity {
  price: number;
  currency?: string;
  unit: string;
  reasoning: string;
  additionalConsiderations: string[];
  pricingSources: IPricingSourceV2[];
}

export interface IPricingSourceV2 extends IBaseFinancialProjectionSourceV2 {}

export interface ICreatePricingV2 {
  price: number;
  currency?: string;
  unit: string;
  reasoning: string;
  additionalConsiderations?: string[];
}

export interface IPatchPricingV2 {
  price?: number;
  currency?: string;
  unit?: string;
  reasoning?: string;
  additionalConsiderations?: string[];
}

// Business Model types
export interface IBusinessModelV2 extends IBaseFinancialProjectionEntity {
  type: string;
  subtype: string;
  description: string;
}

export interface ICreateBusinessModelV2 {
  type: string;
  subtype: string;
  description: string;
}

export interface IPatchBusinessModelV2 {
  type?: string;
  subtype?: string;
  description?: string;
}

// Market Sizing types
export interface IMarketSizingV2 extends IBaseFinancialProjectionEntity {
  type: string;
  assumptionEntries: IMarketSizingAssumptionEntryV2[];
}

export interface IMarketSizingAssumptionEntryV2
  extends IBaseFinancialProjectionEntity {
  order: number;
  scalar: number;
  unit: string;
  unitDescription: string;
  operator?: string;
  group?: string;
  title: string;
  description: string;
  assumptionSources: IAssumptionSourceV2[];
}

export interface IAssumptionSourceV2 extends IBaseFinancialProjectionSourceV2 {}

export interface ICreateMarketSizingV2 {
  type: string;
}

export interface IPatchMarketSizingV2 {
  type?: string;
}

export interface ICreateMarketSizingAssumptionEntryV2 {
  order: number;
  scalar: number;
  unit: string;
  operator?: string;
  group?: string;
  title: string;
  description: string;
}

export interface IPatchMarketSizingAssumptionEntryV2 {
  order?: number;
  scalar?: number;
  unit?: string;
  operator?: string;
  group?: string;
  title?: string;
  description?: string;
}

export interface ICreateAssumptionSourceV2
  extends IBaseFinancialProjectionSourceV2 {}

export interface IPatchAssumptionSourceV2
  extends IBaseFinancialProjectionSourceV2 {}

// Cost Driver types
export interface ICostDriverV2 extends IBaseFinancialProjectionEntity {
  title: string;
  description: string;
  costPercentageEstimate: number;
  mitigationStatement: string;
}

export interface ICreateCostDriverV2 {
  title: string;
  description: string;
  costPercentageEstimate: number;
  mitigationStatement: string;
}

export interface IPatchCostDriverV2 {
  title?: string;
  description?: string;
  costPercentageEstimate?: number;
  mitigationStatement?: string;
}

// Distribution Channel types
export interface IDistributionChannelV2 extends IBaseFinancialProjectionEntity {
  channelType: string;
  title: string;
  description: string;
}

export interface ICreateDistributionChannelV2 {
  channelType: string;
  title: string;
  description: string;
}

export interface IPatchDistributionChannelV2 {
  channelType?: string;
  title?: string;
  description?: string;
}

export interface IFinancialProjectionResponse {
  financialProjection: IFinancialProjectionV2 | IFinancialProjection;
  isV2: boolean;
}

// Main Financial Projection V2 type
export interface IFinancialProjectionV2 extends IBaseFinancialProjectionEntity {
  marketSizings: IMarketSizingV2[];
  businessModel?: IBusinessModelV2;
  pricingModel?: IPricingV2;
  costDrivers: ICostDriverV2[];
  distributionChannels: IDistributionChannelV2[];
}

// Response types for API
export interface IFinancialProjectionV2Response
  extends IFinancialProjectionV2 {}

export interface IMessageResponse {
  message: string;
}
