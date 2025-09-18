/**
 * Configuration constants and types for Concept Overview components
 * Contains UI text, timing constants, and type definitions used by components
 */

// Type Definitions
export type RiskLevel = 'high' | 'medium' | 'low';

export type AssumptionCategory =
  | 'desirability'
  | 'viability'
  | 'feasibility'
  | 'adaptability';

export type TrendCategoryType =
  | 'health'
  | 'consumer'
  | 'economic'
  | 'technology'
  | 'regulatory'
  | 'social';

export type PlayerType = 'startups' | 'incumbents';

export type BusinessMetricType = 'model' | 'price' | 'revenue';

// UI Text Constants for Executive Dashboard
export interface IExecutiveDashboardUIText {
  marketSize: {
    title: string;
    detailsButton: string;
  };
  conceptVisualization: {
    altText: string;
    badgeText: string;
  };
  sections: {
    whatIsIt: string;
    valueProposition: string;
    problemStatement: string;
    differentiators: string;
    ourRightToWin: string;
  };
}

export const executiveDashboardUIText: IExecutiveDashboardUIText = {
  marketSize: {
    title: 'Market Size',
    detailsButton: 'Details',
  },
  conceptVisualization: {
    altText: 'Concept Visualization',
    badgeText: 'Concept Visualization',
  },
  sections: {
    whatIsIt: 'What is it?',
    valueProposition: 'Value Proposition',
    problemStatement: 'Problem Statement',
    differentiators: 'Differentiators',
    ourRightToWin: 'Our Right to Win',
  },
};

// Auto-progression timing constants
export const EXECUTIVE_DASHBOARD_CONFIG = {
  CARD_DURATION: 5000, // 5 seconds per card
  PROGRESS_INTERVAL: 50, // Update progress every 50ms
};

// Interface definitions for component props and data structures
export interface IMarketSizeData {
  tam: string;
  sam: string;
  som: string;
  marketSummary: string;
  growthTrajectory: string;
}

export interface IConceptOverview {
  name: string;
  status: string;
  conceptVisualizationImage: string;
  whatIsIt: string;
  valueProposition: string;
  problemStatement: string;
}

export interface IDifferentiator {
  id: string;
  title: string;
  description: string;
}

export interface IRightToWin {
  id: string;
  title: string;
  description: string;
}

export interface IRiskCategory {
  id: string;
  name: string;
  category: AssumptionCategory;
  risk: string;
  riskLevel: RiskLevel;
  riskValue: number;
  iconVariant: string;
}

export interface IKeyAssumptionsSummary {
  biggestRisk: string;
  summary: string;
}

export interface ICustomerProfile {
  id: string;
  name: string;
  avatar: string;
  isPrimary: boolean;
  segment: string;
  initials: string;
  gradientColors: string;
}

export interface ICustomerProfilesSummary {
  primarySegment: string;
  painPoint: string;
  solution: string;
}

export interface ITrendCategory {
  id: string;
  name: string;
  type: TrendCategoryType;
  iconVariant: string;
  radarValue: number;
}

export interface ITrendsDriversSummary {
  summary: string;
  keyInsight: string;
}

export interface IEcosystemPlayer {
  id: string;
  type: PlayerType;
  name: string;
  count: number;
  iconVariant: string;
  description: string;
}

export interface IEcosystemSummary {
  summary: string;
  keyDifferentiator: string;
  totalCompetitors: number;
}

export interface IBusinessMetric {
  id: string;
  type: BusinessMetricType;
  label: string;
  value: string;
  iconVariant: string;
  colorTheme: 'primary' | 'success' | 'info';
}

export interface IBusinessModelSummary {
  summary: string;
  distributionSplit: {
    wholesale: number;
    directToConsumer: number;
  };
  keyInsight: string;
}
