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

export interface IAssumption extends IBaseConceptEntity {
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
