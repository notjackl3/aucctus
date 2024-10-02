import {
  AssumptionCategory,
  AssumptionTestStatus,
  ConceptTestStage,
  ConceptTestStatus,
  TestType,
} from '@libs/api/types';

export const ASSUMPTION_CATEGORY_MAP: Record<
  AssumptionCategory,
  { style: string; icon: IconVariant }
> = {
  desirability: {
    style: 'bg-[#ece9fe] [&>svg>use]:stroke-desirability', //'purple',
    icon: 'heart',
  },
  viability: {
    style: 'bg-[#ccfbef] [&>svg>use]:stroke-viability', //'green',
    icon: 'line-chart-up',
  },

  feasibility: {
    style: 'bg-[#cff9fe] [&>svg>use]:stroke-feasibility', // 'lightBlue',
    icon: 'filecode',
  },
  adaptability: {
    style: 'bg-[#d1e0ff] [&>svg>use]:stroke-adaptability', //'blue',
    icon: 'expand-06',
  },
};

export const VALIDATION_STATUS: AssumptionTestStatus[] = [
  'inProgress',
  'notStarted',
  'partiallyValidated',
  'validated',
];

export const TESTING_STATUS_STYLE_MAP: Record<
  AssumptionTestStatus | ConceptTestStatus,
  { icon: IconVariant; bg: string; stroke: string; svg: string; text: string }
> = {
  notStarted: {
    icon: 'play-square',
    bg: 'bg-[#f8f9fc]',
    svg: '[&>svg]:stroke-gray-500',
    stroke: 'stroke-gray-500',
    text: 'text-gray-500',
  },
  inProgress: {
    icon: 'clock-fast-forward',
    bg: 'bg-[#f8f9fc]',
    svg: '[&>svg]:stroke-gray-500',
    stroke: 'stroke-gray-500',
    text: 'text-gray-500',
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

export const TEST_TYPE_ICON_MAP: Record<TestType, IconVariant> = {
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
