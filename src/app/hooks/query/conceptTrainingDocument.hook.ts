import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import {
  ConceptEvidenceStatus,
  IConceptDocumentProcessingProgress,
  IConceptEvidence,
  IConceptTrainingDocument,
} from '@libs/api/types/conceptTrainingDocument';
import type {
  IConceptDocumentProcessingProgressMessage,
  IConceptDocumentProcessingCompletedMessage,
  IConceptDocumentProcessingErrorMessage,
  IConceptEvidenceDiscoveredMessage,
} from '@libs/api/types/socketMessages/inbound';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { AxiosError } from 'axios';
import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const conceptDocumentKeys = {
  all: ['conceptDocuments'] as const,
  trainingDocuments: (identifier: string) =>
    [...conceptDocumentKeys.all, 'trainingDocuments', identifier] as const,
  evidence: (identifier: string) =>
    [...conceptDocumentKeys.all, 'evidence', identifier] as const,
};

const STALE_TIME = 1000 * 60 * 2; // 2 minutes

// ---------------------------------------------------------------------------
// Training Document Queries
// ---------------------------------------------------------------------------

export const useConceptTrainingDocuments = (identifier: string) => {
  const query = useQuery({
    queryKey: conceptDocumentKeys.trainingDocuments(identifier),
    queryFn: async (): Promise<IConceptTrainingDocument[]> => {
      return await api.concept.getTrainingDocuments(identifier);
    },
    enabled: !!identifier,
    staleTime: STALE_TIME,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        toast.error(
          'Failed to Load Documents',
          'Unable to load training documents.',
        );
      }
    },
  });

  return {
    documents: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// ---------------------------------------------------------------------------
// Training Document Mutations
// ---------------------------------------------------------------------------

export const useUploadConceptTrainingDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      identifier,
      file,
    }: {
      identifier: string;
      file: File;
    }) => {
      return await api.concept.uploadTrainingDocument(identifier, file);
    },
    onSuccess: (result, { identifier }) => {
      queryClient.invalidateQueries({
        queryKey: conceptDocumentKeys.trainingDocuments(identifier),
      });
      toast.success(
        'Document Uploaded',
        `${result.filename} is being processed.`,
      );
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Upload Failed', message || 'Unable to upload document.');
    },
  });

  return {
    uploadDocument: mutation.mutate,
    uploadDocumentAsync: mutation.mutateAsync,
    isUploading: mutation.isLoading,
  };
};

export const useDeleteConceptTrainingDocument = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      identifier,
      documentUuid,
    }: {
      identifier: string;
      documentUuid: string;
    }) => {
      return await api.concept.deleteTrainingDocument(identifier, documentUuid);
    },
    onSuccess: (_, { identifier }) => {
      queryClient.invalidateQueries({
        queryKey: conceptDocumentKeys.trainingDocuments(identifier),
      });
      queryClient.invalidateQueries({
        queryKey: conceptDocumentKeys.evidence(identifier),
      });
      toast.success('Document Deleted', 'Training document removed.');
    },
    onError: (e: AxiosError) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Delete Failed', message || 'Unable to delete document.');
    },
  });

  return {
    deleteDocument: mutation.mutate,
    isDeleting: mutation.isLoading,
  };
};

// ---------------------------------------------------------------------------
// Evidence Queries
// ---------------------------------------------------------------------------

export const useConceptEvidence = (
  identifier: string,
  status?: ConceptEvidenceStatus,
) => {
  const query = useQuery({
    queryKey: [...conceptDocumentKeys.evidence(identifier), status],
    queryFn: async (): Promise<IConceptEvidence[]> => {
      return await api.concept.getEvidence(identifier, status);
    },
    enabled: !!identifier,
    staleTime: STALE_TIME,
    onError: (e: AxiosError) => {
      if (e.response?.status !== 404) {
        toast.error(
          'Failed to Load Evidence',
          'Unable to load evidence items.',
        );
      }
    },
  });

  return {
    evidence: query.data || [],
    pendingCount: query.data?.filter((e) => e.status === 'pending').length || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// ---------------------------------------------------------------------------
// WebSocket Events
// ---------------------------------------------------------------------------

const DEFAULT_PROCESSING_PROGRESS: IConceptDocumentProcessingProgress = {
  isProcessing: false,
  documentUuid: '',
  stage: '',
  progress: 0,
  message: '',
};

export const useConceptDocumentSocketEvents = (identifier: string) => {
  const queryClient = useQueryClient();
  const [processingProgress, setProcessingProgress] =
    useState<IConceptDocumentProcessingProgress>(DEFAULT_PROCESSING_PROGRESS);

  // Listen for document processing progress
  // NOTE: BaseOutboundMessage uses alias_generator=to_camel, so all
  // snake_case Python fields arrive as camelCase on the frontend.
  // The backend sends concept_root.identifier as the concept_uuid field value.
  useSocketEvent(
    'concept.document.processing.progress.account',
    useCallback(
      (data: IConceptDocumentProcessingProgressMessage) => {
        if (data.conceptUuid !== identifier) return;

        if (data.stage === 'completed') {
          setProcessingProgress({
            isProcessing: false,
            documentUuid: data.documentUuid || '',
            stage: 'completed',
            progress: 100,
            message: 'Document processed successfully!',
          });
          queryClient.invalidateQueries({
            queryKey: conceptDocumentKeys.trainingDocuments(identifier),
          });
          queryClient.invalidateQueries({
            queryKey: conceptDocumentKeys.evidence(identifier),
          });
        } else if (data.stage === 'failed') {
          setProcessingProgress({
            isProcessing: false,
            documentUuid: data.documentUuid || '',
            stage: 'failed',
            progress: 0,
            message: data.errorMessage || data.message || 'Processing failed',
          });
          toast.error(
            'Processing Failed',
            data.errorMessage || 'Document processing failed.',
          );
        } else {
          setProcessingProgress({
            isProcessing: true,
            documentUuid: data.documentUuid || '',
            stage: data.stage || '',
            progress: data.progress || 0,
            message: data.message || 'Processing...',
          });
        }
      },
      [identifier, queryClient],
    ),
  );

  // Listen for evidence discovered
  useSocketEvent(
    'concept.evidence.discovered.account',
    useCallback(
      (data: IConceptEvidenceDiscoveredMessage) => {
        if (data.conceptUuid !== identifier) return;

        queryClient.invalidateQueries({
          queryKey: conceptDocumentKeys.evidence(identifier),
        });
        toast.info(
          'New Evidence Found',
          data.message || 'New potential updates discovered.',
        );
      },
      [identifier, queryClient],
    ),
  );

  // Listen for processing error (defense-in-depth)
  useSocketEvent(
    'concept.document.processing.error.account',
    useCallback(
      (data: IConceptDocumentProcessingErrorMessage) => {
        if (data.conceptUuid !== identifier) return;

        setProcessingProgress({
          isProcessing: false,
          documentUuid: data.documentUuid || '',
          stage: 'failed',
          progress: 0,
          message: data.message || 'Processing failed',
        });
      },
      [identifier],
    ),
  );

  // Listen for processing completed
  useSocketEvent(
    'concept.document.processing.completed.account',
    useCallback(
      (data: IConceptDocumentProcessingCompletedMessage) => {
        if (data.conceptUuid !== identifier) return;

        queryClient.invalidateQueries({
          queryKey: conceptDocumentKeys.trainingDocuments(identifier),
        });
        queryClient.invalidateQueries({
          queryKey: conceptDocumentKeys.evidence(identifier),
        });
      },
      [identifier, queryClient],
    ),
  );

  return {
    isProcessingDocument: processingProgress.isProcessing,
    processingProgress,
  };
};
