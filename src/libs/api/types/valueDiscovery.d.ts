// ==========================================
// Value Discovery Types (V2)
// ==========================================

// --- Question ---

export interface IQuestionOption {
  label: string;
  value: string;
}

export interface IQuestion {
  questionText: string;
  questionType: 'multiple_choice' | 'multi_select' | 'text_input' | 'scale';
  questionOptions?: IQuestionOption[];
}

// --- Start Assessment ---

export interface IStartAssessmentResponse {
  assessmentUuid: string;
}

// --- Submit Answer ---

export interface ISubmitAnswerPayload {
  answer_text?: string;
  answer_selections?: string[];
}

export interface ISubmitAnswerResponse {
  questionNumber: number;
}

// --- Lead Capture ---

export interface ILeadCapturePayload {
  lead_name: string;
  lead_email: string;
  lead_role?: string;
}

// --- V2 Briefing Types ---

export interface ICompanyProfile {
  companyName: string;
  industryTag: string;
  estimatedRevenue: string;
  estimatedEmployees: string;
  innovationMaturity: string;
  aiReadiness: string;
}

export interface IRecommendedEngine {
  innovationStage: string;
  engineName: string;
  description: string;
  impactScore: number;
  feasibilityScore: number;
  strategicValueScore: number;
  totalScore: number;
  priorityRank: number;
}

export interface ILowestHangingFruit {
  title: string;
  engineName: string;
  description: string;
  whyNow: string;
  titanBuildHook: string;
}

export interface IExecutiveBriefing {
  companyProfile?: ICompanyProfile;
  narrativeSummary?: string;
  recommendedEngines?: IRecommendedEngine[];
  lowestHangingFruit?: ILowestHangingFruit;
}

// --- Briefing Response ---

export interface IBriefingResponse {
  status: 'pending' | 'generating' | 'completed' | 'failed';
  briefing?: IExecutiveBriefing;
}

// --- Public Assessment ---

export interface IPublicStartAssessmentPayload {
  company_name: string;
  captcha_token: string;
  website?: string;
}

export interface IQuestionStatusResponse {
  status: 'waiting' | 'ready' | 'complete';
  question?: IQuestion;
  questionNumber: number;
  companyRecognitionMessage?: string;
}
