export interface Assumption {
  id: string;
  description: string;
  category?: string;
  confidence?: number;
  risk?: 'high' | 'medium' | 'low';
  status?: 'validated' | 'invalidated' | 'untested';
  benchmark?: string;
}

export interface Test {
  id: string;
  testName: string;
  description: string;
  type: 'recommended' | 'manual';
  status: 'completed' | 'in-progress' | 'planned';
  assumptions: Assumption[];
  date?: string;
  results?: TestResult;
  apiData?: {
    testType: string;
    objective: string;
    methodology?: string;
    targetParticipants: number;
    insight?: string;
    createdAt: string;
    updatedAt: string;
    resultsCount?: number;
    learningsCount?: number;
    recommendationsCount?: number;
  };
}

export interface TestResult {
  status: 'validated' | 'invalidated' | 'mixed';
  summary: string;
  learnings: string[];
  nextSteps?: string[];
}

export interface RecommendedTest {
  testName: string;
  description: string;
  testDetails: ITestDetails;
}

// API Types for Testing Endpoints
export interface ITestDetails {
  uuid: string;
  name: string;
  description: string;
  objective: string;
  methodology?: string;
  testType:
    | 'usability'
    | 'ab'
    | 'survey'
    | 'interview'
    | 'focus_group'
    | 'prototype'
    | 'other';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetParticipants: number;
  createdBy: {
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  assumptions: ITestAssumptionDetailed[];
  createdAt: string;
  updatedAt: string;
  concept: number;
  notes: string;
}

export interface ITestDetailsCreate {
  name: string;
  description: string;
  objective: string;
  methodology?: string;
  testType?:
    | 'usability'
    | 'ab'
    | 'survey'
    | 'interview'
    | 'focus_group'
    | 'prototype'
    | 'other';
  targetParticipants?: number;
}

export interface ITestDetailsUpdate {
  name?: string;
  description?: string;
  objective?: string;
  methodology?: string;
  testType?:
    | 'usability'
    | 'ab'
    | 'survey'
    | 'interview'
    | 'focus_group'
    | 'prototype'
    | 'other';
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetParticipants?: number;
}

export interface ITestCollateral {
  uuid: string;
  title: string;
  description: string;
  type: 'text' | 'image' | 'file' | 'url' | 'prototype' | 'survey' | 'guide';
  content: string;
  format?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITestCollateralCreate {
  title: string;
  description: string;
  type?: 'text' | 'image' | 'file' | 'url' | 'prototype' | 'survey' | 'guide';
  content: string;
  test_details_uuid?: string;
  format?: string;
  order?: number;
}

export interface ITestCollateralUpdate {
  title?: string;
  description?: string;
  type?: 'text' | 'image' | 'file' | 'url' | 'prototype' | 'survey' | 'guide';
  content?: string;
  format?: string;
  order?: number;
}

export interface ITestParticipant {
  uuid: string;
  customerProfileUuid: string;
  count: number;
  notes: string;
  status: 'invited' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  testDetailsUuid: string;
  customerProfile: {
    name: string;
    segment: string;
    description: string;
    geoLocation: string;
    familySize: number;
    isPrimary: boolean;
    jobs: Array<{
      uuid: string;
      description: string;
      order: number;
      icon: string;
    }>;
    pains: Array<{
      uuid: string;
      description: string;
      order: number;
      icon: string;
    }>;
    avatarUrl: string;
    ageRange: string;
    incomeRange: string;
    jobsToBeDoneInsight: string;
    painsInsight: string;
    alternativesInsight: string;
    journeyInsight: string;
    id: number;
    version: number;
    uuid: string;
    ageUpper: number;
    ageLower: number;
    incomeUpper: number;
    incomeLower: number;
    educationLevel: string;
    occupation: string;
    customerInsight: string;
    createdAt: string;
    updatedAt: string;
  };
  ratioPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITestParticipantCreate {
  customerProfileUuid: string;
  count?: number;
  status?: 'invited' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  notes?: string;
}

export interface ITestParticipantUpdate {
  customerProfileUuid?: string;
  count?: number;
  status?: 'invited' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  notes?: string;
}

export interface ITestResult {
  uuid: string;
  title: string;
  description?: string;
  fileType:
    | 'pdf'
    | 'docx'
    | 'xlsx'
    | 'csv'
    | 'txt'
    | 'mp4'
    | 'mp3'
    | 'json'
    | 'other';
  filePath: string;
  fileSize: number;
  originalFilename: string;
  downloadUrl?: string; // Pre-signed S3 URL
  createdAt: string;
  updatedAt: string;
}

export interface ITestResultCreate {
  title: string;
  description?: string;
  fileType:
    | 'pdf'
    | 'docx'
    | 'xlsx'
    | 'csv'
    | 'txt'
    | 'mp4'
    | 'mp3'
    | 'json'
    | 'other';
  filePath: string;
  fileSize?: number;
  originalFilename: string;
}

export interface ITestResultUpdate {
  title?: string;
  description?: string;
  fileType?:
    | 'pdf'
    | 'docx'
    | 'xlsx'
    | 'csv'
    | 'txt'
    | 'mp4'
    | 'mp3'
    | 'json'
    | 'other';
  filePath?: string;
  fileSize?: number;
  originalFilename?: string;
}

export interface ITestAssumption {
  uuid: string;
  statement: string;
  certainty: number;
  importance: number;
  risk: number;
  category: string;
  certaintyCategory: 'low' | 'medium' | 'high';
  importanceCategory: 'low' | 'medium' | 'high';
  riskCategory: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
  createdAt: string;
  lastModified: string;
}

export interface ITestAssumptionCreate {
  assumption_uuid: string;
}

export interface ITestAssumptionUpdate {
  validationStatus?: 'validated' | 'invalidated' | 'untested';
  benchmark?: string;
  notes?: string;
}

// Extended test assumption interface matching API response from test details
export interface ITestAssumptionDetailed extends ITestAssumption {
  testDetailsUuid: string;
  assumptionUuid: string;
  validationStatus: 'validated' | 'invalidated' | 'untested';
  benchmark: string;
  testName: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  updatedAt: string;
}

// Legacy interface for backward compatibility
export interface ITestAssumptionExtended extends ITestAssumption {
  testDetailsUuid: string;
  assumptionUuid: string;
  validationStatus: 'validated' | 'invalidated' | 'untested';
  benchmark: string;
  testName: string;
}

// Extended test details interface matching API response
export interface ITestDetailsExtended extends ITestDetails {
  assumptions: ITestAssumptionDetailed[];
  insight?: string;
}

// Pagination response type
export interface IPageResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}
