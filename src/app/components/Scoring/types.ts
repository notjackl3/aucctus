/**
 * Shared types for scoring display components.
 *
 * These types provide a common interface that works with both:
 * - Concept priority scoring (ICategoryScore from scoring-config.d.ts)
 * - Submission scoring (ICategoryScoreDetail from ideaSubmissions.ts)
 */

/**
 * Importance level for scoring questions
 */
export type QuestionImportance = 'low' | 'medium' | 'high';

/**
 * A single question with its score
 */
export interface IScoringQuestion {
  questionUuid: string;
  questionText: string;
  score: number;
  importance: QuestionImportance;
  /** Optional AI reasoning for this score (submissions have this) */
  reasoning?: string;
}

/**
 * A scoring category with its questions
 */
export interface IScoringCategory {
  categoryUuid: string;
  categoryName: string;
  categoryIcon: string;
  score: number;
  maxScore: number;
  questions: IScoringQuestion[];
}

/**
 * Props for the ScoringCategoryCard component
 */
export interface ScoringCategoryCardProps {
  category: IScoringCategory;
  /** Whether scores can be edited */
  variant?: 'readonly' | 'editable';
  /** Local question score overrides (for optimistic updates) */
  questionScores?: Record<string, number>;
  /** Callback when a score is changed (editable mode only) */
  onScoreChange?: (questionId: string, score: number) => void;
  /** Whether an update is in progress */
  isUpdating?: boolean;
  /** Which question is currently being updated */
  updatingQuestionId?: string | null;
  /** Whether to show per-question reasoning (submissions have this) */
  showQuestionReasoning?: boolean;
}

/**
 * Props for the ScoringCriteriaSection component
 */
export interface ScoringCriteriaSectionProps {
  categories: IScoringCategory[];
  totalScore: number;
  /** Whether scores can be edited */
  variant?: 'readonly' | 'editable';
  /** Local question score overrides (for optimistic updates) */
  questionScores?: Record<string, number>;
  /** Callback when a score is changed (editable mode only) */
  onScoreChange?: (questionId: string, score: number) => void;
  /** Callback when configure button is clicked */
  onConfigureClick?: () => void;
  /** Whether to show the configure criteria button */
  showConfigButton?: boolean;
  /** Whether an update is in progress */
  isUpdating?: boolean;
  /** Which question is currently being updated */
  updatingQuestionId?: string | null;
  /** Whether to show per-question reasoning */
  showQuestionReasoning?: boolean;
  /** Additional className for the container */
  className?: string;
}
