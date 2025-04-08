export interface IAiEditingSuggestion {
  section:
    | 'overview'
    | 'market_scan'
    | 'assumptions'
    | 'customer_profiles'
    | 'financial_projection'
    | 'risks'
    | 'next_steps';
  title: string;
  content: string;
  reason: string;
}

export interface IConceptReportEdit {
  response: string;
  edits: IAiEditingSuggestion[];
  uuid: string;
}
