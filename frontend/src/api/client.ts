import type { AnalysisResult, DecisionQuestion, ApplyAnswersResult, Recommendation } from '../types/analysis';

// ── Types for API responses ──

export interface CreateAnalysisResponse {
  id: string;
  operationId: string;
}

export interface OperationProgress {
  currentStep: string;
  stepsCompleted: number;
  stepsTotal: number;
}

export interface OperationResponse {
  id: string;
  operationType: string;
  parentId: string | null;
  status: 'pending' | 'running' | 'completed' | 'completed_with_warnings' | 'error';
  progress: OperationProgress | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AnalysisSummary {
  id: string;
  companyName: string;
  marketSpace: string;
  status: string;
  recommendation: Recommendation | null;
  score: number | null;
  confidenceLevel: string | null;
  confidenceScore: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CompanyResponse {
  id: string;
  name: string;
  context: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface DocumentResponse {
  id: string;
  companyId: string;
  filename: string;
  contentType: string;
  summary: string | null;
  chunkCount: number;
  createdAt: string;
}

export interface StrategyLens {
  id: string;
  companyId: string;
  version: number;
  confidenceNote: string | null;
  builtAt: string;
  [key: string]: unknown;
}

// ── Fetch helper ──

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json();
}

// ── API functions ──

export function createAnalysis(params: {
  companyName: string;
  marketSpace: string;
  companyContext?: string;
  companyId?: string;
  framingQuestion?: string;
}): Promise<CreateAnalysisResponse> {
  return request('/api/analyses', {
    method: 'POST',
    body: JSON.stringify({
      companyName: params.companyName,
      marketSpace: params.marketSpace,
      companyContext: params.companyContext || null,
      companyId: params.companyId || null,
      framingQuestion: params.framingQuestion || null,
    }),
  });
}

export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const data = await request<AnalysisResult>(`/api/analyses/${id}`);
  // Normalize recommendation to lowercase ('Go' → 'go', 'No-Go' → 'no-go')
  if (data.opportunityAssessment) {
    const raw = data.opportunityAssessment.recommendation;
    data.opportunityAssessment.recommendation = raw.toLowerCase() as Recommendation;
  }
  return data;
}

export function getOperation(id: string): Promise<OperationResponse> {
  return request(`/api/operations/${id}`);
}

// ── History (analyses list) ──

export async function listAnalyses(): Promise<AnalysisSummary[]> {
  const data = await request<AnalysisSummary[]>('/api/analyses');
  return data.map((a) => ({
    ...a,
    recommendation: a.recommendation
      ? (a.recommendation.toLowerCase() as Recommendation)
      : null,
  }));
}

export async function deleteAnalysis(id: string): Promise<void> {
  const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }
}

// ── Companies ──

export function listCompanies(): Promise<CompanyResponse[]> {
  return request('/api/companies');
}

export function createCompany(
  name: string,
  context?: string,
): Promise<CompanyResponse> {
  return request('/api/companies', {
    method: 'POST',
    body: JSON.stringify({ name, context: context || null }),
  });
}

export function updateCompanyContext(
  companyId: string,
  context: string,
): Promise<{ status: string }> {
  return request(`/api/companies/${companyId}/context`, {
    method: 'PUT',
    body: JSON.stringify({ context }),
  });
}

// ── Strategy Lens ──

export function getStrategy(companyId: string): Promise<StrategyLens> {
  return request(`/api/companies/${companyId}/strategy`);
}

export function buildStrategy(companyId: string): Promise<StrategyLens> {
  return request(`/api/companies/${companyId}/strategy`, { method: 'POST' });
}

// ── Documents ──

export function listDocuments(companyId: string): Promise<DocumentResponse[]> {
  return request(`/api/documents/by-company/${companyId}`);
}

export async function extractTextFromFile(
  file: File,
): Promise<{ text: string; filename: string }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/documents/extract-text', { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json();
}

// ── Decision Questions ──

export function getDecisionQuestions(analysisId: string): Promise<DecisionQuestion[]> {
  return request(`/api/analyses/${analysisId}/decision-questions`);
}

export function answerDecisionQuestion(
  analysisId: string,
  questionId: string,
  answerValue: string,
): Promise<DecisionQuestion> {
  return request(`/api/analyses/${analysisId}/decision-questions/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ answerValue }),
  });
}

export function generateDecisionQuestion(analysisId: string): Promise<DecisionQuestion> {
  return request(`/api/analyses/${analysisId}/decision-questions/generate`, { method: 'POST' });
}

export function replaceDecisionQuestion(
  analysisId: string,
  questionId: string,
): Promise<DecisionQuestion> {
  return request(`/api/analyses/${analysisId}/decision-questions/${questionId}/replace`, {
    method: 'POST',
  });
}

export function applyAnswers(analysisId: string): Promise<ApplyAnswersResult> {
  return request(`/api/analyses/${analysisId}/apply-answers`, { method: 'POST' });
}

// ── Ask about selection ──

export function askAboutSelection(
  analysisId: string,
  params: {
    selectedText: string;
    question: string;
    blockCategory: string;
    blockLabel: string;
  },
): Promise<{ answer: string }> {
  return request(`/api/analyses/${analysisId}/ask`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Documents ──

export async function uploadDocument(
  companyId: string,
  file: File,
): Promise<{ documentId: string; operationId: string; status: string }> {
  const form = new FormData();
  form.append('company_id', companyId);
  form.append('file', file);
  const res = await fetch('/api/documents', { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json();
}
