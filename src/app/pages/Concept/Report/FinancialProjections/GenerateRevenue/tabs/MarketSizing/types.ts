import { MarketSizeType } from './styles/marketSizeStyles';

export interface Assumption {
  id: string;
  name: string;
  value: number;
  description: string;
  type: MarketSizeType;
  unit: string;
  color?: string;
  source?: string;
  sourceDescription?: string;
  sourceUrl?: string;
  sourceIconUrl?: string;
}

export interface AssumptionCard {
  id: string;
  name: string;
  value: number;
  description: string;
  unit: string;
  min?: number;
  max?: number;
}
