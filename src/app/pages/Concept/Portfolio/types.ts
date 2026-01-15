/**
 * Types for Portfolio Tab components
 */

export type ConceptStage =
  | 'Ideating'
  | 'In Review'
  | 'Prototyping'
  | 'POC'
  | 'MVP'
  | 'Commercialized';

export interface HighScoringConcept {
  id: string;
  uuid: string; // Concept UUID for fetching overview data
  title: string;
  description: string;
  imageUrl?: string;
  score: number;
  strategicPillar: string;
  pillarColor: string;
  stage: ConceptStage;
  owner: {
    name: string;
    initials: string;
  };
}

export interface HorizonData {
  horizon: 'H1' | 'H2' | 'H3';
  label: string;
  count: number;
  percentage: number;
  color: string;
  description: string;
}

export interface PortfolioInsight {
  id: string;
  headline: string;
  context: string;
  soWhat: string;
}

export const STAGE_STYLES: Record<
  ConceptStage,
  { bg: string; text: string; border: string }
> = {
  Ideating: {
    bg: 'aucctus-bg-purple-subtle',
    text: 'aucctus-text-purple-primary',
    border: 'border-purple-200',
  },
  'In Review': {
    bg: 'aucctus-bg-secondary',
    text: 'aucctus-text-secondary',
    border: 'aucctus-border-secondary',
  },
  Prototyping: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
  },
  POC: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  MVP: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  Commercialized: {
    bg: 'aucctus-bg-success-subtle',
    text: 'aucctus-text-success-primary',
    border: 'border-emerald-200',
  },
};
