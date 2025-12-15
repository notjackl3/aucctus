/**
 * Idea Playground Type Definitions
 *
 * This file exports both API types (from @libs/api/types) and
 * display/UI types that are used by Idea Playground components.
 */

// ============================================
// API Types (Re-exported from @libs/api/types)
// ============================================
export type {
  IAnchorThought,
  IAnchorQuestion,
  IResearchInsight,
  IPossibleAnswer,
  IUserAnswer,
  IGeneratedIdeaPlaygroundConcept,
  QuestionType,
  ConceptType,
  CitationValidationStatus,
} from '@libs/api/types';

// Import for local use in this file
import type { CitationValidationStatus } from '@libs/api/types';

// ============================================
// Display/UI Types
// ============================================
// These types are used for display purposes in UI components
// and may differ slightly from the raw API response types
export interface Question {
  id: string;
  question: string;
  explanation: string;
  answer?: string;
  label: string;
  isCustomQuestion?: boolean; // True if user-created, false/undefined if AI-generated
}

export interface InsightCard {
  id: string;
  insight: string;
  source: string;
  type: 'data' | 'trend' | 'research' | 'example' | 'manual';
  sentiment: 'headwind' | 'tailwind' | 'neutral';
  isManual?: boolean;
  isSaved?: boolean;
  userAnswerUuid?: string;
  url?: string;
  moreDetails?: string | null;
  whyItMatters?: {
    goodNews: string;
    badNews: string;
  } | null;
  citationValidationStatus?: CitationValidationStatus;
}

export interface SavedItem {
  id: string;
  title: string;
  type: 'data' | 'trend' | 'research' | 'example';
  detail: string;
  timestamp: Date;
}

export interface ConceptIdea {
  uuid: string;
  title: string;
  icon: any;
}
