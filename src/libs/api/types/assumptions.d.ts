import { IBaseConceptEntity } from './concepts';

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
  | 'scanningSurveys'
  | 'immersiveDialogues'
  | 'marketPulse-checks'
  | 'communityScans'
  | 'wizardOfOz'
  | 'marketResonance'
  | 'actionSignals'
  | 'productBlueprint'
  | 'feedbackLoops'
  | 'performanceTracking'
  | 'testDrives'
  | 'productRoadmapTesting';

type AssumptionCategory =
  | 'adaptability'
  | 'desirability'
  | 'feasibility'
  | 'viability';

type RiskCategory = 'high' | 'medium' | 'low';

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

  testProgress: [AssumptionTestStatus];
}

export interface IAssumptionTestDetails extends IBaseConceptEntity {
  status: AssumptionTestStatus;
  identifier: str;
  goal: string;
  findings?: string;
  assumptionUuid: string;
  testUuid: string;
  type: AssumptionTest;
}
