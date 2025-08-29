import { CategoryState } from '../StatusDropdown/types';

export interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: IconVariant;
  completeness: number;
  confidenceScore: number;
  needsReview: boolean;
  lastUpdated: string;
  aiFindings: number;
  userContributions: number;
  pendingUpdates: number;
}

export interface CompanyContext {
  id: string;
  companyName: string;
  lastUpdated: string;
  status: string;
  overallMaturity: number;
  categories: CategoryData[];
}

export interface Answer {
  id: string;
  content: string;
  source: string;
  sourceType: 'external' | 'internal' | 'ai-reasoning';
  lastUpdated: string;
  author?: string;
}

export interface Question {
  id: string;
  question: string;
  answers: Answer[];
  isAnswered: boolean;
}

export interface CategoryStateInfo {
  state: CategoryState;
  validated: number;
  newDetails: number;
  needsInput: number;
  totalSources: number;
}

export interface RiskFactor {
  type: 'tailwind' | 'headwind' | 'watch';
  text: string;
}

export interface ProposedAddition {
  id: string;
  text: string;
  category: string;
  source: string;
}

export interface AiResearchMetric {
  name: string;
  value: number;
  icon: IconVariant;
}
