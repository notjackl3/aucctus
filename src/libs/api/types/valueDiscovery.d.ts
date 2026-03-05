// ==========================================
// Value Discovery Types
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

export interface IStartAssessmentPayload {
  company_name: string;
}

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
  lead_company?: string;
  lead_role?: string;
}

// --- Briefing ---

export interface IInnovationWorkflowRating {
  workflowName: string;
  currentScore: number;
  aiOpportunityScore: number;
  description: string;
  recommendation: string;
}

export interface IGap {
  area: string;
  description: string;
  severity: 'critical' | 'significant' | 'moderate';
  evidence: string;
}

export interface IAucctusCapabilityMapping {
  need: string;
  aucctusCapability: string;
  howItHelps: string;
}

export interface IActionableNextStep {
  stepNumber: number;
  title: string;
  description: string;
  timeline: string;
}

export interface IExecutiveBriefing {
  executiveSummary: string;
  aiReadinessScore: number;
  innovationWorkflowRatings: IInnovationWorkflowRating[];
  innovationBottlenecks: IGap[];
  aucctusCapabilityMapping: IAucctusCapabilityMapping[];
  actionableNextSteps: IActionableNextStep[];
  keyInsight: string;
}

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
}

// --- Assessment Detail ---

export interface IResponseDetail {
  uuid: string;
  questionOrder: number;
  questionText: string;
  questionType: string;
  questionOptions?: IQuestionOption[];
  answerText: string;
  answerSelections?: string[];
}

export interface IAssessmentDetail {
  uuid: string;
  status: string;
  companyName: string;
  industry: string;
  leadName: string;
  leadEmail: string;
  leadCompany: string;
  leadRole: string;
  briefing?: IExecutiveBriefing;
  responses: IResponseDetail[];
  createdAt: string;
  completedAt?: string;
}
