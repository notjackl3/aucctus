export interface IKeyFinding {
  uuid: string;
  text: string;
  source: string;
  type: string;
  direction: 'up' | 'down';
}

export interface ITrend {
  uuid: string;
  category:
    | 'Political'
    | 'Economic'
    | 'Social'
    | 'Technological'
    | 'Environmental'
    | 'Legal';
  icon: string;
  summary: string;
  impact: string;
  key_finding: IKeyFinding[];
}

// API request/response interfaces
export interface ICreateTrendRequest {
  category: string;
  icon: string;
  summary: string;
  impact: string;
}

export interface IUpdateTrendRequest {
  category?: string;
  icon?: string;
  summary?: string;
  impact?: string;
}

export interface ICreateKeyFindingRequest {
  text: string;
  source: string;
  type: string;
  direction: 'up' | 'down';
}

export interface IUpdateKeyFindingRequest {
  text?: string;
  source?: string;
  type?: string;
  direction?: 'up' | 'down';
}

// Response interfaces
export interface ITrendResponse {
  success: boolean;
  message: string;
  trend?: ITrend;
}

export interface IKeyFindingResponse {
  success: boolean;
  message: string;
  key_finding?: IKeyFinding;
}

export interface ITrendsListResponse {
  success: boolean;
  trends: ITrend[];
}

export interface IKeyFindingsListResponse {
  success: boolean;
  key_finding: IKeyFinding[];
}
