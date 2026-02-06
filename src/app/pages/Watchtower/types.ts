/**
 * Watchtower Signal Types and Interfaces
 */

import type { IConceptImpactAssessment } from '@libs/api/types/watchtower';

export type SignalType = 'threat' | 'opportunity' | 'watch';
export type SignalCategory =
  | 'competition'
  | 'market'
  | 'technology'
  | 'regulatory'
  | 'capital';
export type TimeHorizon = 'immediate' | 'strategic' | 'horizon';
export type Confidence = 'high' | 'medium' | 'low';

export interface SignalSource {
  title: string;
  excerpt: string;
  type: 'News' | 'Report' | 'Filing' | 'Internal' | 'Analysis';
}

export interface SignalEvidence {
  title: string;
  description: string;
  status: string;
  signalCount: number;
  companies: string[];
}

export interface Signal {
  id: string;
  title: string;
  type: SignalType;
  category: SignalCategory;
  confidence: Confidence;
  timeHorizon: TimeHorizon;
  timeHorizonLabel: string;
  radarDistance: number; // 0-1, where 0 is center (immediate) and 1 is edge (horizon)
  radarAngle: number; // 0-180 degrees for half circle
  recommendedAction: string;
  whatChanged: string;
  whyItMatters: string;
  likelyImpact: string;
  isNew?: boolean;
  isTracked?: boolean; // whether the signal is pinned/tracked by the user
  dateAdded: string;
  evidence: SignalEvidence[];
  sources: SignalSource[];
  conceptImpacts?: IConceptImpactAssessment[]; // Optional concept impact assessments
}

export interface ImpactedConcept {
  id: string;
  conceptName: string;
  impact: string;
  suggestedChange: string;
  image: string;
}

/**
 * Rich source data for predictions - compatible with ISource.
 * Includes citations (verbatim quotes) for evidence-backed predictions.
 */
export interface PredictionSource {
  uuid: string;
  title: string;
  url: string;
  citations?: string; // Verbatim quotes from the source
  description?: string;
  classification?: string;
}

export interface Prediction {
  id: string;
  title: string;
  description: string;
  sources: PredictionSource[];
  hasAiReasoning?: boolean;
}

export interface TrendBullet {
  text: string;
  highlight?: string;
  highlightColor?: string;
}

export type TimePeriod = '6mo' | '12mo' | '12plus';

export interface FutureDomain {
  id: string;
  name: string;
  description: string;
  opportunity: string;
  relatedSignals: string[];
  timeframe: string;
}

export interface ConceptOpportunity {
  id: string;
  title: string;
  description: string;
  signalBasis: string;
  urgency: 'immediate' | 'strategic' | 'exploratory';
  potentialImpact: string;
  image: string;
}

// Signal type configuration
export const signalTypeConfig: Record<
  SignalType,
  {
    color: string;
    bgColor: string;
    lightBg: string;
    borderColor: string;
    textColor: string;
    label: string;
  }
> = {
  threat: {
    color: 'hsl(0, 84%, 60%)',
    bgColor: 'bg-red-500',
    lightBg: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    label: 'Threat',
  },
  opportunity: {
    color: 'hsl(142, 76%, 36%)',
    bgColor: 'bg-green-500',
    lightBg: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    label: 'Opportunity',
  },
  watch: {
    color: 'rgba(255, 255, 255, 0.25)',
    bgColor: 'bg-white/20',
    lightBg: 'bg-slate-50',
    borderColor: 'border-white/30',
    textColor: 'text-slate-700',
    label: 'Neutral',
  },
};

// Category configuration
export const signalCategoryConfig: Record<
  SignalCategory,
  { label: string; iconVariant: string }
> = {
  competition: { label: 'Competition', iconVariant: 'swords' },
  market: { label: 'Market / Demand', iconVariant: 'currencydollar' },
  technology: { label: 'Technology & Capability', iconVariant: 'beaker' },
  regulatory: { label: 'Regulatory & Policy', iconVariant: 'legal' },
  capital: { label: 'Capital & Ecosystem', iconVariant: 'bank' },
};
