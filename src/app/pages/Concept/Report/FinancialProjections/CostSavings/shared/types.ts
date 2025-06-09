export interface SavingsMetrics {
  totalSavings: number;
  annualSavings: number;
  savingsOpportunity: number;
}

export interface ProjectionSettings {
  growthRate: number;
  timeHorizon: number;
  churnRate: number;
  initialCustomers: number;
  costSavingsPerUser: number;
}
