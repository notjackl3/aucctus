import type { ConceptStatus, IConcept } from '@libs/api/types';

export type PipelineStage =
  | 'discovery'
  | 'prototyping'
  | 'proofOfConcept'
  | 'mvp'
  | 'scaling';

export interface PipelineStageConfig {
  key: PipelineStage;
  label: string;
  statusList: ConceptStatus[];
  color: {
    bg: string;
    bgLight: string;
    text: string;
    border: string;
    accent: string;
    dot: string;
  };
  icon: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    key: 'discovery',
    label: 'Discovery',
    statusList: ['ideating', 'inReview'],
    color: {
      bg: 'bg-indigo-600',
      bgLight: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      accent: 'bg-indigo-500',
      dot: 'bg-indigo-500',
    },
    icon: 'search-refraction',
  },
  {
    key: 'prototyping',
    label: 'Prototyping',
    statusList: ['prototyping'],
    color: {
      bg: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      accent: 'bg-amber-500',
      dot: 'bg-amber-500',
    },
    icon: 'cube',
  },
  {
    key: 'proofOfConcept',
    label: 'Proof of Concept',
    statusList: ['proofOfConcept'],
    color: {
      bg: 'bg-orange-500',
      bgLight: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      accent: 'bg-orange-500',
      dot: 'bg-orange-500',
    },
    icon: 'beaker',
  },
  {
    key: 'mvp',
    label: 'MVP',
    statusList: ['minimumViableProduct'],
    color: {
      bg: 'bg-success-600',
      bgLight: 'bg-success-50',
      text: 'text-success-700',
      border: 'border-success-200',
      accent: 'bg-success-500',
      dot: 'bg-success-500',
    },
    icon: 'rocket',
  },
  {
    key: 'scaling',
    label: 'Scaling',
    statusList: ['commercialized'],
    color: {
      bg: 'bg-cyan-600',
      bgLight: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      accent: 'bg-cyan-500',
      dot: 'bg-cyan-500',
    },
    icon: 'trending-up',
  },
];

// Map pipeline stage to target status when dropping a card
export const STAGE_TO_TARGET_STATUS: Record<PipelineStage, ConceptStatus> = {
  discovery: 'ideating',
  prototyping: 'prototyping',
  proofOfConcept: 'proofOfConcept',
  mvp: 'minimumViableProduct',
  scaling: 'commercialized',
};

export type ConceptsByStage = Record<PipelineStage, IConcept[]>;

// Helper to get stage config by key
export const getStageConfig = (
  stageKey: PipelineStage,
): PipelineStageConfig => {
  return PIPELINE_STAGES.find((s) => s.key === stageKey) || PIPELINE_STAGES[0];
};

// Helper to get stage config by concept status
export const getStageConfigByStatus = (
  status: ConceptStatus,
): PipelineStageConfig | undefined => {
  return PIPELINE_STAGES.find((s) => s.statusList.includes(status));
};
