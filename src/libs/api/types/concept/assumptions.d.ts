import type { IBaseConceptEntity } from './concepts';

type AssumptionTestStatus =
  | 'notStarted'
  | 'inProgress'
  | 'partiallyValidated'
  | 'validated'
  | 'invalidated';

type TestStatus = 'notStarted' | 'inProgress' | 'completed';

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
type TestType =
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

type ConceptTestStatus = 'notStarted' | 'inProgress' | 'completed';
type ConceptTestStage = 'discover' | 'validate' | 'scale';

type AssumptionCategory =
  | 'adaptability'
  | 'desirability'
  | 'feasibility'
  | 'viability';

type RiskCategory = 'high' | 'medium' | 'low';

interface IAssumptionCreate {
  name: string;
  hypothesis: string;
  riskLevel: number;
  difficultyLevel: number;
  impactLevel: number;
  assumptionsType: AssumptionCategory;
}

interface IAssumption extends IBaseConceptEntity {
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

interface IAssumptionTestDetails extends IBaseConceptEntity {
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

interface IConceptTestDetails extends IBaseConceptEntity {
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

interface IConceptTestSpec {
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

interface IAssumptionsToTest {
  name: string;
  findings?: string;
  status: AssumptionTestStatus;
  goal: string;
  category: AssumptionCategory;
  testDetailsUuid: string;
  assumptionUuid: string;
}

interface TimeFrame {
  h?: number; // hours
  d?: number; // days
  w?: number; // weeks
  m?: number; // months
}

interface HighLevelCharacteristics {
  costEstimate: 'low' | 'medium' | 'high';
  effortNeeded: 'low' | 'medium' | 'high';
  timeForExecution: 'short' | 'medium' | 'long';
}

interface IConceptTestSpecStep {
  stepId: int;
  title: string;
  description: string;
}

interface IConceptTestExpectedOutput {
  title: string;
  description: string;
}

interface ITestFindings extends IBaseConceptEntity {
  uuid: string;
  content: string;
  testUuid: string;
}

interface ITestStep extends IBaseConceptEntity {
  testUuid: string;
  stepId: int;
  uuid: string;
  title: string;
  description: string;
  isCompleted: boolean;
  suggestedOutputAndConsiderations: string;
}

interface IAssumptionTestStatus {
  desirability: IAssumptionTestStatusCategory;
  feasibility: IAssumptionTestStatusCategory;
  viability: IAssumptionTestStatusCategory;
  adaptability: IAssumptionTestStatusCategory;

  overview: IAssumptionTestStatusOverview;
}

interface IAssumptionTestStatusCategory {
  status: AssumptionTestStatus;
  testProgress: AssumptionTestStatus[];
  estimatedEndDate?: string;
}
interface IAssumptionTestStatusOverview {
  daysRemaining?: number;
  daysPast?: number;
  riskiestCategory?: AssumptionCategory;
  riskiestCategoryStatus?: AssumptionTestStatus;
  averageDuration?: number;
  lastMonthAverageTestDuration?: number;
}
