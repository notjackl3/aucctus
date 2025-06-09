export interface MarketMetrics {
  tam: number;
  sam: number;
  som: number;
}

export interface ProjectionSettings {
  growthRate: number;
  timeHorizon: number;
  churnRate: number;
  initialCustomers: number;
  costSavingsPerUser: number;
}
