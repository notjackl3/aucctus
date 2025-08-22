// Test Result Types
export interface ITestResult {
  uuid: string;
  title: string;
  description?: string;
  fileType: string;
  testDetailsUuid: string;
  sourceUuid: string;
  fileUrl: string;
  filePath: string;
  fileSize: number;
  originalFilename: string;
  summary?: string;
  learnings?: ITestLearning[];
  createdAt: string;
  updatedAt: string;
  editRecommendations?: IEditRecommendation[];
  files: ITestFile[];
}

export interface ITestFile {
  uuid: string;
  originalFilename: string;
  fileExtension: string;
  fileSize: number;
  fileUrl: string;
  filePath: string;
  createdAt: string;
}

// Test Learning Types
export interface ITestLearning {
  uuid: string;
  learning: string;
  impact: string;
  testResultUuid: string;
  createdAt: string;
  updatedAt: string;
  sourceUuid: string;
  sourceFilename: string;
}

// Edit Recommendation Types
export interface IEditRecommendation {
  title: string;
  reason: string;
  section: string;
  description: string;
  testEvidence: string;
}

// Test Collateral Types
export type CollateralType = 'text' | 'image' | 'file';

export interface ITestCollateral {
  id: string;
  title: string;
  description: string;
  type: CollateralType;
  content: string;
  format?: string; // for files: pdf, docx, etc.
  createdAt: string;
  updatedAt: string;
}

// Test Status Types
export type TestExecutionStatus = 'notStarted' | 'inProgress' | 'completed';

// Test Execution Mode Types
export type TestExecutionMode =
  | 'facilitated'
  | 'expertLed'
  | 'automated'
  | 'synthetic';
