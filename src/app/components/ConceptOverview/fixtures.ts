import { IMarketForceV3 } from '@libs/api/types/concept/marketScan';

/**
 * Fixture data for Concept Overview components
 * Contains all placeholder data used in concept overview components
 */

// Market Size Data
export interface IMarketSizeData {
  tam: string;
  sam: string;
  som: string;
  marketSummary: string;
  growthTrajectory: string;
}

export const mockMarketSizeData: IMarketSizeData = {
  tam: '$44B',
  sam: '$12B',
  som: '$2.3M',
  marketSummary:
    'The high-protein snack market is $44B with strong growth trajectory driven by health-conscious consumers.',
  growthTrajectory: 'strong growth trajectory',
};

// Concept Overview Data
export interface IConceptOverview {
  name: string;
  status: string;
  conceptVisualizationImage: string;
  whatIsIt: string;
  valueProposition: string;
  problemStatement: string;
}

export const mockConceptOverview: IConceptOverview = {
  name: 'High Protein Cheese Bites',
  status: 'Ideating',
  conceptVisualizationImage:
    '/lovable-uploads/541b3075-e942-4c32-ba4c-1361518af849.png',
  whatIsIt:
    'Convenient, shelf-stable cheese crisps that deliver 8-10 grams of premium protein per serving in delicious, bite-sized formats.',
  valueProposition:
    'High-protein nutrition on-the-go that satisfy cravings while supporting fitness and wellness goals.',
  problemStatement:
    'Health-conscious consumers struggle to find convenient, protein-rich snacks without compromising taste.',
};

// Differentiators Data
export interface IDifferentiator {
  id: string;
  title: string;
  description: string;
}

export const mockDifferentiators: IDifferentiator[] = [
  {
    id: '1',
    title: 'Highest protein density in portable format',
    description: 'Leading the market in protein per serving ratio',
  },
  {
    id: '2',
    title: 'Shelf-stable without refrigeration',
    description: 'Convenient storage and transportation',
  },
  {
    id: '3',
    title: 'Premium taste with clean ingredients',
    description: 'Natural ingredients without compromising flavor',
  },
];

// Right to Win Data
export interface IRightToWin {
  id: string;
  title: string;
  description: string;
}

export const mockRightToWin: IRightToWin[] = [
  {
    id: '1',
    title: 'Established Walmart distribution partnership',
    description: 'Direct access to major retail network',
  },
  {
    id: '2',
    title: 'Proprietary shelf-stable technology',
    description: 'Unique manufacturing process advantage',
  },
  {
    id: '3',
    title: 'Strong margin economics with scale',
    description: 'Profitable unit economics at volume',
  },
];

// Key Assumptions Risk Data
export type RiskLevel = 'high' | 'medium' | 'low';
export type AssumptionCategory =
  | 'desirability'
  | 'viability'
  | 'feasibility'
  | 'adaptability';

export interface IRiskCategory {
  id: string;
  name: string;
  category: AssumptionCategory;
  risk: string;
  riskLevel: RiskLevel;
  riskValue: number;
  iconVariant: string;
}

export const mockRiskCategories: IRiskCategory[] = [
  {
    id: '1',
    name: 'Desirability',
    category: 'desirability',
    risk: 'Medium',
    riskLevel: 'medium',
    riskValue: 42, // Average of risks: (25+40+60)/3 = 42
    iconVariant: 'heart',
  },
  {
    id: '2',
    name: 'Viability',
    category: 'viability',
    risk: 'High',
    riskLevel: 'high',
    riskValue: 60, // Average of risks: (45+75)/2 = 60
    iconVariant: 'currencydollar',
  },
  {
    id: '3',
    name: 'Feasibility',
    category: 'feasibility',
    risk: 'Low',
    riskLevel: 'low',
    riskValue: 35, // Average of risks: (20+50+35)/3 = 35
    iconVariant: 'gear',
  },
  {
    id: '4',
    name: 'Adaptability',
    category: 'adaptability',
    risk: 'Medium',
    riskLevel: 'medium',
    riskValue: 58, // Average of risks: (55+60)/2 = 57.5
    iconVariant: 'refresh',
  },
];

// Key Assumptions Summary Data
export interface IKeyAssumptionsSummary {
  biggestRisk: string;
  summary: string;
}

export const mockKeyAssumptionsSummary: IKeyAssumptionsSummary = {
  biggestRisk: 'Direct-to-consumer acquisition costs are unsustainable',
  summary:
    'Direct-to-consumer acquisition costs are unsustainable - test B2B wholesale partnerships immediately to find profitable distribution.',
};

// Customer Profiles Data
export interface ICustomerProfile {
  id: string;
  name: string;
  avatar: string;
  isPrimary: boolean;
  segment: string;
  initials: string;
  gradientColors: string;
}

export const mockCustomerProfiles: ICustomerProfile[] = [
  {
    id: '1',
    name: 'Sarah Lim',
    avatar: '/lovable-uploads/c1ba4695-971e-4a27-8415-11de202d84c6.png',
    isPrimary: true,
    segment: 'Global Students',
    initials: 'SL',
    gradientColors: 'from-blue-400 to-blue-600',
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: '', // Empty avatar - will use initials
    isPrimary: false,
    segment: 'Small Business Owners',
    initials: 'MC',
    gradientColors: 'from-blue-400 to-blue-600',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: '', // Empty avatar - will use initials
    isPrimary: false,
    segment: 'Travellers',
    initials: 'EW',
    gradientColors: 'from-green-400 to-green-600',
  },
];

export interface ICustomerProfilesSummary {
  primarySegment: string;
  painPoint: string;
  solution: string;
}

export const mockCustomerProfilesSummary: ICustomerProfilesSummary = {
  primarySegment: 'Global Students',
  painPoint:
    'experience the highest pain to be solved, finding limited nutritious options on campus and needing high-protein snacks between classes',
  solution:
    'Global Students experience the highest pain to be solved, finding limited nutritious options on campus and needing high-protein snacks between classes.',
};

// Trends & Drivers Data
export type TrendCategoryType =
  | 'health'
  | 'consumer'
  | 'economic'
  | 'technology'
  | 'regulatory'
  | 'social';

export interface ITrendCategory {
  id: string;
  name: string;
  type: TrendCategoryType;
  iconVariant: string;
  radarValue: number;
}

export const mockTrendCategories: ITrendCategory[] = [
  {
    id: '1',
    name: 'Health Trends',
    type: 'health',
    iconVariant: 'line-chart-up',
    radarValue: 2.3,
  },
  {
    id: '2',
    name: 'Consumer Behavior',
    type: 'consumer',
    iconVariant: 'users-03',
    radarValue: 3.1,
  },
  {
    id: '3',
    name: 'Economic Factors',
    type: 'economic',
    iconVariant: 'currencydollar',
    radarValue: 6.2,
  },
  {
    id: '4',
    name: 'Technology',
    type: 'technology',
    iconVariant: 'lightbulb',
    radarValue: 4.5,
  },
  {
    id: '5',
    name: 'Regulatory',
    type: 'regulatory',
    iconVariant: 'shield-dollar',
    radarValue: 7.8,
  },
  {
    id: '6',
    name: 'Social Factors',
    type: 'social',
    iconVariant: 'globe',
    radarValue: 2.9,
  },
];

export interface ITrendsDriversSummary {
  summary: string;
  keyInsight: string;
}

export const mockTrendsDriversSummary: ITrendsDriversSummary = {
  summary:
    'FDA reforms and health trends accelerate entry, but EU regulations increase costs 15-25% within 18 months.',
  keyInsight:
    'Regulatory landscape presents both opportunities and challenges for market entry.',
};

// Ecosystem Data
export type PlayerType = 'startups' | 'incumbents';

export interface IEcosystemPlayer {
  id: string;
  type: PlayerType;
  name: string;
  count: number;
  iconVariant: string;
  description: string;
}

export const mockEcosystemPlayers: IEcosystemPlayer[] = [
  {
    id: '1',
    type: 'startups',
    name: 'Startups',
    count: 28,
    iconVariant: 'lightbulb',
    description: 'Emerging companies disrupting the market',
  },
  {
    id: '2',
    type: 'incumbents',
    name: 'Incumbents',
    count: 12,
    iconVariant: 'building',
    description: 'Established market leaders',
  },
];

export interface IEcosystemSummary {
  summary: string;
  keyDifferentiator: string;
  totalCompetitors: number;
}

export const mockEcosystemSummary: IEcosystemSummary = {
  summary:
    'Moderately crowded market with 40+ competitors. Key differentiators: shelf-stable technology and Walmart partnerships.',
  keyDifferentiator: 'shelf-stable technology and Walmart partnerships',
  totalCompetitors: 40,
};

// Business Model Data
export type BusinessMetricType = 'model' | 'price' | 'revenue';

export interface IBusinessMetric {
  id: string;
  type: BusinessMetricType;
  label: string;
  value: string;
  iconVariant: string;
  colorTheme: 'primary' | 'success' | 'info';
}

export const mockBusinessMetrics: IBusinessMetric[] = [
  {
    id: '1',
    type: 'model',
    label: 'Model',
    value: 'B2B2C',
    iconVariant: 'package',
    colorTheme: 'primary',
  },
  {
    id: '2',
    type: 'price',
    label: 'Price',
    value: '$4.99',
    iconVariant: 'currencydollar',
    colorTheme: 'success',
  },
  {
    id: '3',
    type: 'revenue',
    label: 'Revenue',
    value: '$2.3M',
    iconVariant: 'line-chart-up',
    colorTheme: 'info',
  },
];

export interface IBusinessModelSummary {
  summary: string;
  distributionSplit: {
    wholesale: number;
    directToConsumer: number;
  };
  keyInsight: string;
}

export const mockBusinessModelSummary: IBusinessModelSummary = {
  summary:
    'B2B2C hybrid model targeting 65% wholesale distribution and 35% direct-to-consumer sales.',
  distributionSplit: {
    wholesale: 65,
    directToConsumer: 35,
  },
  keyInsight:
    'Balanced approach leveraging both wholesale partnerships and direct customer relationships.',
};

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

export const mockExecutiveDashboardUIText: IExecutiveDashboardUIText = {
  marketSize: {
    title: 'Market Size',
    detailsButton: 'Details',
  },
  conceptVisualization: {
    altText: 'Savory Cheese Protein Bites Product',
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

export const mockMarketForces: IMarketForceV3[] = [
  {
    uuid: 'c1a3d8f2-24a1-4a59-9b6d-8e91d2e7d012',
    category: 'Political',
    icon: 'government',
    summary:
      'New data privacy regulations are increasing compliance requirements.',
    impact:
      'High – may require significant investment in security and legal reviews.',
  },
  {
    uuid: 'f4e7b0a9-6e5f-4d3c-84c2-7a2b5a18a5f3',
    category: 'Economic',
    icon: 'trending-up',
    summary: 'Rising interest rates are slowing access to affordable capital.',
    impact: 'Medium – could delay expansion plans but not current operations.',
  },
  {
    uuid: 'ab9e3c5f-12d8-46af-bd92-77e1c9f4a238',
    category: 'Social',
    icon: 'users',
    summary:
      'Consumers are showing stronger preference for sustainable products.',
    impact:
      'High – presents both opportunity for differentiation and risk of reputational damage if ignored.',
  },
  {
    uuid: '7f3e6b1a-9d52-4c77-8c15-5b3c7e4e1241',
    category: 'Technological',
    icon: 'cpu',
    summary:
      'Rapid adoption of AI is transforming industry standards and competition.',
    impact:
      'Very High – failure to adapt could result in loss of market position.',
  },
  {
    uuid: 'e2d5a6c9-4c8a-4f3b-8d27-1f6e9a3b2a90',
    category: 'Environmental',
    icon: 'leaf',
    summary: 'Stricter carbon emission policies are being enforced globally.',
    impact:
      'High – compliance will require investment in greener infrastructure.',
  },
  {
    uuid: '9d8f7c2b-11a3-45bc-bfa8-2d7a8c3e4b91',
    category: 'Legal',
    icon: 'scale',
    summary: 'Intellectual property disputes are increasing within the sector.',
    impact: 'Medium – could slow product releases and increase legal costs.',
  },
];
