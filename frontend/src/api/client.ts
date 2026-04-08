import type { AnalysisResult, Recommendation } from '../types/analysis';

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

export function createAnalysis(
  companyName: string,
  marketSpace: string,
  companyContext?: string,
): Promise<CreateAnalysisResponse> {
  return request('/api/analyses', {
    method: 'POST',
    body: JSON.stringify({ companyName, marketSpace, companyContext: companyContext || null }),
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
