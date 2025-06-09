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

// =============================================================================
// GENERATE REVENUE TYPES
// =============================================================================

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

// =============================================================================
// COST SAVINGS TYPES
// =============================================================================

// Savings Source types
export interface ISavingsSourceV2 extends IBaseFinancialProjectionEntity {
  title: string;
  url?: string;
  reasoning: string;
}

// Savings types
export interface ISavingsV2 extends IBaseFinancialProjectionEntity {
  financialProjection: string; // UUID reference
  savingsAmount: number;
  currency?: string;
  unit: string;
  reasoning: string;
  savingsAssumptions: string[];
  savingsSources: ISavingsSourceV2[];
}

export interface ICreateSavingsV2 {
  savingsAmount: number;
  currency?: string;
  unit: string;
  reasoning: string;
  savingsAssumptions?: string[];
}

export interface IPatchSavingsV2 {
  savingsAmount?: number;
  currency?: string;
  unit?: string;
  reasoning?: string;
  savingsAssumptions?: string[];
}

// Target Savings Area types
export interface ITargetSavingsAreaV2 extends IBaseFinancialProjectionEntity {
  financialProjection: string; // UUID reference
  areaType: 'primary' | 'alternative';
  title: string;
  description: string;
}

export interface ICreateTargetSavingsAreaV2 {
  areaType: 'primary' | 'alternative';
  title: string;
  description: string;
}

export interface IPatchTargetSavingsAreaV2 {
  areaType?: 'primary' | 'alternative';
  title?: string;
  description?: string;
}

export interface ISavingMethodV2 extends IBaseFinancialProjectionEntity {
  financialProjection: string; // UUID reference
  type: string;
  description: string;
}

export interface ICreateSavingMethodV2 {
  type: string;
  description: string;
}

export interface IPatchSavingMethodV2 {
  type?: string;
  description?: string;
}

// Cost Interference types
export interface ICostInterferenceV2 extends IBaseFinancialProjectionEntity {
  financialProjection: string; // UUID reference
  title: string;
  interferenceInsight: string;
  mitigationStatement: string;
}

export interface ICreateCostInterferenceV2 {
  title: string;
  description: string;
  interferenceInsight: string;
  mitigationStatement: string;
}

export interface IPatchCostInterferenceV2 {
  title?: string;
  description?: string;
  interferenceInsight?: string;
  mitigationStatement?: string;
}

// Impact Sizing types
export type ImpactSizingType = 'bottom_up';

export interface IImpactSizingV2 extends IBaseFinancialProjectionEntity {
  financialProjection: string; // UUID reference
  type: ImpactSizingType;
  assumptionEntries: IImpactSizingAssumptionEntryV2[];
}

export interface ICreateImpactSizingV2 {
  type: ImpactSizingType;
}

// Impact Sizing Assumption Entry types
export type ImpactSizingOperator = '*' | '/' | '+' | '(+)' | '-' | '(-)';
export type ImpactSizingUnit = '%' | '$' | 'magnitude';

export interface IImpactSizingAssumptionEntryV2
  extends IBaseFinancialProjectionEntity {
  impactSizing: string; // UUID reference
  order: number;
  scalar: number;
  unit: ImpactSizingUnit;
  unitDescription?: string;
  operator?: ImpactSizingOperator;
  title: string;
  description: string;
  impactAssumptionSources: IImpactAssumptionSourceV2[];
}

export interface ICreateImpactSizingAssumptionEntryV2 {
  order: number;
  scalar: number;
  unit: ImpactSizingUnit;
  unitDescription?: string;
  operator?: ImpactSizingOperator;
  title: string;
  description: string;
}

export interface IPatchImpactSizingAssumptionEntryV2 {
  order?: number;
  scalar?: number;
  unit?: ImpactSizingUnit;
  unitDescription?: string;
  operator?: ImpactSizingOperator;
  title?: string;
  description?: string;
}

// Impact Assumption Source types
export interface IImpactAssumptionSourceV2
  extends IBaseFinancialProjectionEntity {
  title: string;
  url?: string;
  reasoning: string;
}

export interface ICreateImpactAssumptionSourceV2 {
  title: string;
  url?: string;
  reasoning: string;
}

// =============================================================================

export interface IFinancialProjectionResponse {
  financialProjection: IFinancialProjectionV2 | IFinancialProjection;
  isV2: boolean;
}

// Main Financial Projection V2 type
export interface IFinancialProjectionV2 extends IBaseFinancialProjectionEntity {
  // Generate Revenue related fields
  businessModel?: IBusinessModelV2;
  pricingModel?: IPricingV2;
  distributionChannels: IDistributionChannelV2[];
  costDrivers: ICostDriverV2[];
  marketSizings: IMarketSizingV2[];

  // Cost Savings related fields
  savingMethod?: ISavingMethodV2;
  savingsModel?: ISavingsV2;
  targetSavingsAreas: ITargetSavingsAreaV2[];
  costInterferences: ICostInterferenceV2[];
  impactSizings: IImpactSizingV2[];
}

// Response types for API
export interface IFinancialProjectionV2Response
  extends IFinancialProjectionV2 {}

export interface IMessageResponse {
  message: string;
}
