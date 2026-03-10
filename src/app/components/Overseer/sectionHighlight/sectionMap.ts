import { AppPath } from '@routes/routes';

/**
 * Maps section IDs to the concept sub-route that renders them.
 */
/**
 * Account-level page IDs that map to top-level routes (no concept context needed).
 */
export const ACCOUNT_LEVEL_SECTIONS = new Set([
  'nucleus',
  'watchtower',
  'competitor_assessment',
  'idea_playground',
  'innovation_pipeline',
  'concept_bank',
  'settings',
]);

const SECTION_TO_ROUTE: Record<string, AppPath> = {
  // Account-level pages
  nucleus: AppPath.Nucleus,
  watchtower: AppPath.Watchtower,
  competitor_assessment: AppPath.CompetitorAssessment,
  idea_playground: AppPath.IdeaPlayground,
  innovation_pipeline: AppPath.InnovationPipeline,
  concept_bank: AppPath.ConceptBank,
  settings: AppPath.Settings,
  // Overview
  overview: AppPath.ConceptOverview,
  concept_title: AppPath.ConceptOverview,
  concept_overview: AppPath.ConceptOverview,
  concept_value_proposition: AppPath.ConceptOverview,
  concept_problem_statement: AppPath.ConceptOverview,
  what_is_this: AppPath.ConceptOverview,
  should_we_do_this: AppPath.ConceptOverview,
  gut_check: AppPath.ConceptOverview,
  differentiators: AppPath.ConceptOverview,
  rights_to_win: AppPath.ConceptOverview,
  regenerate_image: AppPath.ConceptOverview,
  // Market Scan
  market_scan: AppPath.ConceptMarketScan,
  trends_full: AppPath.ConceptMarketScan,
  trends_market_forces: AppPath.ConceptMarketScan,
  trends_priority_insights: AppPath.ConceptMarketScan,
  trends_analysis: AppPath.ConceptMarketScan,
  trends_key_findings: AppPath.ConceptMarketScan,
  ecosystem_v2_full: AppPath.ConceptMarketScan,
  ecosystem_v2_startups: AppPath.ConceptMarketScan,
  ecosystem_v2_incumbents: AppPath.ConceptMarketScan,
  ecosystem_v2_competitive_forces: AppPath.ConceptMarketScan,
  ecosystem_v2_crowdedness: AppPath.ConceptMarketScan,
  ecosystem_v2_future_predictions: AppPath.ConceptMarketScan,
  ecosystem_v2: AppPath.ConceptMarketScan,
  // Financial Projection
  financial_projection: AppPath.ConceptFinancialProjection,
  financial_projection_full: AppPath.ConceptFinancialProjection,
  business_model: AppPath.ConceptFinancialProjection,
  pricing: AppPath.ConceptFinancialProjection,
  distribution_channels: AppPath.ConceptFinancialProjection,
  cost_drivers: AppPath.ConceptFinancialProjection,
  top_down_market_sizing: AppPath.ConceptFinancialProjection,
  bottom_up_market_sizing: AppPath.ConceptFinancialProjection,
  savings_method: AppPath.ConceptFinancialProjection,
  savings: AppPath.ConceptFinancialProjection,
  target_savings_areas: AppPath.ConceptFinancialProjection,
  cost_interferences: AppPath.ConceptFinancialProjection,
  impact_sizing: AppPath.ConceptFinancialProjection,
  // Customer Profile
  customer_profiles: AppPath.ConceptCustomerProfile,
  customer_jobs: AppPath.ConceptCustomerProfile,
  customer_pains: AppPath.ConceptCustomerProfile,
  customer_alternatives: AppPath.ConceptCustomerProfile,
  customer_journey_steps: AppPath.ConceptCustomerProfile,
  customer_real_world_signals: AppPath.ConceptCustomerProfile,
  // Assumptions & Testing
  assumptions: AppPath.ConceptKeyAssumptions,
  tests: AppPath.ConceptTesting,
};

export function resolveRouteForSection(sectionId: string): AppPath | null {
  return SECTION_TO_ROUTE[sectionId] ?? null;
}

/**
 * Maps granular backend section IDs to the `data-section-id` attribute values
 * used in the DOM. When a section has no direct DOM match, falls back to parent.
 */
const SECTION_FALLBACK_MAP: Record<string, string> = {
  // Concept overview
  concept_value_proposition: 'concept_value_proposition',
  concept_problem_statement: 'concept_problem_statement',
  concept_overview: 'concept_overview',
  concept_title: 'overview',
  what_is_this: 'concept_overview',
  should_we_do_this: 'concept_overview',
  gut_check: 'gut_check',
  differentiators: 'differentiators',
  rights_to_win: 'rights_to_win',
  regenerate_image: 'overview',
  overview: 'overview',
  // Trends
  trends_full: 'market_scan',
  trends_market_forces: 'trends_market_forces',
  trends_priority_insights: 'trends_priority_insights',
  trends_analysis: 'trends_analysis',
  trends_key_findings: 'trends_analysis',
  market_scan: 'market_scan',
  // Ecosystem
  ecosystem_v2_full: 'ecosystem_v2',
  ecosystem_v2_startups: 'ecosystem_v2_startups',
  ecosystem_v2_incumbents: 'ecosystem_v2_incumbents',
  ecosystem_v2_competitive_forces: 'ecosystem_v2_competitive_forces',
  ecosystem_v2_crowdedness: 'ecosystem_v2_crowdedness',
  ecosystem_v2_future_predictions: 'ecosystem_v2_future_predictions',
  ecosystem_v2: 'ecosystem_v2',
  // Financial
  financial_projection_full: 'financial_projection',
  business_model: 'business_model',
  pricing: 'pricing',
  distribution_channels: 'distribution_channels',
  cost_drivers: 'cost_drivers',
  top_down_market_sizing: 'top_down_market_sizing',
  bottom_up_market_sizing: 'bottom_up_market_sizing',
  savings_method: 'savings_method',
  savings: 'savings',
  target_savings_areas: 'target_savings_areas',
  cost_interferences: 'cost_interferences',
  impact_sizing: 'impact_sizing',
  financial_projection: 'financial_projection',
  // Customer profiles
  customer_profiles: 'customer_profiles',
  customer_jobs: 'customer_jobs',
  customer_pains: 'customer_pains',
  customer_alternatives: 'customer_alternatives',
  customer_journey_steps: 'customer_journey_steps',
  customer_real_world_signals: 'customer_real_world_signals',
  // Assumptions & Tests
  assumptions: 'assumptions',
  tests: 'tests',
};

export function resolveSectionElement(sectionId: string): HTMLElement | null {
  const targetId = SECTION_FALLBACK_MAP[sectionId] ?? sectionId;
  return document.querySelector<HTMLElement>(`[data-section-id="${targetId}"]`);
}
