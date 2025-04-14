export interface IAiEditingSuggestion {
  section:
    | 'overview'
    | 'market_scan'
    | 'assumptions'
    | 'customer_profiles'
    | 'financial_projection';
  title: string;
  description: string;
  reason: string;
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
