import type { IBaseConceptEntity } from './concepts';

export type AssumptionTestStatus =
  | 'notStarted'
  | 'inProgress'
  | 'partiallyValidated'
  | 'validated'
  | 'invalidated';

export type TestStatus = 'notStarted' | 'inProgress' | 'completed';

/**
 * Assumption Tests:
 *
 * Discovery:
 * - Scanning Surveys
 * - Immersive Dialogues
 * - Market Pulse-checks
 * - Community Scans
 *
 * Validate:
 * - Wizard Of Oz
 * - Market Resonance
 * - Action Signals
 * - Product Blueprint
 *
 * Scale:
 * - Feedback Loops
 * - Performance Tracking
 * - Test Drives
 * - Product Roadmap Testing
 */
export type TestType =
  | 'scanningSurvey'
  | 'immersiveDialogue'
  | 'marketPulseCheck'
  | 'communityScan'
  | 'wizardOfOz'
  | 'marketResonance'
  | 'actionSignal'
  | 'productBlueprint'
  | 'feedbackLoop'
  | 'performanceTracking'
  | 'testDrive'
  | 'productRoadmapTesting';

export type ConceptTestStatus = 'notStarted' | 'inProgress' | 'completed';
export type ConceptTestStage = 'discover' | 'validate' | 'scale';

export type AssumptionCategory =
  | 'adaptability'
  | 'desirability'
  | 'feasibility'
  | 'viability';

export type RiskCategory = 'high' | 'medium' | 'low';

export interface IAssumptionCreate {
  name: string;
  hypothesis: string;
  riskLevel: number;
  difficultyLevel: number;
  impactLevel: number;
  assumptionsType: AssumptionCategory;
}

// TODO: DEPRECATE - V1 assumption interface. Remove once all components migrate to IAssumptionV2
export interface IAssumptionV1 extends IBaseConceptEntity {
  name: string;
  text: string;
  category: AssumptionCategory;

  riskCategory: RiskCategory;
  risk: number;

  importance: number;
  importanceRationale: string;
  importanceCategory: RiskCategory;

  certainty: number;
  certaintyRationale: string;
  certaintyCategory: RiskLevel;

  status: AssumptionTestStatus;

  testProgress: AssumptionTestStatus[];
}

export interface IAssumptionTestDetails extends IBaseConceptEntity {
  status: AssumptionTestStatus;
  identifier: str;
  goal: string;
  findings?: string;
  assumptionUuid: string;
  testUuid: string;
  type: TestType;
  duration: string;
  stage: ConceptTestStage;
}

export interface IConceptTestDetails extends IBaseConceptEntity {
  uuid: string;
  identifier: string;
  description: string;
  stage: ConceptTestStage;
  type: TestType;
  status: ConceptTestStatus;
  goal: string;
  findingsSummary?: string;
  startDate: string;
  endDate: string;
  runTime: string;
  assumptions: IAssumptionsToTest[];
  spec: IConceptTestSpec;
  steps: ITestStep[];
  findings: ITestFindings[];
}

export interface IConceptTestSpec {
  stage: ConceptTestStage;
  name: string;

  testedCategories: AssumptionCategory[];
  details: {
    description: string;
    whenToConduct: string;
    timeFrame: TimeFrame;
  };
  assetsAndInputs: string[];
  highLevelCharacteristics: HighLevelCharacteristics;
  bestSuitedFor: string[];
  partners: string[];
  stepByStepProcess: IConceptTestSpecStep[];
  expectedOutputs: IConceptTestExpectedOutput[];
}

export interface IAssumptionsToTest {
  name: string;
  findings?: string;
  status: AssumptionTestStatus;
  goal: string;
  category: AssumptionCategory;
  testDetailsUuid: string;
  assumptionUuid: string;
}

export interface TimeFrame {
  h?: number; // hours
  d?: number; // days
  w?: number; // weeks
  m?: number; // months
}

export interface HighLevelCharacteristics {
  costEstimate: 'low' | 'medium' | 'high';
  effortNeeded: 'low' | 'medium' | 'high';
  timeForExecution: 'short' | 'medium' | 'long';
}

export interface IConceptTestSpecStep {
  stepId: int;
  title: string;
  description: string;
}

export interface IConceptTestExpectedOutput {
  title: string;
  description: string;
}

export interface ITestFindings extends IBaseConceptEntity {
  uuid: string;
  content: string;
  testUuid: string;
}

export interface ITestStep extends IBaseConceptEntity {
  testUuid: string;
  stepId: int;
  uuid: string;
  title: string;
  description: string;
  isCompleted: boolean;
  suggestedOutputAndConsiderations: string;
}

export interface IAssumptionTestStatus {
  desirability: IAssumptionTestStatusCategory;
  feasibility: IAssumptionTestStatusCategory;
  viability: IAssumptionTestStatusCategory;
  adaptability: IAssumptionTestStatusCategory;

  overview: IAssumptionTestStatusOverview;
}

export interface IAssumptionTestStatusCategory {
  status: AssumptionTestStatus;
  testProgress: AssumptionTestStatus[];
  estimatedEndDate?: string;
}
export interface IAssumptionTestStatusOverview {
  daysRemaining?: number;
  daysPast?: number;
  riskiestCategory?: AssumptionCategory;
  riskiestCategoryStatus?: AssumptionTestStatus;
  averageDuration?: number;
  lastMonthAverageTestDuration?: number;
}

// V2 Types - updated to match actual API response
export type AssumptionStatusV2 =
  | 'validated'
  | 'unvalidated'
  | 'partially_validated'
  | 'invalidated'
  | 'untested';

export type AssumptionPriority = 'critical' | 'high' | 'medium' | 'low';

export type TestTypeV2 =
  | 'survey'
  | 'interview'
  | 'prototype'
  | 'experiment'
  | 'other';

export type TestResult = AssumptionStatusV2;

export interface AssumptionTest {
  id: string;
  name: string;
  type: TestTypeV2;
  date: string;
  result: TestResult;
}

// Updated to match actual API response structure
export interface IAssumptionV2 {
  uuid: string;
  statement: string;
  category: AssumptionCategory;
  risk: number; // 0-1 from API
  certainty: number; // 0-1 from API
  importance: number; // 0-1 from API
  certaintyCategory: RiskCategory;
  importanceCategory: RiskCategory;
  riskCategory: RiskCategory;
  validationStatus: 'validated' | 'invalidated' | 'untested'; // New field from API
  createdBy: number;
  createdAt: string;
  updatedAt: string;

  // Optional computed fields for backward compatibility
  id?: string; // Alias for uuid for backward compatibility
  status?: AssumptionStatusV2;
  confidence?: number; // Alias for certainty for backward compatibility
  impactPoints?: number; // 0-10, derived from importance
  validationPercentage?: number; // 0-100, computed validation progress
  tests?: AssumptionTest[];
  priority?: AssumptionPriority;
  benchmark?: string; // Validation benchmark for testing
  metadata?: Record<string, any>;
  lastModified?: string; // Keep for backward compatibility
}

// Color constants for assumption categories - using more subtle, balanced colors
export const CATEGORY_COLORS: Record<AssumptionCategory, string> = {
  desirability: 'bg-pink-300 hover:bg-pink-400', // Pink (like in image for d1) - lighter shade
  viability: 'bg-orange-300 hover:bg-orange-400', // Orange (like in image for v1, v2) - lighter shade
  feasibility: 'bg-blue-300 hover:bg-blue-400', // Blue (like in image for f1, f2) - lighter shade
  adaptability: 'bg-indigo-300 hover:bg-indigo-400', // Purple/indigo (like in image for a1, a2) - lighter shade
};

// Risk zone color constants - using more subtle background colors to match the image
export interface RiskZoneColor {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

export const RISK_ZONE_COLORS: Record<string, RiskZoneColor> = {
  r1: {
    bg: 'bg-error-50',
    text: 'text-error-500',
    border: 'border-error-200',
    icon: 'text-error-500',
  },
  r2: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    border: 'border-warning-200',
    icon: 'text-warning-500',
  },
  r3: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    icon: 'text-orange-500',
  },
  r4: {
    bg: 'bg-success-50',
    text: 'text-success-600',
    border: 'border-success-200',
    icon: 'text-success-500',
  },
};

// Category icon variants and styling
export interface CategoryIconStyle {
  iconVariant: 'heart' | 'currency-dollar' | 'gear' | 'refresh';
  bgClass: string;
  iconClass: string;
}

export const CATEGORY_ICONS: Record<AssumptionCategory, CategoryIconStyle> = {
  desirability: {
    iconVariant: 'heart',
    bgClass: 'bg-pink-100',
    iconClass: 'aucctus-stroke-brand-primary',
  },
  viability: {
    iconVariant: 'currency-dollar',
    bgClass: 'bg-orange-100',
    iconClass: 'aucctus-stroke-brand-primary',
  },
  feasibility: {
    iconVariant: 'gear',
    bgClass: 'bg-blue-100',
    iconClass: 'aucctus-stroke-brand-primary',
  },
  adaptability: {
    iconVariant: 'refresh',
    bgClass: 'bg-indigo-100',
    iconClass: 'aucctus-stroke-brand-primary',
  },
};

// Meter colors for certainty and importance indicators
export const getMeterValueColor = (
  value: number,
  isImportance: boolean = false,
): string => {
  if (isImportance) {
    // For importance: high = red, medium = amber, low = green
    if (value >= 66) return 'aucctus-bg-error-solid';
    if (value >= 33) return 'aucctus-bg-warning-solid';
    return 'aucctus-bg-success-solid';
  } else {
    // For certainty: low = red, medium = amber, high = green
    if (value >= 66) return 'aucctus-bg-success-solid';
    if (value >= 33) return 'aucctus-bg-warning-solid';
    return 'aucctus-bg-error-solid';
  }
};

export const getMeterValueTextColor = (
  value: number,
  isImportance: boolean = false,
): string => {
  if (isImportance) {
    // For importance: high = red, medium = amber, low = green
    if (value >= 66) return 'aucctus-text-error-primary';
    if (value >= 33) return 'aucctus-text-warning-primary';
    return 'aucctus-text-success-primary';
  } else {
    // For certainty: low = red, medium = amber, high = green
    if (value >= 66) return 'aucctus-text-success-primary';
    if (value >= 33) return 'aucctus-text-warning-primary';
    return 'aucctus-text-error-primary';
  }
};

export const getMeterValueText = (value: number): string => {
  if (value >= 66) return 'High';
  if (value >= 33) return 'Medium';
  return 'Low';
};

// TODO: DEPRECATE - Backward compatibility alias. Remove once all references use IAssumptionV1 explicitly
// Backward compatibility - keep IAssumption as alias to V1
export type IAssumption = IAssumptionV1;
