/**
 * Types for Concept Scoring Configuration
 */

export type Importance = 'low' | 'medium' | 'high';

export interface ScoringQuestion {
  id: string;
  text: string;
  importance: Importance;
}

export interface ScoringCategory {
  id: string;
  name: string;
  icon: string;
  questions: ScoringQuestion[];
}

export interface ImportanceConfig {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
  weight: number;
}
