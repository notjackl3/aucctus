export interface IConceptTrainingDocument {
  uuid: string;
  conceptUuid: string;
  filename: string;
  fileType: string;
  fileUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  documentSummary: string;
  documentType: string;
  uploadedAt: string;
  processedAt: string | null;
}

export interface IConceptTrainingDocumentUploadResponse {
  uuid: string;
  filename: string;
  fileType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  message: string;
}

export interface IConceptEvidence {
  uuid: string;
  conceptUuid: string;
  trainingDocumentUuid: string | null;
  type: 'document';
  title: string;
  source: string;
  sourceTag: string;
  excerpt: string;
  relevance: 'high' | 'medium' | 'low';
  suggestedUpdate: string;
  targetSection: string;
  targetField: string;
  action: 'add' | 'change' | 'inform';
  confidence: number;
  status: 'pending' | 'accepted' | 'ignored';
  discoveredAt: string;
  reviewedAt: string | null;
}

export type ConceptEvidenceStatus = 'pending' | 'accepted' | 'ignored' | 'all';

export interface IConceptDocumentProcessingProgress {
  isProcessing: boolean;
  documentUuid: string;
  stage: string;
  progress: number;
  message: string;
}
