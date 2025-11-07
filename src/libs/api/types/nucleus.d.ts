// Nucleus Report Type Definitions
// Based on Osiris schemas in apps/accounts/schemas/nucleus_report.py

export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';
export type Priority = 'P1' | 'P2' | 'P3';
export type Answerability = 'public' | 'internal' | 'mixed';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AssessmentStatus =
  | 'validated'
  | 'new_details'
  | 'needs_input'
  | 'researching';

export type SectionType =
  | 'basic_profile' // Company Identity & Value Proposition
  | 'geographic' // Geographic Footprint & Market Presence
  | 'strategic' // Corporate Strategy & Strategic Priorities
  | 'products_services' // Offerings & Business Units
  | 'ecosystem' // Ecosystem & Partnerships
  | 'technology' // Innovation Capability & Risk Profile
  | 'organizational' // Customers & Market Insights
  | 'brand_communications' // Brand & Reputation
  | 'talent_culture' // Operating Model & Core Capabilities
  | 'financial'; // Financial Performance & Resource Allocation

export interface NucleusAnswerSource {
  uuid: string;
  url?: string;
  title: string;
  description?: string;
  citations?: string;
  credibilityScore?: number;
  confidenceLevel?: ConfidenceLevel;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface NucleusReportAnswer {
  uuid: string;
  answer: string;
  isAiReasoning: boolean;
  isAiGenerated: boolean;
  sources: NucleusAnswerSource[];
  createdAt: string;
  updatedAt: string;
}

export interface NucleusReportQuestion {
  uuid: string;
  question: string;
  whyItMatters: string;
  priority: Priority;
  answerability: Answerability;
  answers: NucleusReportAnswer[];
  assessmentStatus: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NucleusReportSection {
  uuid: string;
  sectionType: SectionType;
  title: string;
  description?: string;
  order: number;
  questions: NucleusReportQuestion[];
  assessmentStatus?: AssessmentStatus;
  includeDeepResearchContext: boolean;
  hoursSaved: number;
  createdAt: string;
  updatedAt: string;
}

export interface NucleusReport {
  uuid: string;
  processingStatus: ProcessingStatus;
  headquartersVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
  sections: NucleusReportSection[];
}

// Simplified list schema for overview/summary views
export interface NucleusReportListItem {
  uuid: string;
  processingStatus: ProcessingStatus;
  createdAt: string;
  updatedAt: string;
  sectionsCount: number;
  questionsCount: number;
  answersCount: number;
}

// Create/Update schemas (if needed in the future)
export interface NucleusReportCreateRequest {
  // Nucleus reports are created automatically by agents
}

export interface NucleusReportUpdateRequest {
  processingStatus?: ProcessingStatus;
}

// API Response types
export interface NucleusReportResponse {
  success: boolean;
  data?: NucleusReport;
  error?: string;
  code?: string;
}

export interface NucleusReportListResponse {
  success: boolean;
  data?: NucleusReportListItem[];
  error?: string;
  code?: string;
}

// CRUD Request types for Questions and Answers
export interface NucleusQuestionCreateRequest {
  question: string;
  whyItMatters: string;
  priority?: Priority;
  answerability?: Answerability;
  assessmentStatus?: AssessmentStatus;
}

export interface NucleusQuestionUpdateRequest {
  question?: string;
  whyItMatters?: string;
  priority?: Priority;
  answerability?: Answerability;
  assessmentStatus?: AssessmentStatus;
}

export interface NucleusAnswerSourceCreateRequest {
  url?: string;
  title: string;
  description?: string;
  citations?: string;
  credibilityScore?: number;
  confidenceLevel?: ConfidenceLevel;
}

export interface NucleusAnswerCreateRequest {
  answer: string;
  sources: NucleusAnswerSourceCreateRequest[];
}

export interface NucleusAnswerUpdateRequest {
  answer?: string;
  sources?: NucleusAnswerSourceCreateRequest[];
}

// Section CRUD Request types
export interface NucleusSectionUpdateRequest {
  title?: string;
  description?: string;
  order?: number;
  assessmentStatus?: AssessmentStatus;
  includeDeepResearchContext?: boolean;
}

export type PhaseStatus =
  | 'PHASE_0_INITIALIZATION'
  | 'PHASE_1_QUESTIONS_GENERATED'
  | 'PHASE_2_ANSWERS_GENERATED'
  | 'PHASE_3_VALIDATED';

/**
 * Section-level progress information
 */
export interface NucleusReportSectionProgress {
  totalQuestions: number;
  questionsWithAnswers: number;
  questionsValidated: number;
  progressPercent: number;
  currentPhase: PhaseStatus;
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  estimatedTotalSeconds: number;
}

export interface NucleusReportAnswerProgress {
  questionUuid: string;
  answerText: string;
  sectionType: string;
}

/**
 * Overall progress for the latest nucleus report
 * Returned by /api/v1/nucleus-reports/latest/progress endpoint
 */
export interface NucleusReportProgress {
  reportUuid: string;
  emailWhenReadyEnabled: boolean;
  totalSections: number;
  sectionsPhase1Complete: number;
  sectionsPhase2Complete: number;
  sectionsPhase3Complete: number;
  overallProgressPercent: number;
  totalQuestions: number;
  totalQuestionsWithAnswers: number;
  totalQuestionsValidated: number;
  estimatedTotalSeconds: number;
  startTime: number;
  sections: {
    basicProfile?: NucleusReportSectionProgress;
    geographic?: NucleusReportSectionProgress;
    strategic?: NucleusReportSectionProgress;
    productsServices?: NucleusReportSectionProgress;
    ecosystem?: NucleusReportSectionProgress;
    technology?: NucleusReportSectionProgress;
    organizational?: NucleusReportSectionProgress;
    brandCommunications?: NucleusReportSectionProgress;
    talentCulture?: NucleusReportSectionProgress;
    financial?: NucleusReportSectionProgress;
  };
  recentAnswers: NucleusReportAnswerProgress[];
  headquartersVideoUrl: string;
}
