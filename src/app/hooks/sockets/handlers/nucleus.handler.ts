import { toast } from '@components';
import { useSocketEvent } from '../aucctus';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../../query/query-keys';
import type {
  INucleusUploadProgressMessage,
  INucleusUploadCompletedMessage,
  INucleusUploadErrorMessage,
  INucleusAnswerCompletedMessage,
  INucleusAnswerErrorMessage,
} from '@libs/api/types';
import type { DocumentWithUsage } from '@libs/api/types/nucleus';

export const useNucleusHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  const queryClient = useQueryClient();

  // Upload progress — includes per-document status updates
  useSocketEvent<
    'nucleus_upload.progress.account',
    INucleusUploadProgressMessage
  >('nucleus_upload.progress.account', (message) => {
    // Per-document status update: optimistically update React Query cache
    if (message.sourceUuid && message.processingStatus) {
      queryClient.setQueryData<DocumentWithUsage[] | undefined>(
        [AucctusQueryKeys.nucleusDocuments],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((doc) =>
            doc.uuid === message.sourceUuid
              ? {
                  ...doc,
                  processingStatus:
                    message.processingStatus as DocumentWithUsage['processingStatus'],
                }
              : doc,
          );
        },
      );
    }

    if (message.stage === 'completed') {
      toast.deferred.completed('Documents Processed');
    }
  });

  // Upload completed
  useSocketEvent<
    'nucleus_upload.completed.account',
    INucleusUploadCompletedMessage
  >('nucleus_upload.completed.account', (message) => {
    const messageKey = `nucleus-completed-${message.nucleusReportUuid}-${message.uploadedCount}`;
    if (preventDuplicate(messageKey)) return;

    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusReportLatest],
    });

    // Invalidate documents to reconcile processing_status from server
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusDocuments],
    });

    toast.deferred.completed(
      `${message.uploadedCount} Document${message.uploadedCount > 1 ? 's' : ''} Uploaded`,
    );
  });

  // Upload error
  useSocketEvent<'nucleus_upload.error.account', INucleusUploadErrorMessage>(
    'nucleus_upload.error.account',
    (message) => {
      const messageKey = `nucleus-error-${message.nucleusReportUuid || 'unknown'}-${message.errorCode || message.message}`;
      if (preventDuplicate(messageKey)) return;

      // Invalidate documents to get updated failed status
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.nucleusDocuments],
      });

      toast.deferred.error(
        'Document Upload Failed',
        message.message || 'Please try uploading your documents again',
      );
    },
  );

  // Answer completed
  useSocketEvent<
    'nucleus_answer.completed.account',
    INucleusAnswerCompletedMessage
  >('nucleus_answer.completed.account', (message) => {
    const messageKey = `nucleus-answer-completed-${message.questionUuid}-${message.answerUuid}`;
    if (preventDuplicate(messageKey)) return;
  });

  // Answer error (no-op)
  useSocketEvent<'nucleus_answer.error.account', INucleusAnswerErrorMessage>(
    'nucleus_answer.error.account',
    () => {
      return;
    },
  );
};
