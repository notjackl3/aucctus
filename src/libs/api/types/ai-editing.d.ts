export type AllEditableConceptSections =
  // Top-level
  | 'overview'
  | 'market_scan'
  | 'ecosystem_v2'
  | 'financial_projection'
  | 'assumptions'
  | 'tests'
  // Concept subsections
  | 'concept_title'
  | 'concept_overview'
  | 'concept_value_proposition'
  | 'concept_problem_statement'
  | 'what_is_this'
  | 'should_we_do_this'
  | 'regenerate_image'
  | 'differentiators'
  | 'rights_to_win'
  // Trends subsections
  | 'trends_analysis'
  | 'trends_key_findings'
  | 'trends_priority_insights'
  | 'trends_market_forces'
  // Ecosystem subsections
  | 'ecosystem_v2_full'
  | 'ecosystem_v2_startups'
  | 'ecosystem_v2_incumbents'
  | 'ecosystem_v2_competitive_forces'
  | 'ecosystem_v2_crowdedness'
  | 'ecosystem_v2_future_predictions'
  // Financial subsections
  | 'savings_method'
  | 'savings'
  | 'target_savings_areas'
  | 'cost_interferences'
  | 'impact_sizing'
  | 'business_model'
  | 'pricing'
  | 'distribution_channels'
  | 'cost_drivers'
  | 'top_down_market_sizing'
  | 'bottom_up_market_sizing'
  // Customer profile subsections
  | 'customer_profiles'
  | 'customer_jobs'
  | 'customer_pains'
  | 'customer_alternatives'
  | 'customer_journey_steps'
  | 'customer_real_world_signals';

export interface IAiEditingSuggestion {
  section: AllEditableConceptSections;
  title: string;
  description: string;
  reason: string;
  icon?: IconVariant;
}

export interface IConceptReportEdit {
  reply: string;
  edits: IAiEditingSuggestion[];
  uuid: string;
}

export interface IAiEditingContext {
  uuid: string;
  conceptUuid: string;
  sessionId: string;
  name: string;
  timestamp: number;
}
