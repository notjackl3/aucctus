import type {
  IConceptOverview,
  ICustomerProfile,
  IExecutiveSummaries,
  IFeatureVersions,
} from './concept/concepts';
import type {
  IMarketScan,
  IEcosystemV2Response,
  ITrendV3,
  IMarketForceV3,
  IPriorityInsightV3,
} from './concept/marketScan';
import type { IFinancialProjection } from './concept/financialProjection';
import type { IAssumptionV2 } from './concept/assumptions';
import type { ITestResult as ITestResultApi } from './concept/testing';
import type {
  ITestDetails,
  ITestParticipant,
  ITestCollateral,
} from '../../../app/pages/Concept/Report/Testing/types';

export interface IShareInfo {
  conceptTitle: string;
  accountName: string;
  accountLogoUrl: string | null;
  requiredEmailDomain: string;
  isExpired: boolean;
}

export interface ISharedReportConcept {
  uuid: string;
  identifier: string;
  title: string;
  summary: string | null;
  status: string;
  reportStatusAggregate: string | null;
  financialProjectionType: 'cost_savings' | 'generate_revenue' | null;
  conceptImageUrl: string | null;
  hasSeed: boolean;
  seedUuid: string | null;
  seedType: string | null;
  overviewVersion: string;
}

export interface ISharedReportIgnitionAnswer {
  questionIdentifier: string;
  questionText: string;
  answer: string[];
  details: string | null;
}

export interface ISharedReportSeed {
  uuid: string;
  title: string | null;
  description: string | null;
  sourceType: string;
  answers: ISharedReportIgnitionAnswer[];
}

export interface ISharedReportSectionStatus {
  status: string;
  dateStarted: string | null;
  dateCompleted: string | null;
}

export interface ISharedReportStatusBySection {
  overview: ISharedReportSectionStatus;
  marketScan: ISharedReportSectionStatus;
  ecosystem: ISharedReportSectionStatus;
  trends: ISharedReportSectionStatus;
  assumptions: ISharedReportSectionStatus;
  customerProfiles: ISharedReportSectionStatus;
  financialProjection: ISharedReportSectionStatus;
}

/** Extended test details from the shared report endpoint — includes nested sub-entities. */
export interface ISharedTestDetails extends ITestDetails {
  participants?: ITestParticipant[];
  collaterals?: ITestCollateral[];
  results?: ITestResultApi[];
}

export interface ISharedReport {
  concept: ISharedReportConcept;
  accountName: string;
  sharedByName: string;

  featureVersions: IFeatureVersions;
  reportStatusBySection: ISharedReportStatusBySection | null;

  seed: ISharedReportSeed | null;

  overview: IConceptOverview | null;
  marketScan: IMarketScan | null;
  ecosystem: IEcosystemV2Response | null;
  trends: ITrendV3[] | null;
  marketForces: IMarketForceV3[] | null;
  priorityInsights: IPriorityInsightV3[] | null;
  financialProjection: IFinancialProjection | null;
  customerProfiles: ICustomerProfile[] | null;
  assumptions: IAssumptionV2[] | null;
  testingAssumptions: IAssumptionV2[] | null;
  testingTests: ISharedTestDetails[] | null;
  executiveSummaries: IExecutiveSummaries | null;
}

export interface ISendCodeRequest {
  email: string;
  captchaToken: string;
  website?: string;
}

export interface IVerifyCodeRequest {
  email: string;
  code: string;
}

export interface IConceptShare {
  uuid: string;
  recipientEmail: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  lastAccessedAt: string | null;
  accessCount: number;
  token: string | null;
}

export interface IShareConfig {
  accountDomain: string;
  senderDomain: string;
  allowedDomains: string[];
}

export interface ICreateShareRequest {
  recipientEmail: string;
}
