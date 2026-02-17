import {
  AssumptionCategory,
  AssumptionTestStatus,
  ConceptTestStage,
  ConceptTestStatus,
  TestType,
} from '@libs/api/types';

export const ASSUMPTION_CATEGORY_MAP: Record<
  AssumptionCategory,
  { style: string; icon: string }
> = {
  desirability: {
    style: 'bg-purple-50 [&>svg]:stroke-purple-900',
    icon: 'heart',
  },
  viability: {
    style: 'bg-success-50 [&>svg]:stroke-success-800',
    icon: 'line-chart-up',
  },

  feasibility: {
    style: 'bg-indigo-50 [&>svg]:stroke-indigo-800',
    icon: 'filecode',
  },
  adaptability: {
    style: 'bg-blue-50 [&>svg]:stroke-blue-800',
    icon: 'expand-06',
  },
};

export const TESTING_STATUS_STYLE_MAP: Record<
  AssumptionTestStatus | ConceptTestStatus,
  { icon: string; bg: string; stroke: string; svg: string; text: string }
> = {
  notStarted: {
    icon: 'play-square',
    bg: 'aucctus-bg-secondary',
    svg: '[&>svg]:stroke-gray-light-00',
    stroke: 'stroke-gray-light-700',
    text: 'aucctus-text-tertiary',
  },
  inProgress: {
    icon: 'clock-fast-forward',
    bg: 'aucctus-bg-secondary',
    svg: '[&>svg]:stroke-primary-900',
    stroke: 'stroke-primary-900',
    text: 'aucctus-text-tertiary',
  },
  partiallyValidated: {
    icon: 'loading-02',
    bg: 'bg-[#fcf7e9]',
    svg: '[&>svg]:stroke-[#b55121]',
    stroke: 'stroke-[#b55121]',
    text: 'text-[#b55121]',
  },
  completed: {
    icon: 'check',
    bg: 'bg-[#e9fbf2]',
    svg: '[&>svg]:stroke-[#117246]',
    stroke: 'stroke-[#117246]',
    text: 'text-[#117246]',
  },
  validated: {
    icon: 'check',
    bg: 'bg-[#e9fbf2]',
    svg: '[&>svg]:stroke-[#117246]',
    stroke: 'stroke-[#117246]',
    text: 'text-[#117246]',
  },
  invalidated: {
    icon: 'closeX',
    bg: 'bg-[#fcf7e9]',
    svg: '[&>svg]:stroke-[#b55121]',
    stroke: 'stroke-[#b55121]',
    text: 'text-[#b55121]',
  },
};

export const TEST_TYPE_ICON_MAP: Record<TestType, string> = {
  scanningSurvey: 'survey',
  immersiveDialogue: 'annotation-dots',
  marketPulseCheck: 'activity',
  communityScan: 'users-03',
  wizardOfOz: 'wizard-of-oz',
  marketResonance: 'market-resonance',
  actionSignal: 'signal-02',
  productBlueprint: 'product-blueprint',
  feedbackLoop: 'repeat-02',
  performanceTracking: 'line-chart-up-02',
  testDrive: 'test-drive',
  productRoadmapTesting: 'map-01',
};

export const TEST_STATUS_COLOR_MAP: Record<ConceptTestStage, string> = {
  discover: 'success-700',
  validate: 'blue-400',
  scale: 'pink-400',
};
